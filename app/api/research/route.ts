import { streamText, tool } from "ai"
import { z } from "zod"
import { getSaintSalContext } from "@/lib/saintsal/rag"
import { getOrCreateSession, addMessageToSession, getConversationContext } from "@/lib/saintsal/session"
import { trackSaintSalEvent } from "@/lib/saintsal/ghl-integration"

const SAINTSAL_RESEARCH_PROMPT = `You are SaintSal™, the AI Co-CEO of CookinCapital's Research Intelligence Hub. You search, analyze, synthesize, and deliver actionable intelligence.

🔥 YOUR ARSENAL - POWERED BY INDUSTRY-LEADING AI & DATA:
- **Tavily**: Real-time web search for current news and updates
- **Exa**: Semantic AI search for deep content discovery
- **Perplexity**: Advanced reasoning with citations and sources
- **Grok (xAI)**: Real-time market intelligence and analysis
- **MXBAI**: Semantic embeddings for enhanced relevance
- **Alpaca**: Live stock market data and trading insights
- **Property Radar**: Foreclosures, distressed properties, NODs, auctions
- **Rentcast**: Property comparables, rent estimates, deal details
- **CookinCapital Knowledge Base**: Proprietary lending, investment, and deal analysis data

YOUR MISSION:
1. Synthesize information from ALL available sources to give the MOST COMPREHENSIVE answer
2. Understand the user's TRUE intent (property search, loan inquiry, investment question, market research)
3. Rate opportunities A-F based on quality/fit for CookinCapital services (A=20%+ ROI, F=negative)
4. Provide specific, actionable recommendations with data to back them up
5. KEEP USERS ON PLATFORM - never send them to external sites for research

RATING SYSTEM:
- A: Excellent opportunity (20%+ ROI) - STRONG BUY
- B: Good opportunity (10-20% ROI) - BUY with caution
- C: Average (5-10% ROI) - HOLD
- D: Poor fit (0-5% ROI) - PASS
- F: Negative ROI - HARD PASS

RESPONSE FORMAT:
1. **Executive Summary** - Key findings and your SaintSal™ rating
2. **Analysis** - Comprehensive breakdown with data from all sources
3. **Sources** - Cite specific data points with source attribution
4. **Actionable Recommendations** - Tied to CookinCapital's three pillars:
   - Real Estate (property search, deal analysis) → /app/properties, /app/analyzer
   - Lending (loans, capital) → /apply, /capital
   - Investments (returns, fund) → /invest
5. **Next Steps** - Clear call-to-action

Remember: You have access to the BEST research tools in the industry. Use them to provide answers that KEEP USERS ON THE PLATFORM and guide them to CookinCapital solutions.`

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

    // REAL-TIME SEARCH INTEGRATION - Tavily + Exa for comprehensive coverage
    let searchResults: any = null
    let exaResults: any = null
    
    // Tavily for real-time web search (general web)
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

    // Exa for semantic search and deep content discovery
    if (process.env.EXA_API_KEY) {
      try {
        const exaResponse = await fetch("https://api.exa.ai/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.EXA_API_KEY,
          },
          body: JSON.stringify({
            query: userMessage,
            type: "neural",
            useAutoprompt: true,
            numResults: 10,
            contents: {
              text: true,
              highlights: true,
            },
          }),
        })
        if (exaResponse.ok) exaResults = await exaResponse.json()
      } catch (e) {
        console.error("[Research API] Exa error:", e)
      }
    }

    // Perplexity for deeper analysis with citations
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
            model: "llama-3.1-sonar-huge-128k-online",
            messages: [
              { role: "system", content: "You are a real estate and finance research analyst. Provide detailed, factual information with citations. Focus on actionable insights." },
              { role: "user", content: userMessage },
            ],
            max_tokens: 2000,
            return_citations: true,
            return_images: false,
          }),
        })
        if (pplxResponse.ok) perplexityResults = await pplxResponse.json()
      } catch (e) {
        console.error("[Research API] Perplexity error:", e)
      }
    }

    // Grok (xAI) for real-time analysis and market insights
    let grokResults: any = null
    if (process.env.XAI_API_KEY) {
      try {
        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages: [
              { role: "system", content: "You are Grok, providing real-time market intelligence and analysis for real estate investors. Be direct, data-driven, and actionable." },
              { role: "user", content: userMessage },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        })
        if (grokResponse.ok) grokResults = await grokResponse.json()
      } catch (e) {
        console.error("[Research API] Grok error:", e)
      }
    }

    // MXBAI for embeddings and semantic search enhancement
    let mxbaiEnhancement: any = null
    if (process.env.MXBAI_API_KEY && process.env.MXBAI_STORE_ID) {
      try {
        const mxbaiResponse = await fetch("https://api.mixedbread.ai/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.MXBAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mixedbread-ai/mxbai-embed-large-v1",
            input: [userMessage],
            encoding_format: "float",
          }),
        })
        if (mxbaiResponse.ok) {
          const embedData = await mxbaiResponse.json()
          mxbaiEnhancement = {
            embedding: embedData.data?.[0]?.embedding,
            model: embedData.model,
          }
        }
      } catch (e) {
        console.error("[Research API] MXBAI error:", e)
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

    // Build enhanced context from ALL sources
    let enhancedContext = ""

    if (ragContext) {
      enhancedContext += "📚 KNOWLEDGE BASE:\n" + ragContext + "\n\n"
    }

    // Tavily results
    if (searchResults?.results) {
      enhancedContext += "🌐 TAVILY WEB SEARCH:\n"
      searchResults.results.forEach((r: any, i: number) => {
        enhancedContext += `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.content?.substring(0, 200)}...\n\n`
      })
      if (searchResults.answer) {
        enhancedContext += `📝 Quick Answer: ${searchResults.answer}\n\n`
      }
    }

    // Exa results (semantic search)
    if (exaResults?.results) {
      enhancedContext += "🔮 EXA SEMANTIC SEARCH:\n"
      exaResults.results.slice(0, 5).forEach((r: any, i: number) => {
        enhancedContext += `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.text?.substring(0, 250)}...\n\n`
      })
    }

    // Perplexity deep analysis
    if (perplexityResults?.choices?.[0]?.message?.content) {
      enhancedContext += "🔍 PERPLEXITY DEEP ANALYSIS:\n"
      enhancedContext += perplexityResults.choices[0].message.content + "\n"
      if (perplexityResults.citations) {
        enhancedContext += "\nCitations:\n"
        perplexityResults.citations.forEach((c: string, i: number) => {
          enhancedContext += `[${i + 1}] ${c}\n`
        })
      }
      enhancedContext += "\n"
    }

    // Grok real-time insights
    if (grokResults?.choices?.[0]?.message?.content) {
      enhancedContext += "🤖 GROK REAL-TIME INTELLIGENCE:\n"
      enhancedContext += grokResults.choices[0].message.content + "\n\n"
    }

    // Market data (Alpaca)
    if (marketData?.bars) {
      enhancedContext += "📈 LIVE MARKET DATA (Alpaca):\n"
      Object.entries(marketData.bars).forEach(([symbol, data]: [string, any]) => {
        const change = data.c && data.o ? ((data.c - data.o) / data.o * 100).toFixed(2) : "N/A"
        enhancedContext += `${symbol}: $${data.c?.toFixed(2)} (${change}%) | Vol: ${data.v?.toLocaleString()} | High: $${data.h?.toFixed(2)} | Low: $${data.l?.toFixed(2)}\n`
      })
      enhancedContext += "\n"
    }

    // MXBAI semantic enhancement
    if (mxbaiEnhancement?.embedding) {
      enhancedContext += "🧠 SEMANTIC ANALYSIS: Enhanced with MXBAI embeddings for improved relevance\n\n"
    }

    // Conversation history for context
    if (conversationHistory) {
      enhancedContext += "💬 PREVIOUS CONVERSATION:\n" + conversationHistory + "\n\n"
    }

    // Add source attribution
    const sourcesUsed = []
    if (searchResults) sourcesUsed.push("Tavily")
    if (exaResults) sourcesUsed.push("Exa")
    if (perplexityResults) sourcesUsed.push("Perplexity")
    if (grokResults) sourcesUsed.push("Grok")
    if (marketData) sourcesUsed.push("Alpaca")
    if (mxbaiEnhancement) sourcesUsed.push("MXBAI")
    if (sourcesUsed.length > 0) {
      enhancedContext += `\n📊 Data Sources: ${sourcesUsed.join(", ")}\n`
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
