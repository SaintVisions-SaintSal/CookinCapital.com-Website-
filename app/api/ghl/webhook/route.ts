import { type NextRequest, NextResponse } from "next/server"

// This endpoint receives webhooks FROM GHL
// Your Private Integration "Saint Vision API - Outbound Webhook" sends data here
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log incoming webhook for debugging
    console.log("[GHL Webhook] Received:", JSON.stringify(body, null, 2))

    // Extract event type and data
    const { type, contact, customData, workflow } = body

    // Handle different webhook events from GHL
    switch (type) {
      case "contact.create":
      case "contact.update":
        // New contact or update from GHL
        console.log("[GHL Webhook] Contact event:", contact?.email, contact?.firstName)
        break

      case "opportunity.create":
      case "opportunity.update":
        // Deal/opportunity event
        console.log("[GHL Webhook] Opportunity event:", body.opportunity?.name)
        break

      case "workflow.trigger":
        // Workflow triggered - could be used for SaintSal automation
        console.log("[GHL Webhook] Workflow trigger:", workflow?.name)
        break

      default:
        console.log("[GHL Webhook] Unknown event type:", type)
    }

    // Always return success to GHL
    return NextResponse.json({
      success: true,
      message: "Webhook received",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[GHL Webhook] Error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}

// Also handle GET for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "GHL Webhook Receiver",
    version: "1.0",
  })
}
