import { NextResponse } from "next/server"
import { inquiryPayload, inquirySchema, sameOrigin } from "@/lib/intake/contracts"
import { enqueueIntake } from "@/lib/intake/server"

export async function POST(request: Request) {
  if (!sameOrigin(request, process.env.CC_SITE_ORIGIN)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "JSON is required." }, { status: 415 })
  }
  if (Number(request.headers.get("content-length") || 0) > 12000) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 })
  }
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 12000) return NextResponse.json({ error: "Request is too large." }, { status: 413 })
    let json: unknown
    try { json = JSON.parse(text) } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }) }
    const parsed = inquirySchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Please check your name, email, message and consent choices." }, { status: 400 })
    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) return NextResponse.json({ error: "Online intake is temporarily unavailable. Please try again later." }, { status: 503 })
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: parsed.data.captchaToken }),
      signal: AbortSignal.timeout(8000),
    })
    if (!check.ok) throw new Error("CAPTCHA_UNAVAILABLE")
    const verification = await check.json()
    if (!verification.success || verification.action !== "cc-intake" ||
        verification.hostname !== new URL(request.url).hostname) {
      return NextResponse.json({ error: "Please complete the security check again." }, { status: 400 })
    }
    const record = await enqueueIntake(`inquiry:${parsed.data.requestId}`, "inquiry", inquiryPayload(parsed.data))
    return NextResponse.json({
      received: true, reference: record.id,
      message: "Your request is saved for team review. This is not a funding approval or a confirmation that a message has been sent.",
    }, { status: 202, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const code = error instanceof Error ? error.message : ""
    if (code === "RATE_LIMIT") return NextResponse.json({ error: "Please wait a few minutes before submitting another request." }, { status: 429 })
    if (code === "IDEMPOTENCY_CONFLICT") return NextResponse.json({ error: "This request was already submitted with different details. Refresh before starting a new request." }, { status: 409 })
    return NextResponse.json({ error: "We couldn't confirm that your request was saved. Please retry with the same details." }, { status: 503 })
  }
}
