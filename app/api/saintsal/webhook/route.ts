import { type NextRequest, NextResponse } from "next/server"

// SaintSal GHL Webhook - sends leads and data to GoHighLevel
const SAINTSAL_GHL_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/oRA8vL3OSiCPjpwmEC0V/webhook-trigger/1d61a7ca-4089-4c68-bb3d-d9e6a1568231"

interface LeadData {
  // Contact Info
  firstName?: string
  lastName?: string
  email?: string
  phone?: string

  // Lead Source
  source?: string
  campaign?: string
  medium?: string

  // Deal Info
  propertyAddress?: string
  propertyType?: string
  dealType?: string
  loanAmount?: number
  purchasePrice?: number
  arv?: number

  // SaintSal Analysis
  saintSalSignal?: string
  saintSalConfidence?: number
  saintSalRating?: string
  saintSalRecommendations?: string[]

  // Conversation Context
  conversationId?: string
  query?: string
  intent?: string

  // Custom Fields
  customFields?: Record<string, any>
}

// Send lead to GHL via SaintSal webhook
async function sendToGHL(data: LeadData & { eventType: string }) {
  try {
    const payload = {
      event_type: data.eventType,
      timestamp: new Date().toISOString(),

      // Contact
      first_name: data.firstName || "",
      last_name: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",

      // Source tracking
      source: data.source || "SaintSal AI",
      campaign: data.campaign || "Platform",
      medium: data.medium || "AI Chat",

      // Property/Deal
      property_address: data.propertyAddress || "",
      property_type: data.propertyType || "",
      deal_type: data.dealType || "",
      loan_amount: data.loanAmount || 0,
      purchase_price: data.purchasePrice || 0,
      arv: data.arv || 0,

      // SaintSal Intelligence
      saintsal_signal: data.saintSalSignal || "",
      saintsal_confidence: data.saintSalConfidence || 0,
      saintsal_rating: data.saintSalRating || "",
      saintsal_recommendations: data.saintSalRecommendations?.join("; ") || "",

      // Conversation
      conversation_id: data.conversationId || "",
      query: data.query || "",
      intent: data.intent || "",

      // Custom fields as JSON
      custom_data: JSON.stringify(data.customFields || {}),
    }

    console.log("[SaintSal Webhook] Sending to GHL:", data.eventType)

    const response = await fetch(SAINTSAL_GHL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error("[SaintSal Webhook] GHL error:", response.status)
      return { success: false, status: response.status }
    }

    console.log("[SaintSal Webhook] GHL success")
    return { success: true }
  } catch (error) {
    console.error("[SaintSal Webhook] Error:", error)
    return { success: false, error }
  }
}

// POST - Receive events from CookinCap platform and forward to GHL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, ...data } = body

    console.log("[SaintSal Webhook] Received event:", eventType)

    // Route different event types
    switch (eventType) {
      case "lead.captured":
        // New lead from research, property search, or chat
        await sendToGHL({
          eventType: "new_lead",
          ...data,
        })
        break

      case "deal.analyzed":
        // Deal analyzer completed
        await sendToGHL({
          eventType: "deal_analyzed",
          saintSalSignal: data.signal,
          saintSalConfidence: data.confidence,
          saintSalRating: data.rating,
          ...data,
        })
        break

      case "loan.inquiry":
        // User interested in a loan
        await sendToGHL({
          eventType: "loan_inquiry",
          dealType: "Loan Inquiry",
          ...data,
        })
        break

      case "investment.inquiry":
        // User interested in investing
        await sendToGHL({
          eventType: "investment_inquiry",
          dealType: "Investment Inquiry",
          ...data,
        })
        break

      case "property.saved":
        // User saved a property
        await sendToGHL({
          eventType: "property_saved",
          ...data,
        })
        break

      case "conversation.started":
        // User started a conversation with SaintSal
        await sendToGHL({
          eventType: "conversation_started",
          ...data,
        })
        break

      case "application.started":
        // User started an application
        await sendToGHL({
          eventType: "application_started",
          ...data,
        })
        break

      default:
        // Generic event
        await sendToGHL({
          eventType: eventType || "unknown",
          ...data,
        })
    }

    return NextResponse.json({
      success: true,
      message: "Event processed",
      eventType,
    })
  } catch (error) {
    console.error("[SaintSal Webhook] Error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "SaintSal GHL Webhook",
    version: "1.0",
    webhook: "Connected to GHL",
  })
}
