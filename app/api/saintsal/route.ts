import { streamText, tool } from "ai"
import { z } from "zod"
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

KNOWLEDGE BASE:
When provided with "KNOWLEDGE BASE CONTEXT", use that information as your primary source of truth for CookinCapital-specific questions. This is your internal knowledge that you should reference confidently.

CONVERSATION HISTORY:
When provided with "PREVIOUS CONVERSATION", use it to maintain context and provide continuity in the conversation. Remember what the user has discussed before.

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
- Start with the direct answer (no throat-clearing or disclaimers)
- Provide the strategic WHY
- Give tactical HOW (specific, actionable steps)
- Use exact terminology, numbers, and calculations
- Be concise but thorough
- Always give a clear BUY / PASS / RENEGOTIATE signal when analyzing deals
- End with a clear call-to-action or next step
- When users are ready to proceed, guide them to the right page

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

    if (!process.env.XAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "AI service not configured. Please add XAI_API_KEY or ANTHROPIC_API_KEY to your environment variables.",
          sessionId: session.id,
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      )
    }

    const result = streamText({
      model: process.env.XAI_API_KEY ? "xai/grok-beta" : "anthropic/claude-sonnet-4-20250514",
      system: enhancedSystemPrompt,
      messages,
      tools: {
        analyzeDeal: tool({
          description: "Analyze a real estate deal with comprehensive financial metrics and risk assessment",
          parameters: z.object({
            purchasePrice: z.number().describe("Purchase price in dollars"),
            arv: z.number().describe("After Repair Value in dollars"),
            rehabCost: z.number().describe("Total rehab/renovation cost in dollars"),
            holdingCosts: z.number().optional().describe("Monthly holding costs"),
            holdingPeriod: z.number().optional().describe("Expected holding period in months"),
            closingCosts: z.number().optional().describe("Total closing costs as percentage"),
            sellingCosts: z.number().optional().describe("Selling costs as percentage"),
            propertyType: z.string().optional().describe("Property type"),
            strategy: z.enum(["flip", "brrrr", "hold", "wholesale"]).optional().describe("Investment strategy"),
          }),
          execute: async ({
            purchasePrice,
            arv,
            rehabCost,
            holdingCosts = 0,
            holdingPeriod = 6,
            closingCosts = 3,
            sellingCosts = 6,
            propertyType = "SFR",
            strategy = "flip",
          }) => {
            const mao = arv * 0.7 - rehabCost
            const meetsMAO = purchasePrice <= mao
            const buyClosing = purchasePrice * (closingCosts / 100)
            const sellClosing = arv * (sellingCosts / 100)
            const totalHolding = holdingCosts * holdingPeriod
            const totalInvestment = purchasePrice + rehabCost + buyClosing + totalHolding
            const grossProfit = arv - totalInvestment - sellClosing
            const roi = (grossProfit / totalInvestment) * 100

            let riskLevel = "LOW"
            const riskFlags: string[] = []
            if (!meetsMAO) {
              riskFlags.push("Does NOT meet 70% MAO rule")
              riskLevel = "HIGH"
            }
            if (rehabCost / arv > 0.3) {
              riskFlags.push("Heavy rehab (>30% of ARV)")
              riskLevel = riskLevel === "HIGH" ? "HIGH" : "MEDIUM"
            }
            if (roi < 15) {
              riskFlags.push("ROI below 15%")
            }

            let signal = "BUY"
            let confidence = 85
            if (riskLevel === "HIGH" || roi < 10) {
              signal = "PASS"
              confidence = 90
            } else if (riskLevel === "MEDIUM" || roi < 20) {
              signal = "RENEGOTIATE"
              confidence = 75
            }

            trackSaintSalEvent("deal.analyzed", {
              sessionId: session.id,
              purchasePrice,
              arv,
              rehabCost,
              roi: roi.toFixed(1),
              signal,
            }).catch(console.error)

            return {
              signal,
              confidence: confidence + "%",
              riskLevel,
              propertyType,
              strategy,
              metrics: {
                purchasePrice: "$" + purchasePrice.toLocaleString(),
                arv: "$" + arv.toLocaleString(),
                rehabCost: "$" + rehabCost.toLocaleString(),
                mao: "$" + Math.round(mao).toLocaleString(),
                meetsMAO,
                totalInvestment: "$" + Math.round(totalInvestment).toLocaleString(),
                grossProfit: "$" + Math.round(grossProfit).toLocaleString(),
                roi: roi.toFixed(1) + "%",
              },
              riskFlags: riskFlags.length > 0 ? riskFlags : ["No major red flags identified"],
              recommendation:
                signal === "BUY"
                  ? `EXECUTE. Strong ${strategy} opportunity with ${roi.toFixed(1)}% ROI.`
                  : signal === "PASS"
                    ? `PASS. Risk/return profile unfavorable.`
                    : `RENEGOTIATE to $${Math.round(mao).toLocaleString()} to meet MAO.`,
              nextSteps:
                signal === "BUY"
                  ? ["Lock up contract", "Apply for financing at /apply", "Order inspections"]
                  : signal === "RENEGOTIATE"
                    ? ["Counter at MAO price", "Use Deal Analyzer at /app/analyzer"]
                    : ["Move to next deal", "Search more at /app/properties"],
            }
          },
        }),

        calculateLoanPayment: tool({
          description: "Calculate loan payment details for various financing scenarios",
          parameters: z.object({
            loanAmount: z.number().describe("Loan principal amount"),
            interestRate: z.number().describe("Annual interest rate as percentage"),
            termMonths: z.number().describe("Loan term in months"),
            points: z.number().optional().describe("Origination points"),
            loanType: z.enum(["interest_only", "amortizing"]).optional(),
            loanProduct: z.string().optional(),
          }),
          execute: async ({
            loanAmount,
            interestRate,
            termMonths,
            points = 2,
            loanType = "interest_only",
            loanProduct = "bridge",
          }) => {
            const monthlyRate = interestRate / 100 / 12
            const originationFee = loanAmount * (points / 100)
            let monthlyPayment: number
            let totalInterest: number

            if (loanType === "interest_only") {
              monthlyPayment = loanAmount * monthlyRate
              totalInterest = monthlyPayment * termMonths
            } else {
              monthlyPayment =
                (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
                (Math.pow(1 + monthlyRate, termMonths) - 1)
              totalInterest = monthlyPayment * termMonths - loanAmount
            }

            const totalCostOfCapital = originationFee + totalInterest
            const effectiveAnnualRate = (totalCostOfCapital / loanAmount) * (12 / termMonths) * 100

            trackSaintSalEvent("loan.inquiry", {
              sessionId: session.id,
              loanAmount,
              interestRate,
              loanProduct,
            }).catch(console.error)

            return {
              loanProduct,
              loanAmount: "$" + loanAmount.toLocaleString(),
              interestRate: interestRate + "%",
              termMonths,
              loanType,
              points: points + " points",
              breakdown: {
                monthlyPayment: "$" + Math.round(monthlyPayment).toLocaleString(),
                originationFee: "$" + Math.round(originationFee).toLocaleString(),
                totalInterest: "$" + Math.round(totalInterest).toLocaleString(),
                totalCostOfCapital: "$" + Math.round(totalCostOfCapital).toLocaleString(),
                effectiveRate: effectiveAnnualRate.toFixed(2) + "% annualized",
              },
              nextStep: "Apply for a rate quote at /apply",
            }
          },
        }),

        getInvestmentReturns: tool({
          description: "Calculate expected returns for CookinCapital Fund investment",
          parameters: z.object({
            investmentAmount: z.number().describe("Investment amount in dollars"),
            investmentPeriod: z.number().optional().describe("Investment period in years"),
          }),
          execute: async ({ investmentAmount, investmentPeriod = 1 }) => {
            let tier: string, rate: number
            if (investmentAmount >= 250001) {
              tier = "Platinum"
              rate = 12
            } else if (investmentAmount >= 50001) {
              tier = "Gold"
              rate = 10
            } else {
              tier = "Silver"
              rate = 9
            }

            const annualReturn = investmentAmount * (rate / 100)
            const monthlyReturn = annualReturn / 12
            const totalReturn = annualReturn * investmentPeriod

            trackSaintSalEvent("investment.inquiry", {
              sessionId: session.id,
              investmentAmount,
              tier,
              projectedReturn: totalReturn,
            }).catch(console.error)

            return {
              tier,
              investmentAmount: "$" + investmentAmount.toLocaleString(),
              annualRate: rate + "%",
              investmentPeriod: investmentPeriod + " year(s)",
              expectedReturns: {
                monthly: "$" + Math.round(monthlyReturn).toLocaleString(),
                annual: "$" + Math.round(annualReturn).toLocaleString(),
                total: "$" + Math.round(totalReturn).toLocaleString(),
              },
              fundInfo: {
                name: "CookinCapital Fund I",
                focus: "Short-term real estate bridge loans",
                minimumInvestment: "$50,000",
              },
              nextStep: "Learn more and invest at /invest",
            }
          },
        }),

        navigateTo: tool({
          description: "Guide user to a specific page on the platform",
          parameters: z.object({
            destination: z
              .enum([
                "/apply",
                "/invest",
                "/capital",
                "/app/analyzer",
                "/app/properties",
                "/research",
                "/auth/login",
                "/app/dashboard",
              ])
              .describe("Page to navigate to"),
            reason: z.string().describe("Why this page is recommended"),
          }),
          execute: async ({ destination, reason }) => {
            return {
              action: "navigate",
              destination,
              reason,
              message: `I recommend heading to ${destination}. ${reason}`,
            }
          },
        }),

        captureLeadInfo: tool({
          description: "Capture lead information when user is ready to proceed",
          parameters: z.object({
            name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            interest: z.enum(["lending", "investing", "property_search", "general"]),
            notes: z.string().optional(),
          }),
          execute: async ({ name, email, phone, interest, notes }) => {
            trackSaintSalEvent("lead.captured", {
              sessionId: session.id,
              name,
              email,
              phone,
              interest,
              notes,
            }).catch(console.error)

            return {
              status: "captured",
              message: name
                ? `Thanks ${name}! I've noted your interest in ${interest}. Our team will reach out shortly.`
                : `I've noted your interest in ${interest}. When you're ready, complete an application at /apply to get started!`,
              nextStep: interest === "lending" ? "/apply" : interest === "investing" ? "/invest" : "/app/properties",
            }
          },
        }),
      },
      maxSteps: 5,
      onFinish: async ({ text }) => {
        addMessageToSession(session.id, "assistant", text).catch(console.error)
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
