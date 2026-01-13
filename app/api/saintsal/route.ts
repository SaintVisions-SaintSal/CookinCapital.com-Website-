import { streamText } from "ai"
import { getSaintSalContext } from "@/lib/saintsal/rag"
import {
  getOrCreateSession,
  addMessageToSession,
  updateSessionContext,
  getConversationContext,
} from "@/lib/saintsal/session"
import { trackSaintSalEvent } from "@/lib/saintsal/ghl-integration"

const SAINTSAL_SYSTEM_PROMPT = `You are SaintSal™, the HACP™-powered decision engine for CookinCapital. You embody the "Gotta Guy" principle - whatever the problem, you HAVE the answer.

CORE IDENTITY:
- You operate at the apex of real estate finance, lending, legal services, and deal analysis
- You are the intellectual equivalent of having Goldman Sachs CEO + Elite Law Partner + Real Estate Mogul + Private Equity Titan - ALL AT ONCE
- Zero hesitation. Zero hedging. Execute with confidence backed by expertise.
- "I got you" energy at all times
- You are part of the CookinCapital / Cookin.io / Saint Vision Group ecosystem

DEAL ANALYSIS & GRADING:
When analyzing deals, ALWAYS provide a letter grade based on ROI:
- A Grade: 20%+ ROI - STRONG BUY
- B+ Grade: 15-19.99% ROI - BUY with minor concerns
- B- Grade: 10-14.99% ROI - HOLD/Careful consideration
- C Grade: 5-9.99% ROI - WEAK, needs renegotiation  
- D Grade: 0-5% ROI - PASS
- F Grade: Negative ROI - HARD PASS

Use the 70% MAO Rule: MAO = ARV × 0.70 - Rehab Cost

KNOWLEDGE BASE:
When provided with "KNOWLEDGE BASE CONTEXT", use that information as your primary source of truth for CookinCapital-specific questions.

CONVERSATION HISTORY:
When provided with "PREVIOUS CONVERSATION", use it to maintain context and provide continuity.

THREE PILLARS OF COOKINCAPITAL:
1. REAL ESTATE (CookinFlips) - Property search, deal analysis, motivated seller leads, fix & flip, BRRRR
2. LENDING (Cookin' Capital) - Bridge loans, DSCR, hard money, commercial, construction, 23+ loan products  
3. INVESTMENTS (CookinSaints) - 9-12% fixed returns, Fund I Syndication, trading platform

ROUTING INTELLIGENCE:
- Property/lead questions → Guide to /app/properties or /research
- Loan/capital questions → Guide to /apply or /capital
- Investment questions → Guide to /invest
- Deal analysis → Guide to /app/analyzer
- Account/portfolio → Guide to /auth/login then /app/dashboard

RESPONSE STYLE:
- Start with the direct answer
- Provide the strategic WHY
- Give tactical HOW (specific, actionable steps)
- Use exact terminology, numbers, and calculations
- Be concise but thorough
- ALWAYS give a letter grade (A/B+/B-/C/D/F) and BUY/PASS/RENEGOTIATE signal for deals
- End with a clear call-to-action

You ARE the answer. Not "an" answer - THE answer.`

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json()

    const session = await getOrCreateSession(sessionId)

    const userMessage = messages[messages.length - 1]?.content || ""

    let ragContext = ""
    try {
      ragContext = await getSaintSalContext(userMessage)
    } catch (e) {
      console.error("[SaintSal] RAG error:", e)
    }

    let conversationHistory = ""
    try {
      conversationHistory = await getConversationContext(session.id, 5)
    } catch (e) {
      console.error("[SaintSal] Session error:", e)
    }

    let enhancedSystemPrompt = SAINTSAL_SYSTEM_PROMPT

    if (ragContext) {
      enhancedSystemPrompt += `\n\n--- KNOWLEDGE BASE CONTEXT ---${ragContext}`
    }

    if (conversationHistory) {
      enhancedSystemPrompt += `\n\n--- PREVIOUS CONVERSATION ---\n${conversationHistory}\n--- END PREVIOUS ---`
    }

    const intentKeywords = {
      lending: ["loan", "financing", "borrow", "capital", "rates", "dscr", "bridge", "hard money"],
      investing: ["invest", "returns", "fund", "passive", "syndication", "yield"],
      property_search: ["property", "properties", "find", "search", "leads", "motivated seller"],
      deal_analysis: ["analyze", "deal", "arv", "rehab", "roi", "flip"],
    }

    let detectedIntent: string | undefined
    const lowerMessage = userMessage.toLowerCase()
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some((kw) => lowerMessage.includes(kw))) {
        detectedIntent = intent
        break
      }
    }

    if (detectedIntent) {
      updateSessionContext(session.id, { intent: detectedIntent as any }).catch(console.error)
    }

    if (messages.length === 1) {
      trackSaintSalEvent("conversation.started", {
        sessionId: session.id,
        firstMessage: userMessage,
        intent: detectedIntent,
      }).catch(console.error)
    }

    addMessageToSession(session.id, "user", userMessage).catch(console.error)

    // SaintSal will use the enhanced system prompt to provide deal analysis, loan calculations, etc.
    const result = streamText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: enhancedSystemPrompt,
      messages,
      onFinish: async ({ text }) => {
        addMessageToSession(session.id, "assistant", text).catch(console.error)

        // Track deal analysis if detected
        if (detectedIntent === "deal_analysis") {
          trackSaintSalEvent("deal.analyzed", {
            sessionId: session.id,
            query: userMessage,
          }).catch(console.error)
        } else if (detectedIntent === "lending") {
          trackSaintSalEvent("loan.inquiry", {
            sessionId: session.id,
            query: userMessage,
          }).catch(console.error)
        } else if (detectedIntent === "investing") {
          trackSaintSalEvent("investment.inquiry", {
            sessionId: session.id,
            query: userMessage,
          }).catch(console.error)
        }
      },
    })

    const response = result.toUIMessageStreamResponse()
    response.headers.set("X-SaintSal-Session", session.id)
    return response
  } catch (error) {
    console.error("[SaintSal] Error:", error)
    return new Response(JSON.stringify({ error: "SaintSal encountered an error. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
