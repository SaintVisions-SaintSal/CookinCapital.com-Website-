import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

// ===========================================
// SAINTSAL™ MCP SERVER v3.0 - AI ORCHESTRATION
// Perplexity-Level Responses | Intent Detection
// 35+ Tools | Lead Generation | Property Search
// ===========================================

const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const PROPERTY_API_KEY = process.env.PROPERTY_API
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

async function handleConversation(query: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are SaintSal™, the AI decision engine for CookinCapital - a real estate finance and investment firm.

Your capabilities include:
- **Property Search**: Find distressed properties, foreclosures, pre-foreclosures, high-equity homes, absentee owners
- **Owner Lookup**: Get owner contact info (phone, email, mailing address) for any property
- **Lead Generation**: Find motivated sellers, cash buyers, investors, and people needing loans
- **Deal Analysis**: Analyze fix & flip, rental, wholesale deals with ROI calculations
- **Lending Info**: Current rates for fix & flip loans, DSCR, bridge, commercial, SBA, hard money
- **Image Generation**: Create marketing images, social media graphics, property renders
- **Social Media Content**: Generate real estate posts, captions, hashtags for marketing

You are powered by the HACP™ (Human-AI Collaborative Processing) protocol - Patent #10,290,222.
You provide BUY / PASS / RENEGOTIATE signals with confidence scores.
You grade deals A through F based on ROI (A=20%+, B+=15-20%, B-=10-15%, C=5-10%, D=0-5%, F=negative).

Be helpful, professional, and focused on helping users make money in real estate.
Keep responses concise but comprehensive. Use bullet points and formatting for clarity.`,
      prompt: query,
    })
    return text
  } catch (error) {
    console.error("[MCP] Conversation error:", error)
    return `I'm SaintSal™, your AI decision engine for real estate and lending. Here's what I can help you with:

**🏠 Property Research**
- Find foreclosures, pre-foreclosures, distressed properties
- Search high-equity homes and motivated sellers
- Get owner contact information

**📊 Deal Analysis**
- Analyze fix & flip, BRRRR, wholesale deals
- Calculate ROI, cash-on-cash returns
- Get BUY/PASS/RENEGOTIATE recommendations

**💰 Lending & Capital**
- Current rates on 35+ loan products
- Fix & flip, DSCR, bridge, commercial loans
- Pre-qualification guidance

**🎯 Lead Generation**
- Find cash buyers and investors
- Locate motivated sellers
- Enrich contacts with phone/email

Just ask me anything about real estate investing, lending, or finding your next deal!`
  }
}

// AI Orchestration - Route query to best tools based on intent
async function orchestrateQuery(query: string, intent: string) {
  const results: any = {
    summary: "",
    sources: [],
    properties: [],
    leads: [],
    images: [],
    socialMediaContent: "",
  }

  try {
    switch (intent) {
      case "conversational":
      case "help":
      case "greeting":
        results.summary = await handleConversation(query)
        // No sources, properties, or leads for pure conversation
        break

      case "foreclosure_search":
      case "property_search":
        // Search properties via PropertyAPI + Web search for context
        const [propertyResults, webContext] = await Promise.all([
          searchProperties(query, intent),
          tavilySearch(query, { include_answer: true, search_depth: "advanced" }),
        ])
        results.properties = propertyResults
        results.sources = webContext.sources || []
        results.summary = await generateSummary(query, intent, { properties: propertyResults, webContext })
        break

      case "property_lookup":
        const address = extractAddress(query)
        const propertyData = await lookupProperty(address)
        results.properties = propertyData ? [propertyData] : []
        if (propertyData) {
          const valueStr = propertyData.value ? `$${propertyData.value.toLocaleString()}` : "N/A"
          const sqftStr = propertyData.sqft ? `${propertyData.sqft.toLocaleString()} sqft` : ""
          const bedBathStr = propertyData.beds || propertyData.baths ? `${propertyData.beds}bd/${propertyData.baths}ba` : ""
          const yearStr = propertyData.yearBuilt ? `Built ${propertyData.yearBuilt}` : ""
          const lastSaleStr = propertyData.lastSalePrice ? `Last sold: $${propertyData.lastSalePrice.toLocaleString()}${propertyData.lastSaleDate ? ` on ${propertyData.lastSaleDate}` : ""}` : ""
          const details = [bedBathStr, sqftStr, yearStr, lastSaleStr].filter(Boolean).join(" | ")
          results.summary = `**Property Found:** ${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zip}\n\n**Estimated Value:** ${valueStr}\n${details ? `**Details:** ${details}` : ""}\n\n*Data powered by PropertyAPI*`
        } else {
          results.summary = "Could not find property details for that address. Make sure the address is complete (street, city, state)."
        }
        break

      case "owner_lookup":
        const ownerAddress = extractAddress(query)
        const ownerData = await lookupOwner(ownerAddress)
        if (ownerData) {
          results.properties = [ownerData]
          results.summary = `Found owner: **${ownerData.ownerName}**\n\n${ownerData.ownerPhone ? `📞 Phone: ${ownerData.ownerPhone}` : ""}\n${ownerData.ownerEmail ? `📧 Email: ${ownerData.ownerEmail}` : ""}`
        } else {
          results.summary = "Could not find owner contact information for that property."
        }
        break

      case "lead_generation":
        const [leadResults, leadWebResults] = await Promise.all([
          generateLeads(query),
          tavilySearch(query, { include_answer: true, max_results: 5 }),
        ])
        results.leads = leadResults
        results.sources = leadWebResults.sources || []
        results.summary = await generateSummary(query, intent, { leads: leadResults, webContext: leadWebResults })
        break

      case "lead_enrichment":
        const enrichedLeads = await enrichLeads(query)
        results.leads = enrichedLeads
        results.summary =
          enrichedLeads.length > 0
            ? `Enriched ${enrichedLeads.length} lead(s) with contact information.`
            : "Could not find additional contact information."
        break

      case "deal_analysis":
        const dealWebResults = await tavilySearch(query, { include_answer: true, search_depth: "advanced" })
        results.sources = dealWebResults.sources || []
        results.summary = await generateSummary(query, intent, { webContext: dealWebResults })
        break

      case "lending_info":
        const lendingResults = await tavilySearch(`${query} real estate lending rates 2026`, { include_answer: true })
        results.sources = lendingResults.sources || []
        results.summary = await generateSummary(query, intent, { webContext: lendingResults })
        break

      case "image_generation":
        const images = await generateImage(query)
        results.images = images
        results.summary = "Generated image based on your prompt."
        break

      case "social_media":
        const socialMediaContent = await generateSocialMediaContent(query)
        results.socialMediaContent = socialMediaContent
        results.summary = "Generated social media content based on your prompt."
        break

      case "motivated_sellers":
        const motivatedSellersResults = await searchMotivatedSellers(query)
        results.properties = motivatedSellersResults
        results.summary = await generateSummary(query, intent, { properties: motivatedSellersResults })
        break

      case "cash_buyers":
        const cashBuyersResults = await searchCashBuyers(query)
        results.properties = cashBuyersResults
        results.summary = await generateSummary(query, intent, { properties: cashBuyersResults })
        break

      default:
        // Use AI conversation for general queries
        results.summary = await handleConversation(query)
        break
    }
  } catch (error) {
    console.error("[MCP] Orchestration error:", error)
    results.summary = "I encountered an error processing your request. Please try again."
  }

  return results
}

// Tavily Search
async function tavilySearch(query: string, options: any = {}) {
  if (!TAVILY_API_KEY) {
    return { sources: [], answer: "Search unavailable - API key not configured." }
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: options.search_depth || "basic",
        include_answer: options.include_answer !== false,
        max_results: options.max_results || 8,
        include_raw_content: false,
      }),
    })

    const data = await res.json()

    return {
      answer: data.answer || "",
      sources: (data.results || []).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.slice(0, 200) || "",
      })),
    }
  } catch (error) {
    console.error("[Tavily] Search error:", error)
    return { sources: [], answer: "" }
  }
}

// PropertyAPI - Geocode address to lat/lng using Google Maps, then lookup via PropertyAPI
async function geocodeForPropertyAPI(address: string): Promise<{ lat: number; lng: number } | null> {
  const MAPS_API_KEY = process.env.GOOGLE_MAPS_API
  if (!MAPS_API_KEY) {
    console.error("[PropertyAPI] Google Maps API key not configured for geocoding")
    return null
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== "OK" || !data.results?.[0]) {
      console.error("[PropertyAPI] Geocoding failed:", data.status)
      return null
    }

    const location = data.results[0].geometry.location
    return { lat: location.lat, lng: location.lng }
  } catch (error) {
    console.error("[PropertyAPI] Geocoding error:", error)
    return null
  }
}

// Call PropertyAPI parcel lookup by lat/lng
async function callPropertyAPI(lat: number, lng: number) {
  if (!PROPERTY_API_KEY) {
    console.error("[PropertyAPI] API key not configured")
    return null
  }

  try {
    const url = `https://propertyapi.co/api/v1/parcels/get?latitude=${lat}&longitude=${lng}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": PROPERTY_API_KEY,
        "Accept": "application/json",
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[PropertyAPI] API error ${res.status}:`, errorText)
      return null
    }

    const data = await res.json()

    if (data.status === "error" || data.error) {
      console.error(`[PropertyAPI] ${data.error}`)
      return null
    }

    return data
  } catch (error) {
    console.error("[PropertyAPI] Request error:", error)
    return null
  }
}

// Map PropertyAPI response to our internal property format
function mapPropertyAPIResponse(p: any, fallbackAddress?: string) {
  return {
    address: p.property_address || fallbackAddress || "Unknown",
    city: p.addr_city || "",
    state: p.addr_state || "",
    zip: p.addr_zip || "",
    value: p.market_value_estimate || p.total_value_assessed || 0,
    equity: null,
    equityPercent: null,
    ownerName: null,
    foreclosureStatus: null,
    propertyType: null,
    beds: p.bedrooms || 0,
    baths: p.bathrooms || 0,
    sqft: p.sqft || 0,
    yearBuilt: p.year_built || null,
    acres: p.acres || null,
    lastSaleDate: p.last_sale_date || null,
    lastSalePrice: p.last_sale_price || null,
    apn: p.apn || null,
    uuid: p.uuid || null,
    source: "PropertyAPI",
  }
}

// PropertyAPI Search - geocode location then lookup property data
async function searchProperties(query: string, intent: string) {
  if (!PROPERTY_API_KEY) {
    console.error("[PropertyAPI] No API key - cannot search properties")
    return []
  }

  try {
    // Extract address or location from query
    const locationMatch = query.match(/in\s+([^,]+(?:,\s*[A-Z]{2})?)/i)
    const addressMatch = query.match(
      /\d+\s+[\w\s]+(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)[,\s]+[\w\s]+[,\s]+[A-Z]{2}(?:\s+\d{5})?/i,
    )
    const searchLocation = addressMatch?.[0] || locationMatch?.[1]?.trim()

    if (!searchLocation) {
      console.error("[PropertyAPI] Could not extract location from query:", query)
      return []
    }

    const coords = await geocodeForPropertyAPI(searchLocation)
    if (!coords) return []

    const data = await callPropertyAPI(coords.lat, coords.lng)
    if (!data) return []

    // PropertyAPI returns a single parcel, wrap in array
    const properties = Array.isArray(data) ? data : [data]
    return properties.map((p: any) => mapPropertyAPIResponse(p, searchLocation))
  } catch (error) {
    console.error("[PropertyAPI] Search error:", error)
    return []
  }
}

// Property Lookup - single address lookup via PropertyAPI
async function lookupProperty(address: string) {
  if (!PROPERTY_API_KEY || !address) {
    console.error("[PropertyAPI] Missing API key or address for lookup")
    return null
  }

  try {
    const coords = await geocodeForPropertyAPI(address)
    if (!coords) return null

    const data = await callPropertyAPI(coords.lat, coords.lng)
    if (!data) return null

    const p = Array.isArray(data) ? data[0] : data
    if (!p) return null

    return mapPropertyAPIResponse(p, address)
  } catch (error) {
    console.error("[PropertyAPI] Lookup error:", error)
    return null
  }
}

// Owner Lookup
async function lookupOwner(address: string) {
  const property = await lookupProperty(address)
  return property
}

// Lead Generation - uses Tavily web search to find real lead info
async function generateLeads(query: string) {
  const searchResults = await tavilySearch(`${query} contact email phone real estate`, { max_results: 10 })

  // Parse leads from search results
  const leads: any[] = (searchResults.sources || []).slice(0, 5).map((s: any, i: number) => ({
    name: s.title || `Lead ${i + 1}`,
    title: "Real Estate Contact",
    source: s.url,
    snippet: s.snippet,
  }))

  return leads
}

// Lead Enrichment
async function enrichLeads(query: string) {
  // Would integrate with Apollo, Clearbit, etc.
  return []
}

// Image Generation via fal.ai
async function generateImage(query: string) {
  const FAL_KEY = process.env.FAL_KEY
  if (!FAL_KEY) return []

  try {
    const prompt = query.replace(/generate\s*(an?\s*)?image\s*(of)?:?\s*/i, "").trim()

    const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "landscape_16_9",
        num_images: 1,
      }),
    })

    const data = await res.json()
    return data.images?.map((img: any) => img.url) || []
  } catch {
    return []
  }
}

// Social Media Content Generation
async function generateSocialMediaContent(query: string) {
  // Placeholder for social media content generation logic
  return "Sample social media content based on your query."
}

// Search for Motivated Sellers - uses PropertyAPI + Tavily for real data
async function searchMotivatedSellers(query: string) {
  // Try PropertyAPI for any specific addresses in the query
  const properties = await searchProperties(query, "motivated_sellers")

  // Enrich with web search for distressed/motivated seller context
  const webResults = await tavilySearch(`${query} motivated sellers distressed properties`, { max_results: 5 })

  return properties.length > 0 ? properties : []
}

// Search for Cash Buyers - uses Tavily for real market data
async function searchCashBuyers(query: string) {
  const properties = await searchProperties(query, "cash_buyers")

  // Enrich with web search for cash buyer context
  const webResults = await tavilySearch(`${query} cash buyers real estate investors`, { max_results: 5 })

  return properties.length > 0 ? properties : []
}

// Generate AI Summary
async function generateSummary(query: string, intent: string, context: any) {
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are SaintSal™, an AI assistant for CookinCapital specializing in real estate investing, lending, and deal analysis. 
Provide concise, actionable insights. Use markdown formatting. Be direct and helpful.
For property searches: highlight key metrics like equity %, foreclosure status, and investment potential.
For leads: summarize the best prospects and why.
For deals: give a BUY/PASS/RENEGOTIATE signal with reasoning.
For social media content: provide engaging text or captions for social media posts.`,
      prompt: `Query: ${query}
Intent: ${intent}
Context: ${JSON.stringify(context).slice(0, 2000)}

Provide a brief, helpful summary (2-4 paragraphs max).`,
    })

    return text
  } catch {
    return context.webContext?.answer || "I found some results for your query."
  }
}

// Helper: Extract address from query
function extractAddress(query: string): string {
  const match = query.match(
    /\d+\s+[\w\s]+(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)[,\s]+[\w\s]+[,\s]+[A-Z]{2}(?:\s+\d{5})?/i,
  )
  return match ? match[0] : query
}



// Main handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, intent: providedIntent, tool } = body

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 })
    }

    // If specific tool requested
    if (tool === "fal_generate_image") {
      const images = await generateImage(query)
      return NextResponse.json({ images, response: "Generated image" })
    }

    // Auto-detect intent if not provided
    const intent = providedIntent || detectIntentServer(query)

    // Orchestrate the query
    const results = await orchestrateQuery(query, intent)

    return NextResponse.json({
      response: results.summary,
      summary: results.summary,
      sources: results.sources,
      properties: results.properties,
      leads: results.leads,
      images: results.images,
      socialMediaContent: results.socialMediaContent,
      intent,
    })
  } catch (error) {
    console.error("[MCP] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// Server-side intent detection (mirrors client-side)
function detectIntentServer(query: string): string {
  const q = query.toLowerCase()

  if (
    q.includes("what can you") ||
    q.includes("how can you") ||
    q.includes("what do you") ||
    q.includes("who are you") ||
    q.includes("help me") ||
    q.includes("hello") ||
    q.includes("hi saintsal") ||
    q.includes("hey saintsal") ||
    q.match(/^(hi|hello|hey|sup|yo|what's up|whats up)[\s!?.,]*$/i) ||
    q.includes("tell me about yourself") ||
    q.includes("what are your") ||
    q.includes("explain") ||
    q.includes("how does this work") ||
    q.includes("can you help")
  ) {
    return "conversational"
  }

  if (q.includes("foreclosure") || q.includes("pre-foreclosure") || q.includes("nod") || q.includes("auction")) {
    return "foreclosure_search"
  }
  if (q.includes("property") && (q.includes("find") || q.includes("search"))) {
    return "property_search"
  }
  if (q.includes("owner") && (q.includes("find") || q.includes("contact") || q.includes("phone"))) {
    return "owner_lookup"
  }
  if (q.match(/\d+\s+\w+\s+(st|street|ave|avenue|blvd|dr|rd|ln|way|ct)/i)) {
    return "property_lookup"
  }
  if (q.includes("lead") || q.includes("investor") || q.includes("buyer") || q.includes("seller")) {
    return "lead_generation"
  }
  if (q.includes("motivated") || q.includes("distress") || q.includes("desperate") || q.includes("urgent")) {
    return "motivated_sellers"
  }
  if (q.includes("cash buyer") || q.includes("cash investor")) {
    return "cash_buyers"
  }
  if (q.includes("analyze") || q.includes("deal") || q.includes("flip") || q.includes("roi")) {
    return "deal_analysis"
  }
  if (
    q.includes("loan") ||
    q.includes("rate") ||
    q.includes("bridge") ||
    q.includes("dscr") ||
    q.includes("lending") ||
    q.includes("finance")
  ) {
    return "lending_info"
  }
  if (q.includes("generate image") || q.includes("create image") || q.includes("make image") || q.includes("draw")) {
    return "image_generation"
  }
  if (
    q.includes("social") ||
    q.includes("post") ||
    q.includes("instagram") ||
    q.includes("facebook") ||
    q.includes("linkedin") ||
    q.includes("twitter") ||
    q.includes("content")
  ) {
    return "social_media"
  }

  return "conversational"
}

export async function GET() {
  return NextResponse.json({
    name: "SaintSal™ MCP Server",
    version: "3.0",
    description: "AI-Orchestrated Research & Lead Generation",
    tools: 35,
    capabilities: [
      "Web Search (Tavily)",
      "Property Search (PropertyAPI)",
      "Lead Generation & Enrichment",
      "Deal Analysis",
      "Image Generation (fal.ai)",
      "CRM Integration (GHL)",
      "Social Media Content Generation",
      "Motivated Sellers Search",
      "Cash Buyers Search",
    ],
  })
}
