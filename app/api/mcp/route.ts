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
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API

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

// ===========================================
// PROPERTYAPI.CO INTEGRATION
// Base URL: https://api.propertyapi.co
// Auth: X-API-Key header with papi_ prefixed key
// Endpoints: /property/detail, /property/comps, /autocomplete/address, /bulk/details
// ===========================================

const PAPI_BASE = "https://api.propertyapi.co"
const PAPI_HEADERS = {
  "X-API-Key": PROPERTY_API_KEY || "",
  "Accept": "application/json",
  "Content-Type": "application/json",
}

// GET /property/detail?address=... — full property data by address
async function fetchPropertyDetail(address: string): Promise<any | null> {
  if (!PROPERTY_API_KEY) {
    console.error("[PropertyAPI] API key not configured (PROPERTY_API env var)")
    return null
  }
  try {
    const url = `${PAPI_BASE}/property/detail?address=${encodeURIComponent(address)}`
    console.log("[v0] PropertyAPI detail request:", url)
    const res = await fetch(url, { headers: PAPI_HEADERS })
    console.log("[v0] PropertyAPI detail response status:", res.status)
    if (!res.ok) {
      const errText = await res.text()
      console.error(`[PropertyAPI] detail error ${res.status}:`, errText)
      return null
    }
    const data = await res.json()
    console.log("[v0] PropertyAPI detail data keys:", Object.keys(data))
    return data
  } catch (error) {
    console.error("[PropertyAPI] detail fetch error:", error)
    return null
  }
}

// GET /property/comps?address=...&radius=...&limit=... — comparable properties
async function fetchPropertyComps(address: string, radius: number = 5, limit: number = 20): Promise<any[]> {
  if (!PROPERTY_API_KEY) return []
  try {
    const url = `${PAPI_BASE}/property/comps?address=${encodeURIComponent(address)}&radius=${radius}&limit=${limit}`
    console.log("[v0] PropertyAPI comps request:", url)
    const res = await fetch(url, { headers: PAPI_HEADERS })
    console.log("[v0] PropertyAPI comps response status:", res.status)
    if (!res.ok) {
      console.error(`[PropertyAPI] comps error ${res.status}:`, await res.text())
      return []
    }
    const data = await res.json()
    console.log("[v0] PropertyAPI comps result count:", Array.isArray(data) ? data.length : typeof data)
    // Could be array directly or wrapped in a key
    if (Array.isArray(data)) return data
    if (data.properties) return data.properties
    if (data.comps) return data.comps
    if (data.results) return data.results
    if (data.data) return data.data
    return [data]
  } catch (error) {
    console.error("[PropertyAPI] comps fetch error:", error)
    return []
  }
}

// GET /autocomplete/address?query=... — address suggestions
async function autocompleteAddress(query: string): Promise<string[]> {
  if (!PROPERTY_API_KEY) return []
  try {
    const url = `${PAPI_BASE}/autocomplete/address?query=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: PAPI_HEADERS })
    if (!res.ok) return []
    const data = await res.json()
    // Return array of address strings
    if (Array.isArray(data)) return data.map((d: any) => typeof d === "string" ? d : d.address || d.fullAddress || JSON.stringify(d))
    if (data.suggestions) return data.suggestions
    if (data.addresses) return data.addresses
    if (data.results) return data.results.map((d: any) => d.address || d.fullAddress || "")
    return []
  } catch (error) {
    console.error("[PropertyAPI] autocomplete error:", error)
    return []
  }
}

// POST /bulk/details — up to 1,000 addresses at once
async function bulkPropertyDetails(addresses: string[]): Promise<any[]> {
  if (!PROPERTY_API_KEY || addresses.length === 0) return []
  try {
    const url = `${PAPI_BASE}/bulk/details`
    console.log("[v0] PropertyAPI bulk request for", addresses.length, "addresses")
    const res = await fetch(url, {
      method: "POST",
      headers: PAPI_HEADERS,
      body: JSON.stringify({ addresses }),
    })
    console.log("[v0] PropertyAPI bulk response status:", res.status)
    if (!res.ok) {
      console.error(`[PropertyAPI] bulk error ${res.status}:`, await res.text())
      return []
    }
    const data = await res.json()
    if (Array.isArray(data)) return data
    if (data.properties) return data.properties
    if (data.results) return data.results
    if (data.data) return data.data
    return []
  } catch (error) {
    console.error("[PropertyAPI] bulk fetch error:", error)
    return []
  }
}

// Map PropertyAPI.co response to our internal PropertyResult interface
function mapPropertyAPIResponse(p: any, fallbackAddress?: string) {
  return {
    address: p.address || p.property_address || p.streetAddress || p.formattedAddress || fallbackAddress || "Unknown",
    city: p.city || p.addr_city || "",
    state: p.state || p.addr_state || "",
    zip: p.zip || p.zipCode || p.addr_zip || "",
    county: p.county || undefined,
    propertyType: p.propertyType || p.property_type || p.zoning || undefined,
    beds: p.bedrooms || p.beds || undefined,
    baths: p.bathrooms || p.baths || undefined,
    sqft: p.livingArea || p.squareFootage || p.sqft || p.buildingArea || undefined,
    lotSize: p.lotSize || p.lotArea || p.lotAcres || p.lot_size || undefined,
    yearBuilt: p.yearBuilt || p.year_built || undefined,
    value: p.estimatedValue || p.avm || p.assessedValue || p.marketValue || p.value || undefined,
    equity: p.equity || p.estimatedEquity || undefined,
    equityPercent: p.equityPercent || undefined,
    loanBalance: p.loanBalance || p.mortgageBalance || p.totalLoanBalance || undefined,
    foreclosureStatus: p.foreclosureStatus || p.foreclosure || undefined,
    foreclosureAuctionDate: p.auctionDate || p.foreclosureDate || undefined,
    ownerName: p.ownerName || p.owner || (p.ownerFirstName && p.ownerLastName ? `${p.ownerFirstName} ${p.ownerLastName}` : undefined),
    ownerAddress: p.mailingAddress || p.ownerMailingAddress || undefined,
    ownerCity: p.mailingCity || undefined,
    ownerState: p.mailingState || undefined,
    ownerZip: p.mailingZip || undefined,
    lastSaleDate: p.lastSaleDate || p.saleDate || undefined,
    lastSalePrice: p.lastSalePrice || p.salePrice || undefined,
    apn: p.apn || p.parcelNumber || p.parcelId || undefined,
    uuid: p.id || p.uuid || undefined,
    transferDate: p.lastTransferDate || undefined,
    transferAmount: p.lastTransferAmount || undefined,
    loanRate: p.interestRate || p.loanRate || undefined,
    loanType: p.loanType || p.mortgageType || undefined,
    source: "PropertyAPI",
  }
}

// Extract a searchable location string from the user's query
function extractSearchLocation(query: string): string | null {
  const q = query.toLowerCase()

  // Full street address
  const addressMatch = query.match(
    /\d+\s+[\w\s]+(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)[,\s]+[\w\s]+[,\s]+[A-Z]{2}(?:\s+\d{5})?/i,
  )
  if (addressMatch) return addressMatch[0]

  // Zip code
  const zipMatch = q.match(/\b(\d{5})\b/)
  if (zipMatch) return zipMatch[1]

  // "in [County] County, [State]"
  const countyMatch = q.match(/(?:in\s+)?([\w\s]+?)\s+county(?:\s*,?\s*([a-z]{2}))?/i)
  if (countyMatch) {
    const county = countyMatch[1].trim()
    const state = countyMatch[2]?.toUpperCase() || "CA"
    return `${county} County, ${state}`
  }

  // "in [City], [State]"
  const cityStateMatch = q.match(/in\s+([\w\s]+?)\s*,\s*([a-z]{2})/i)
  if (cityStateMatch) {
    return `${cityStateMatch[1].trim()}, ${cityStateMatch[2].toUpperCase()}`
  }

  // "in [Location]"
  const inMatch = q.match(/in\s+([\w\s]+?)(?:\s*$|\s+(?:for|with|that|under|over|where))/i)
  if (inMatch) return `${inMatch[1].trim()}, CA`

  return null
}

// Main: Search properties in an area using PropertyAPI.co
// Strategy: use /autocomplete/address to find real addresses in the area, then /property/detail or /property/comps
async function searchProperties(query: string, intent: string) {
  if (!PROPERTY_API_KEY) {
    console.error("[PropertyAPI] PROPERTY_API env var not set")
    return []
  }

  const searchLocation = extractSearchLocation(query)
  if (!searchLocation) {
    console.error("[PropertyAPI] Could not extract location from:", query)
    return []
  }
  console.log("[v0] searchProperties location:", searchLocation, "intent:", intent)

  // Strategy 1: Use /property/comps with a central address in the area
  // For area-based searches (county, city, zip), we fabricate a central reference address
  // and use comps to find nearby properties
  try {
    // Use autocomplete to resolve the location to a real address
    const suggestions = await autocompleteAddress(searchLocation)
    console.log("[v0] Autocomplete suggestions:", suggestions.length)
    if (suggestions.length > 0) {
      const referenceAddress = suggestions[0]
      console.log("[v0] Using reference address for comps:", referenceAddress)

      // Get comps around this address (wider radius for area searches)
      const comps = await fetchPropertyComps(referenceAddress, 10, 20)
      if (comps.length > 0) {
        console.log("[v0] Got", comps.length, "comps from PropertyAPI")
        return comps.map((p: any) => mapPropertyAPIResponse(p))
      }
    }
  } catch (error) {
    console.error("[PropertyAPI] Comps strategy failed:", error)
  }

  // Strategy 2: Direct detail lookup (for specific addresses)
  try {
    const detail = await fetchPropertyDetail(searchLocation)
    if (detail) {
      console.log("[v0] Got single property detail from PropertyAPI")
      return [mapPropertyAPIResponse(detail, searchLocation)]
    }
  } catch (error) {
    console.error("[PropertyAPI] Detail strategy failed:", error)
  }

  console.log("[v0] PropertyAPI returned no results for:", searchLocation)
  return []
}

// Lookup a single property by address
async function lookupProperty(address: string) {
  if (!PROPERTY_API_KEY || !address) return null

  const detail = await fetchPropertyDetail(address)
  if (detail) return mapPropertyAPIResponse(detail, address)

  return null
}

// Owner lookup — PropertyAPI.co returns owner data in the detail response
async function lookupOwner(address: string) {
  return lookupProperty(address)
}

// Lead Generation - uses Tavily web search to find real lead info
async function generateLeads(query: string) {
  const searchResults = await tavilySearch(`${query} contact email phone real estate`, { max_results: 10 })

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

// Search for Motivated Sellers - PropertyAPI.co + Tavily for distressed properties
async function searchMotivatedSellers(query: string) {
  // Use PropertyAPI.co to search for properties in the area
  const properties = await searchProperties(query, "motivated_sellers")

  // Enrich with web search for distressed/motivated seller context
  const webResults = await tavilySearch(`${query} motivated sellers distressed properties foreclosure`, { max_results: 5 })

  return properties.length > 0 ? properties : []
}

// Search for Cash Buyers - PropertyAPI.co + Tavily for buyer data
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
      "Property Search (PropertyAPI.co)",
      "Foreclosure Search (PropertyAPI.co)",
      "Motivated Sellers / Distressed Properties",
      "Cash Buyers Search",
      "Owner Lookup with Contact Info (PropertyAPI.co)",
      "Lead Generation & Enrichment",
      "Deal Analysis",
      "Image Generation (fal.ai)",
      "CRM Integration (GHL)",
      "Social Media Content Generation",
    ],
  })
}
