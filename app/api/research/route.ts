import { streamText, tool } from "ai"
import { z } from "zod"
import { getSaintSalContext } from "@/lib/saintsal/rag"
import { getOrCreateSession, addMessageToSession, getConversationContext } from "@/lib/saintsal/session"
import { trackSaintSalEvent } from "@/lib/saintsal/ghl-integration"

const SAINTSAL_RESEARCH_PROMPT = `You are SaintSal™, the AI Co-CEO of CookinCapital's Research Intelligence Hub. You search, analyze, synthesize, and deliver actionable intelligence.

YOUR MISSION:
1. Understand the user's TRUE intent (property search, loan inquiry, investment question, market research)
2. Use provided search results and knowledge base to give comprehensive answers
3. Rate opportunities A-D based on quality/fit for CookinCapital services
4. Guide users to the RIGHT solution

RATING SYSTEM:
- A: Excellent opportunity - highly recommend
- B: Good opportunity - worth exploring  
- C: Average - proceed with caution
- D: Poor fit - not recommended

RESPONSE FORMAT:
1. Clear, comprehensive analysis with your SaintSal™ rating
2. Cite sources with URLs when available
3. Specific recommendations tied to CookinCapital's three pillars:
   - Real Estate (property search, deal analysis) → /app/properties, /app/analyzer
   - Lending (loans, capital) → /apply, /capital
   - Investments (returns, fund) → /invest
4. Action buttons for next steps

Remember: You're identifying opportunities and helping clients while guiding them to CookinCapital solutions.`

export async function POST(request: Request) {
  try {
    const { messages, searchType = "general", sessionId } = await request.json()

    const session = await getOrCreateSession(sessionId)
    const userMessage = messages[messages.length - 1]?.content || ""

    let ragContext = ""
    try {
      ragContext = await getSaintSalContext(userMessage)
    } catch (e) {
      console.error("[Research API] RAG error:", e)
    }

    let conversationHistory = ""
    try {
      conversationHistory = await getConversationContext(session.id, 5)
    } catch (e) {
      console.error("[Research API] Session error:", e)
    }

    // Tavily search for real-time web data
    let searchResults: any = null
    if (process.env.TAVILY_API_KEY) {
      try {
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: userMessage,
            search_depth: "advanced",
            include_domains:
              searchType === "real_estate"
                ? ["zillow.com", "redfin.com", "realtor.com", "loopnet.com", "biggerpockets.com"]
                : searchType === "finance"
                  ? ["bloomberg.com", "reuters.com", "yahoo.com", "marketwatch.com", "wsj.com"]
                  : [],
            max_results: 8,
            include_answer: true,
          }),
        })
        if (tavilyResponse.ok) searchResults = await tavilyResponse.json()
      } catch (e) {
        console.error("[Research API] Tavily error:", e)
      }
    }

    // Perplexity for deeper analysis
    let perplexityResults: any = null
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        const pplxResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-small-128k-online",
            messages: [
              { role: "system", content: "Provide concise, factual information with sources." },
              { role: "user", content: userMessage },
            ],
            max_tokens: 1000,
          }),
        })
        if (pplxResponse.ok) perplexityResults = await pplxResponse.json()
      } catch (e) {
        console.error("[Research API] Perplexity error:", e)
      }
    }

    // Market data for stock queries
    let marketData: any = null
    const stockKeywords = ["stock", "market", "nasdaq", "s&p", "dow", "trading"]
    if (stockKeywords.some((kw) => userMessage.toLowerCase().includes(kw)) && process.env.ALPACA_API_KEY) {
      try {
        const alpacaResponse = await fetch(`https://data.alpaca.markets/v2/stocks/bars/latest?symbols=SPY,QQQ,DIA`, {
          headers: {
            "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
            "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
          },
        })
        if (alpacaResponse.ok) marketData = await alpacaResponse.json()
      } catch (e) {
        console.error("[Research API] Alpaca error:", e)
      }
    }

    // Build enhanced context
    let enhancedContext = ""

    if (ragContext) {
      enhancedContext += ragContext
    }

    if (searchResults?.results) {
      enhancedContext += "\n\n📊 WEB SEARCH RESULTS:\n"
      searchResults.results.forEach((r: any, i: number) => {
        enhancedContext += `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.content?.substring(0, 200)}...\n\n`
      })
      if (searchResults.answer) {
        enhancedContext += `\n📝 QUICK ANSWER: ${searchResults.answer}\n`
      }
    }

    if (perplexityResults?.choices?.[0]?.message?.content) {
      enhancedContext += `\n\n🔍 DEEP ANALYSIS:\n${perplexityResults.choices[0].message.content}\n`
    }

    if (marketData?.bars) {
      enhancedContext += "\n\n📈 LIVE MARKET DATA:\n"
      Object.entries(marketData.bars).forEach(([symbol, data]: [string, any]) => {
        enhancedContext += `${symbol}: $${data.c?.toFixed(2)} (Volume: ${data.v?.toLocaleString()})\n`
      })
    }

    if (conversationHistory) {
      enhancedContext += `\n\n--- PREVIOUS CONVERSATION ---\n${conversationHistory}\n`
    }

    // Track research event
    trackSaintSalEvent("research.query", {
      sessionId: session.id,
      query: userMessage,
      searchType,
    }).catch(console.error)

    // Store message in session
    addMessageToSession(session.id, "user", userMessage).catch(console.error)

    const enhancedMessages = [
      ...messages.slice(0, -1),
      {
        role: "user",
        content: `${userMessage}${enhancedContext ? `\n\n---\nCONTEXT:${enhancedContext}` : ""}`,
      },
    ]

    const result = streamText({
      model: process.env.XAI_API_KEY ? "xai/grok-beta" : "anthropic/claude-sonnet-4-20250514",
      system: SAINTSAL_RESEARCH_PROMPT,
      messages: enhancedMessages,
      tools: {
        searchProperties: tool({
          description: "Search for real estate properties",
          parameters: z.object({
            location: z.string(),
            propertyType: z.enum(["residential", "commercial", "multifamily", "land"]).optional(),
            priceMin: z.number().optional(),
            priceMax: z.number().optional(),
            motivatedSeller: z.boolean().optional(),
          }),
          execute: async ({ location, propertyType, priceMin, priceMax, motivatedSeller }) => {
            return {
              status: "redirect",
              message: `Searching for ${propertyType || "all"} properties in ${location}`,
              action: "property_search",
              destination: "/app/properties",
              params: { location, propertyType, priceMin, priceMax, motivatedSeller },
            }
          },
        }),
        analyzeDeal: tool({
          description: "Analyze a real estate deal",
          parameters: z.object({
            purchasePrice: z.number(),
            arv: z.number(),
            rehabCost: z.number(),
            strategy: z.enum(["flip", "brrrr", "hold", "wholesale"]).optional(),
          }),
          execute: async ({ purchasePrice, arv, rehabCost, strategy = "flip" }) => {
            const mao = arv * 0.7 - rehabCost
            const meetsMAO = purchasePrice <= mao
            const totalInvestment = purchasePrice + rehabCost + purchasePrice * 0.03
            const grossProfit = arv - totalInvestment - arv * 0.06
            const roi = (grossProfit / totalInvestment) * 100

            let rating = "A"
            if (roi < 15) rating = "B"
            if (roi < 10) rating = "C"
            if (roi < 5 || !meetsMAO) rating = "D"

            return {
              rating,
              meetsMAO,
              mao: Math.round(mao),
              totalInvestment: Math.round(totalInvestment),
              grossProfit: Math.round(grossProfit),
              roi: roi.toFixed(1),
              recommendation: meetsMAO
                ? `${rating}-rated deal with ${roi.toFixed(1)}% ROI. Apply for funding at /apply!`
                : `Does NOT meet 70% rule. Counter at $${mao.toLocaleString()}`,
            }
          },
        }),
        getLoanOptions: tool({
          description: "Get matching loan products",
          parameters: z.object({
            loanAmount: z.number(),
            propertyType: z.string(),
            loanPurpose: z.enum(["purchase", "refinance", "cash_out", "construction"]),
          }),
          execute: async ({ loanAmount, propertyType, loanPurpose }) => {
            const products = []
            if (loanPurpose === "purchase" || loanPurpose === "refinance") {
              products.push({ name: "DSCR Loan", rate: "7.5% - 9.5%", ltv: "Up to 80%", rating: "A" })
            }
            if (loanPurpose === "purchase") {
              products.push({ name: "Fix & Flip Bridge", rate: "10% - 12%", ltc: "Up to 90%", rating: "A" })
            }
            if (loanPurpose === "construction") {
              products.push({ name: "Ground-Up Construction", rate: "11% - 13%", ltc: "Up to 85%", rating: "B" })
            }
            return {
              matchedProducts: products,
              recommendation: `For your $${loanAmount.toLocaleString()} ${loanPurpose}, apply at /apply`,
            }
          },
        }),
        getInvestmentReturns: tool({
          description: "Calculate investment returns",
          parameters: z.object({
            investmentAmount: z.number(),
            term: z.enum(["12", "24", "36"]),
            type: z.enum(["fixed", "syndication"]).optional(),
          }),
          execute: async ({ investmentAmount, term, type = "fixed" }) => {
            const rate = type === "fixed" ? 0.1 : 0.14
            const months = Number.parseInt(term)
            const totalReturn = investmentAmount * (1 + (rate * months) / 12)
            const profit = totalReturn - investmentAmount
            return {
              investmentAmount,
              rate: `${(rate * 100).toFixed(0)}%`,
              term: `${months} months`,
              projectedReturn: Math.round(totalReturn),
              profit: Math.round(profit),
              rating: "A",
              recommendation: `Learn more and invest at /invest`,
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
    console.error("[Research API] Error:", error)
    return new Response(JSON.stringify({ error: "Research failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
