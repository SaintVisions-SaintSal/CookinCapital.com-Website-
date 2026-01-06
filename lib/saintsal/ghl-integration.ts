// SaintSal GHL Integration - Helper functions for sending data to GoHighLevel

const SAINTSAL_WEBHOOK_URL = "/api/saintsal/webhook"

interface LeadCaptureData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  source?: string
  query?: string
  intent?: string
  propertyAddress?: string
  customFields?: Record<string, any>
}

interface DealAnalysisData {
  propertyAddress: string
  propertyType: string
  purchasePrice: number
  arv: number
  loanAmount: number
  signal: string
  confidence: number
  rating: string
  recommendations?: string[]
  userEmail?: string
  userName?: string
}

// Capture a lead from any source
export async function captureLeadToGHL(data: LeadCaptureData) {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "lead.captured",
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("[GHL Integration] Lead capture failed:", error)
    return false
  }
}

// Send deal analysis to GHL
export async function sendDealAnalysisToGHL(data: DealAnalysisData) {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "deal.analyzed",
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("[GHL Integration] Deal analysis send failed:", error)
    return false
  }
}

// Track loan inquiry
export async function trackLoanInquiry(data: {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  loanAmount?: number
  loanType?: string
  propertyAddress?: string
}) {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "loan.inquiry",
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("[GHL Integration] Loan inquiry tracking failed:", error)
    return false
  }
}

// Track investment inquiry
export async function trackInvestmentInquiry(data: {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  investmentAmount?: number
  investmentType?: string
}) {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "investment.inquiry",
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("[GHL Integration] Investment inquiry tracking failed:", error)
    return false
  }
}

// Track saved property
export async function trackPropertySaved(data: {
  email?: string
  propertyAddress: string
  propertyType?: string
  askingPrice?: number
  saintSalRating?: string
}) {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "property.saved",
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("[GHL Integration] Property save tracking failed:", error)
    return false
  }
}

// Track conversation started
export async function trackConversationStarted(data: {
  conversationId: string
  query: string
  userEmail?: string
  source?: string
}) {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "conversation.started",
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("[GHL Integration] Conversation tracking failed:", error)
    return false
  }
}

export async function trackSaintSalEvent(eventType: string, data: Record<string, any>): Promise<boolean> {
  try {
    const response = await fetch(SAINTSAL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error(`[GHL Integration] Event tracking failed (${eventType}):`, error)
    return false
  }
}
