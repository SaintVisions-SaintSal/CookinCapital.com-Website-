// Run only against the isolated local build. All external network requests are intercepted.
const { chromium } = require("playwright")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

async function main() {
  const base = process.env.QA_BASE_URL || "http://127.0.0.1:3001"
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const screenshots = process.env.QA_SCREENSHOTS || "/home/user/workspace/cc-qa"
  fs.mkdirSync(screenshots, { recursive: true })
  const sent = [], results = []
  let intakeFailure = false
  await context.route("**/*", async route => {
    const url = route.request().url()
    if (url.includes("challenges.cloudflare.com/turnstile/v0/api.js")) {
      return route.fulfill({ contentType: "application/javascript", body: `window.turnstile={render:(el,opts)=>{el.textContent="Isolated QA security-check fixture";window._qaCaptcha=opts.callback;opts.callback("qa-token");return "qa-widget"},reset:()=>window._qaCaptcha?.("qa-token"),remove:()=>{}};` })
    }
    if (url.startsWith("https://cc-auth-test.invalid")) {
      sent.push({ url, body: route.request().postDataJSON() })
      if (url.includes("/signup")) return route.fulfill({ json: { id: "qa-user", email: "qa@example.com", identities: [], app_metadata: {}, user_metadata: {} } })
      if (url.includes("/recover")) return route.fulfill({ json: {} })
      return route.fulfill({ status: 400, json: { error: "invalid_grant", error_description: "Invalid login credentials" } })
    }
    if (url === base + "/api/intake") {
      sent.push({ url, body: route.request().postDataJSON() })
      return route.fulfill(intakeFailure
        ? { status: 503, json: { error: "Isolated QA: request could not be saved. Retry with the same details." } }
        : { status: 202, json: { received: true, reference: "qa-receipt-not-live" } })
    }
    if (url.startsWith(base + "/")) return route.continue()
    return route.abort()
  })
  const page = await context.newPage()
  const check = async (name, run) => { await run(); results.push({ name, pass: true }); console.log("PASS", name) }
  try {
    await check("desktop inquiry with optional consent and genuine legal links", async () => {
      await page.goto(base + "/prequal")
      await page.getByRole("button", { name: "Send request" }).waitFor()
      await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled)
      assert.equal(await page.locator('input[type="checkbox"]:checked').count(), 0)
      assert.equal(await page.getByRole("link", { name: "Privacy Policy" }).getAttribute("href"), "/help?doc=privacy")
      assert.equal(await page.locator('a[href*="example.com"]').count(), 0)
      await page.screenshot({ path: path.join(screenshots, "intake-desktop.png"), fullPage: true })
    })
    await check("mobile inquiry fits the viewport", async () => {
      await page.setViewportSize({ width: 375, height: 900 })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.screenshot({ path: path.join(screenshots, "intake-mobile.png"), fullPage: true })
    })
    await check("failed intake is visible and retry preserves request identity", async () => {
      await page.getByLabel("Full name", { exact: true }).fill("QA Operator")
      await page.getByLabel("Email", { exact: true }).fill("qa@example.com")
      await page.getByLabel("A little about your request").fill("Isolated QA request. No real contact or message.")
      await page.locator('input[name="privacyAccepted"]').check()
      intakeFailure = true
      await page.getByRole("button", { name: "Send request" }).click()
      await page.getByRole("alert").filter({ hasText: "Isolated QA" }).waitFor()
      intakeFailure = false
      await page.getByRole("button", { name: "Send request" }).click()
      await page.getByText("Your request is saved.", { exact: true }).waitFor()
      const requests = sent.filter(x => x.url.endsWith("/api/intake"))
      assert.equal(requests.length, 2)
      assert.equal(requests[0].body.requestId, requests[1].body.requestId)
      assert.equal(requests[0].body.smsConsent, false)
      await page.screenshot({ path: path.join(screenshots, "intake-mocked-success.png"), fullPage: true })
    })
    await check("signup targets the callback and confirmation screen", async () => {
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.goto(base + "/auth/sign-up?next=https://evil.example")
      await page.getByLabel("Full Name", { exact: true }).fill("QA Operator")
      await page.getByLabel("Email", { exact: true }).fill("qa@example.com")
      await page.getByLabel("Password", { exact: true }).fill("qa-only-password-123")
      await page.getByLabel("Confirm Password").fill("qa-only-password-123")
      await page.screenshot({ path: path.join(screenshots, "signup-desktop.png"), fullPage: true })
      await page.getByRole("button", { name: "Create Account" }).click()
      await page.waitForURL("**/auth/sign-up-success")
      const request = sent.find(x => x.url.includes("/signup"))
      const redirect = new URL(new URL(request.url).searchParams.get("redirect_to"))
      assert.equal(redirect.pathname, "/auth/callback")
      assert.equal(redirect.searchParams.get("next"), "/research")
    })
    await check("recovery request uses a recovery callback and non-enumerating confirmation", async () => {
      await page.goto(base + "/auth/forgot-password")
      await page.getByLabel("Email", { exact: true }).fill("qa@example.com")
      await page.screenshot({ path: path.join(screenshots, "recovery-desktop.png"), fullPage: true })
      await page.getByRole("button", { name: "Request recovery link" }).click()
      await page.getByRole("status").filter({ hasText: "If this email is registered" }).waitFor()
      const request = sent.find(x => x.url.includes("/recover"))
      assert.equal(new URL(new URL(request.url).searchParams.get("redirect_to")).searchParams.get("flow"), "recovery")
    })
    await check("reset rejects mismatched passwords and expired session", async () => {
      await page.goto(base + "/auth/reset-password")
      await page.getByLabel("New password", { exact: true }).fill("qa-only-password-123")
      await page.getByLabel("Confirm password", { exact: true }).fill("qa-only-password-456")
      await page.getByRole("button", { name: "Update password" }).click()
      await page.getByRole("alert").filter({ hasText: "both passwords match" }).waitFor()
      await page.getByLabel("Confirm password", { exact: true }).fill("qa-only-password-123")
      await page.getByRole("button", { name: "Update password" }).click()
      await page.getByRole("alert").filter({ hasText: "session has expired" }).waitFor()
    })
    await check("mobile recovery fits and links back to login", async () => {
      await page.setViewportSize({ width: 375, height: 900 })
      await page.goto(base + "/auth/forgot-password")
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      assert.equal(await page.getByRole("link", { name: "Back to sign in" }).getAttribute("href"), "/auth/login")
      await page.screenshot({ path: path.join(screenshots, "recovery-mobile.png"), fullPage: true })
    })
    await check("mobile header Get SAL goes to signup", async () => {
      await page.goto(base + "/")
      await page.getByRole("button", { name: "Toggle menu" }).click()
      const link = page.getByRole("link", { name: "Get SAL" }).filter({ visible: true })
      assert.equal(await link.getAttribute("href"), "/auth/sign-up")
    })
    fs.writeFileSync(path.join(screenshots, "browser-results.json"), JSON.stringify({ mockExternalServices: true, results }, null, 2))
  } catch (error) {
    console.error("QA PAGE", page.url(), (await page.locator("body").innerText()).slice(-4500))
    console.error("QA MOCK REQUESTS", sent)
    console.error("INVALID INPUTS", await page.locator(":invalid").evaluateAll(nodes => nodes.map(n => ({ id: n.id, name: n.name, message: n.validationMessage }))))
    throw error
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exit(1) })
