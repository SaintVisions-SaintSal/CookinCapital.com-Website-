import { streamText, tool } from "ai"
import { z } from "zod"

// SaintSal Research System Prompt - The brain of the operation
const SAINTSAL_RESEARCH_PROMPT = `You are SaintSal™, the AI Co-CEO of CookinCapital's Research Intelligence Hub. You are powered by HACP™ (Human-AI Collaborative Processing) and you run the show.

CORE IDENTITY:
- You are the intellectual equivalent of having Perplexity + Goldman Sachs CEO + Elite Law Partner + Real Estate Mogul + Private Equity Titan - ALL AT ONCE
- You search, analyze, synthesize, and deliver actionable intelligence
- Zero hesitation. Zero hedging. Execute with confidence backed by expertise.
- "I got you" energy at all times

YOUR MISSION:
When users search for ANYTHING, you:
1. Understand their TRUE intent (property search, loan inquiry, investment question, market research, etc.)
2. Search multiple sources (web, property databases, market data, business info)
3. Synthesize information into clear, actionable insights
4. Rate opportunities A-D based on quality/fit
5. Guide them to the RIGHT CookinCapital solution

COOKINC CAPITAL THREE PILLARS:
1. REAL ESTATE (CookinFlips) - Property search, deal analysis, motivated seller leads, fix & flip, BRRRR
2. LENDING (Cookin' Capital) - Bridge loans, DSCR, hard money, commercial, construction, 23+ loan products
3. INVESTMENTS (CookinSaints) - 9-12% fixed returns, Fund I Syndication, Alpaca trading platform

RATING SYSTEM (A-D):
- A: Excellent opportunity/match - highly recommend pursuing
- B: Good opportunity - worth exploring with minor considerations
- C: Average - proceed with caution, do more research
- D: Poor fit - not recommended, suggest alternatives

RESPONSE FORMAT:
1. Start with a clear, comprehensive analysis
2. Cite your sources with URLs when available
3. Provide specific recommendations tied to CookinCapital services
4. Include relevant action buttons (Apply Now, Search Properties, Explore Lending, Analyze Deal)
5. If they're looking for property/leads - guide to our PropertyRadar integration
6. If they need capital - guide to our loan application
7. If they want returns - guide to our investment platform

REMEMBER: You're not just answering questions. You're a Co-CEO identifying opportunities and converting research into business for CookinCapital while genuinely helping clients achieve their goals.`

export async function POST(request: Request) {
  try {
    const { messages, searchType = "general" } = await request.json()

    // Get the latest user message for search
    const userMessage = messages[messages.length - 1]?.content || ""

    // Perform web search via Tavily
    let searchResults: any = null
    let perplexityResults: any = null

    // Tavily search for real-time web data
    if (process.env.TAVILY_API_KEY) {
      try {
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
            include_raw_content: false,
          }),
        })

        if (tavilyResponse.ok) {
          searchResults = await tavilyResponse.json()
        }
      } catch (e) {
        console.error("[Research API] Tavily error:", e)
      }
    }

    // Perplexity for deeper analysis (if available)
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
              {
                role: "system",
                content: "You are a research assistant. Provide concise, factual information with sources.",
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            max_tokens: 1000,
          }),
        })

        if (pplxResponse.ok) {
          perplexityResults = await pplxResponse.json()
        }
      } catch (e) {
        console.error("[Research API] Perplexity error:", e)
      }
    }

    // Get real-time stock data if query mentions stocks/market
    let marketData: any = null
    const stockKeywords = ["stock", "market", "nasdaq", "s&p", "dow", "trading", "invest"]
    if (stockKeywords.some((kw) => userMessage.toLowerCase().includes(kw)) && process.env.ALPACA_API_KEY) {
      try {
        // Get major indices performance
        const symbols = ["SPY", "QQQ", "DIA"]
        const alpacaResponse = await fetch(
          `https://data.alpaca.markets/v2/stocks/bars/latest?symbols=${symbols.join(",")}`,
          {
            headers: {
              "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
              "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
            },
          },
        )
        if (alpacaResponse.ok) {
          marketData = await alpacaResponse.json()
        }
      } catch (e) {
        console.error("[Research API] Alpaca error:", e)
      }
    }

    // Build enhanced context for SaintSal
    let enhancedContext = ""

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

    // Prepare messages with search context
    const enhancedMessages = [
      ...messages.slice(0, -1),
      {
        role: "user",
        content: `${userMessage}${enhancedContext ? `\n\n---\nSEARCH CONTEXT (use this to inform your response):${enhancedContext}` : ""}`,
      },
    ]

    // Stream response from SaintSal
    const result = streamText({
      model: process.env.XAI_API_KEY ? "xai/grok-beta" : "anthropic/claude-sonnet-4-20250514",
      system: SAINTSAL_RESEARCH_PROMPT,
      messages: enhancedMessages,
      tools: {
        searchProperties: tool({
          description: "Search for real estate properties using PropertyRadar",
          parameters: z.object({
            location: z.string().describe("City, county, or zip code"),
            propertyType: z.enum(["residential", "commercial", "multifamily", "land"]).optional(),
            priceMin: z.number().optional(),
            priceMax: z.number().optional(),
            motivatedSeller: z.boolean().optional().describe("Filter for motivated seller leads"),
          }),
          execute: async ({ location, propertyType, priceMin, priceMax, motivatedSeller }) => {
            return {
              status: "redirect",
              message: `Searching for ${propertyType || "all"} properties in ${location}`,
              action: "property_search",
              params: { location, propertyType, priceMin, priceMax, motivatedSeller },
            }
          },
        }),
        analyzeDeal: tool({
          description: "Analyze a real estate deal with comprehensive financial metrics",
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
                ? `This deal meets the 70% rule with ${roi.toFixed(1)}% ROI. Apply for funding now!`
                : `This deal does NOT meet the 70% rule. Max offer should be $${mao.toLocaleString()}`,
            }
          },
        }),
        getLoanOptions: tool({
          description: "Get matching loan products based on criteria",
          parameters: z.object({
            loanAmount: z.number().describe("Requested loan amount"),
            propertyType: z.string().describe("Property type"),
            loanPurpose: z.enum(["purchase", "refinance", "cash_out", "construction"]),
            creditScore: z.number().optional(),
          }),
          execute: async ({ loanAmount, propertyType, loanPurpose, creditScore = 680 }) => {
            const products = []

            if (loanPurpose === "purchase" || loanPurpose === "refinance") {
              products.push({
                name: "DSCR Loan",
                rate: "7.5% - 9.5%",
                ltv: "Up to 80%",
                term: "30-year fixed",
                rating: "A",
              })
            }

            if (loanPurpose === "purchase") {
              products.push({
                name: "Fix & Flip Bridge",
                rate: "10% - 12%",
                ltc: "Up to 90%",
                term: "12-24 months",
                rating: "A",
              })
            }

            if (loanPurpose === "construction") {
              products.push({
                name: "Ground-Up Construction",
                rate: "11% - 13%",
                ltc: "Up to 85%",
                term: "18-24 months",
                rating: "B",
              })
            }

            return {
              matchedProducts: products,
              recommendation: `Based on your ${loanPurpose} need for $${loanAmount.toLocaleString()}, we recommend starting with our ${products[0]?.name}. Apply now for a rate quote!`,
            }
          },
        }),
        getInvestmentReturns: tool({
          description: "Calculate investment returns for CookinSaints opportunities",
          parameters: z.object({
            investmentAmount: z.number(),
            term: z.enum(["12", "24", "36"]).describe("Investment term in months"),
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
              recommendation: `With our ${type === "fixed" ? "Fixed Rate Note" : "Fund I Syndication"}, your $${investmentAmount.toLocaleString()} investment projects to return $${Math.round(totalReturn).toLocaleString()} in ${months} months.`,
            }
          },
        }),
      },
      maxSteps: 5,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[Research API] Error:", error)
    return new Response(JSON.stringify({ error: "Research failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
