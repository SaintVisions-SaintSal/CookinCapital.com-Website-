const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const Module = require("node:module")
const ts = require("typescript")

function loadTypeScript(relative) {
  const filename = path.resolve(__dirname, "..", relative)
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const loaded = new Module(filename, module)
  loaded.filename = filename
  loaded.paths = Module._nodeModulePaths(path.dirname(filename))
  loaded._compile(compiled, filename)
  return loaded.exports
}

const { safeNext, authMessage } = loadTypeScript("lib/auth-flow.ts")
const { inquirySchema, inquiryPayload, workflowURL, forwardEvent, sameOrigin } = loadTypeScript("lib/intake/contracts.ts")

for (const invalid of [null, "", "https://evil.example", "//evil.example", "/\\evil.example", "/%2f%2fevil.example",
  "/auth/callback", "/api/intake", "/operations/intake", "/\nevil"]) {
  test(`redirect rejects ${JSON.stringify(invalid)}`, () => assert.equal(safeNext(invalid), "/research"))
}
test("redirect preserves an app destination and query", () => assert.equal(safeNext("/app/library?tab=saved"), "/app/library?tab=saved"))
test("network failure has a recovery path without leaking internals", () => {
  assert.match(authMessage(new Error("Failed to fetch")), /temporarily unavailable/)
  assert.doesNotMatch(authMessage(new Error("internal-secret")), /internal-secret/)
})

const input = {
  requestId: "17c229e0-8d56-408f-b69c-0aa1dc541a8c",
  fullName: " Test Operator ", email: "TEST@EXAMPLE.COM",
  purpose: "capital", message: "I would like to discuss a property.",
  privacyAccepted: true, captchaToken: "isolated-test-token",
}
test("minimal inquiry normalizes identity and does not infer SMS consent", () => {
  const parsed = inquirySchema.parse(input)
  assert.equal(parsed.email, "test@example.com")
  assert.equal(parsed.fullName, "Test Operator")
  assert.equal(parsed.smsConsent, false)
  assert.equal(inquiryPayload(parsed).marketingConsent, false)
})
test("phone is optional for email-only inquiries", () => assert.equal(inquirySchema.parse(input).phone, ""))
test("SMS consent without phone fails", () => assert.equal(inquirySchema.safeParse({ ...input, smsConsent: true }).success, false))
test("invalid international phone fails", () => assert.equal(inquirySchema.safeParse({ ...input, phone: "555" }).success, false))
test("optional SMS consent is captured separately from marketing", () => {
  const value = inquiryPayload(inquirySchema.parse({ ...input, phone: "+19495550123", smsConsent: true }))
  assert.equal(value.smsConsent, true)
  assert.equal(value.marketingConsent, false)
  assert.match(value.consentText, /not a condition/)
})
test("honeypot fails", () => assert.equal(inquirySchema.safeParse({ ...input, website: "spam" }).success, false))
test("unreviewed fields cannot override routing", () => assert.equal(inquirySchema.safeParse({ ...input, assignedTo: "attacker" }).success, false))
test("consent and CAPTCHA are required", () => {
  assert.equal(inquirySchema.safeParse({ ...input, privacyAccepted: false }).success, false)
  assert.equal(inquirySchema.safeParse({ ...input, captchaToken: "" }).success, false)
})
test("request UUID and bounded message required", () => {
  assert.equal(inquirySchema.safeParse({ ...input, requestId: "bad" }).success, false)
  assert.equal(inquirySchema.safeParse({ ...input, message: "a".repeat(2001) }).success, false)
})
test("origin must match exactly", () => {
  assert.equal(sameOrigin(new Request("https://cc.example/api/intake", { headers: { origin: "https://cc.example" } })), true)
  assert.equal(sameOrigin(new Request("https://cc.example/api/intake", { headers: { origin: "https://evil.example" } })), false)
  assert.equal(sameOrigin(new Request("https://cc.example/api/intake")), false)
})
test("workflow URL is restricted to the configured GHL location", () => {
  const url = "https://services.leadconnectorhq.com/hooks/location/webhook-trigger/abc-123"
  assert.equal(workflowURL(url, "location"), url)
  for (const invalid of [url.replace("https:", "http:"), url.replace("location/", "other/"),
    url.replace("services.", "evil."), `${url}?token=bad`, `${url}#fragment`, "https://127.0.0.1/"]) {
    assert.equal(workflowURL(invalid, "location"), null)
  }
})
const event = {
  id: input.requestId, event_type: "inquiry", payload: inquiryPayload(inquirySchema.parse(input)),
  created_at: "2026-09-29T00:00:00.000Z",
}
test("HTTP acceptance is not described as a completed CRM contact", async () => {
  let body
  const result = await forwardEvent("https://test.invalid", event, async (_url, init) => {
    body = JSON.parse(init.body)
    assert.equal(init.headers["Idempotency-Key"], event.id)
    assert.equal(init.redirect, "error")
    return new Response("", { status: 202 })
  })
  assert.deepEqual(result, { accepted: true, errorCode: null })
  assert.equal(body.create_lending_opportunity, true)
  assert.equal(body.consent.marketing, false)
})
test("account signup does not create a lending opportunity", async () => {
  await forwardEvent("https://test.invalid", { ...event, event_type: "signup" }, async (_url, init) => {
    assert.equal(JSON.parse(init.body).create_lending_opportunity, false)
    return new Response("", { status: 200 })
  })
})
test("GHL failures are failures, not success", async () => {
  assert.deepEqual(await forwardEvent("https://test.invalid", event, async () => new Response("", { status: 429 })),
    { accepted: false, errorCode: "GHL_HTTP_429" })
})
test("network ambiguity is reviewable instead of blindly retried", async () => {
  assert.deepEqual(await forwardEvent("https://test.invalid", event, async () => { throw new Error("timeout") }),
    { accepted: false, errorCode: "DELIVERY_UNCERTAIN" })
})
