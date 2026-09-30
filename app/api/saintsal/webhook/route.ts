import { NextResponse } from "next/server"
import { activityTypes, trackServerEvent } from "@/lib/saintsal/ghl-server"
import { sameOrigin } from "@/lib/intake/contracts"

export async function POST(request: Request) {
  if (!sameOrigin(request, process.env.CC_SITE_ORIGIN)) return NextResponse.json({ success: false, error: "Origin not allowed." }, { status: 403 })
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 12000) return NextResponse.json({ success: false, error: "Payload too large." }, { status: 413 })
    let body
    try { body = JSON.parse(text) } catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }) }
    if (!body || !activityTypes.has(body.eventType)) return NextResponse.json({ success: false, error: "Unsupported event." }, { status: 400 })
    const result = await trackServerEvent(body.eventType, body)
    if (!result) return NextResponse.json({ success: false, error: "Sign in to save account activity." }, { status: 401 })
    return NextResponse.json({ success: true, delivery: "queued", reference: result.id }, { status: 202 })
  } catch (error) {
    const rateLimited = error instanceof Error && error.message === "RATE_LIMIT"
    return NextResponse.json({ success: false, error: "Activity could not be queued." }, { status: rateLimited ? 429 : 503 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "receiver_available",
    delivery: "Not verified by this health response. CRM completion requires a workflow receipt.",
  }, { headers: { "Cache-Control": "no-store" } })
}
