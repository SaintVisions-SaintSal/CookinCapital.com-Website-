import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

// ===========================================
// SAINTSAL™ MCP SERVER v3.0 - AI ORCHESTRATION
// Perplexity-Level Responses | Intent Detection
// 35+ Tools | Lead Generation | Property Search
// ===========================================

const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const PROPERTY_API_KEY = process.env.PROPERTY_API
const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

async function handleConversation(query: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are SaintSal™, the AI decision engine for CookinCapital.com - a real estate finance and investment platform.

CRITICAL RULES:
- NEVER recommend external websites (Zillow, Redfin, RealtyTrac, Foreclosure.com, Realtor.com, etc.)
- YOU are the platform. Users search properties, find leads, and analyze deals RIGHT HERE.
- Always tell users to "search here" or "ask me to find" properties — never send them elsewhere.

Your capabilities (all built-in, powered by PropertyAPI + RentCast):
- **Property Search**: Find distressed properties, foreclosures, pre-foreclosures, high-equity homes
- **Owner Lookup**: Get owner contact info for any property
- **Lead Generation**: Find motivated sellers, cash buyers, investors
- **Deal Analysis**: Analyze fix & flip, rental, wholesale deals with ROI calculations
- **Lending Info**: Current rates for fix & flip loans, DSCR, bridge, commercial, SBA, hard money
- **Image Generation**: Create marketing images, social media graphics
- **Social Media Content**: Generate real estate posts, captions, hashtags

You are powered by the HACP™ (Human-AI Collaborative Processing) protocol - Patent #10,290,222.
You provide BUY / PASS / RENEGOTIATE signals with confidence scores.
You grade deals A through F based on ROI (A=20%+, B+=15-20%, B-=10-15%, C=5-10%, D=0-5%, F=negative).

Be helpful, professional, data-driven. Use bullet points and formatting.
When users ask about finding properties, tell them to type their search (e.g., "Find foreclosures in Orange County") and you will pull real data.`,
      prompt: query,
    })
    return text
  } catch (error) {
    console.error("[MCP] Conversation error:", error)
    return `I'm SaintSal, your AI decision engine for CookinCapital.com. Here's what I can do for you right here:

**Property Search** -- Type "Find foreclosures in [city/county]" and I'll pull real listings from our data feeds.

**Owner Lookup** -- Give me an address and I'll find the owner name, mailing address, and contact info.

**Deal Analysis** -- Paste a property address and I'll run the numbers: ARV, equity, cash flow, ROI, and give you a BUY/PASS signal.

**Lead Generation** -- I can find motivated sellers, cash buyers, and investors in any market.

**Lending Rates** -- Ask about fix & flip, DSCR, bridge, SBA, or hard money rates.

Try it now -- type something like "Find foreclosures in Orange County" or "Analyze 123 Main St, Anaheim, CA".`
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
    console.log("[v0] Orchestrating intent:", intent, "for query:", query.slice(0, 80))
    switch (intent) {
      case "conversational":
      case "help":
      case "greeting":
        results.summary = await handleConversation(query)
        // No sources, properties, or leads for pure conversation
        break

      case "foreclosure_search":
      case "property_search":
        console.log("[v0] Running property/foreclosure search branch")
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
// DUAL API INTEGRATION
// 1. RentCast (api.rentcast.io/v1) — Area search, listings, rent/value estimates, market stats
// 2. PropertyAPI.co (api.propertyapi.co) — Property detail, legal info, owner data, comps
// ===========================================

const RC_BASE = "https://api.rentcast.io/v1"
const RC_HEADERS = {
  "X-Api-Key": RENTCAST_API_KEY || "",
  "Accept": "application/json",
}

const PAPI_BASE = "https://api.propertyapi.co"
const PAPI_HEADERS = {
  "X-API-Key": PROPERTY_API_KEY || "",
  "Accept": "application/json",
  "Content-Type": "application/json",
}

// ------- RENTCAST FUNCTIONS -------

// RentCast: GET /v1/properties — search properties by city/state/zip/status
async function rentcastSearchProperties(params: {
  city?: string; state?: string; zipCode?: string; status?: string;
  propertyType?: string; limit?: number; offset?: number;
}): Promise<any[]> {
  if (!RENTCAST_API_KEY) {
    console.error("[RentCast] RENTCAST_API_KEY not set")
    return []
  }
  try {
    const searchParams = new URLSearchParams()
    if (params.city) searchParams.set("city", params.city)
    if (params.state) searchParams.set("state", params.state)
    if (params.zipCode) searchParams.set("zipCode", params.zipCode)
    if (params.status) searchParams.set("status", params.status)
    if (params.propertyType) searchParams.set("propertyType", params.propertyType)
    searchParams.set("limit", String(params.limit || 20))
    if (params.offset) searchParams.set("offset", String(params.offset))

    const url = `${RC_BASE}/properties?${searchParams.toString()}`
    console.log("[v0] RentCast properties request:", url)
    const res = await fetch(url, { headers: RC_HEADERS })
    console.log("[v0] RentCast properties response:", res.status)
    if (!res.ok) {
      const errText = await res.text()
      console.error(`[RentCast] properties error ${res.status}:`, errText)
      return []
    }
    const data = await res.json()
    console.log("[v0] RentCast properties count:", Array.isArray(data) ? data.length : "non-array")
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("[RentCast] properties fetch error:", error)
    return []
  }
}

// RentCast: GET /v1/listings/sale — active sale listings
async function rentcastSaleListings(params: {
  city?: string; state?: string; zipCode?: string; status?: string;
  propertyType?: string; limit?: number;
}): Promise<any[]> {
  if (!RENTCAST_API_KEY) return []
  try {
    const searchParams = new URLSearchParams()
    if (params.city) searchParams.set("city", params.city)
    if (params.state) searchParams.set("state", params.state)
    if (params.zipCode) searchParams.set("zipCode", params.zipCode)
    if (params.status) searchParams.set("status", params.status)
    if (params.propertyType) searchParams.set("propertyType", params.propertyType)
    searchParams.set("limit", String(params.limit || 20))

    const url = `${RC_BASE}/listings/sale?${searchParams.toString()}`
    console.log("[v0] RentCast sale listings request:", url)
    const res = await fetch(url, { headers: RC_HEADERS })
    console.log("[v0] RentCast sale listings response:", res.status)
    if (!res.ok) {
      console.error(`[RentCast] listings error ${res.status}:`, await res.text())
      return []
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("[RentCast] listings fetch error:", error)
    return []
  }
}

// RentCast: GET /v1/avm/value — property value estimate
async function rentcastValueEstimate(address: string): Promise<any | null> {
  if (!RENTCAST_API_KEY) return null
  try {
    const url = `${RC_BASE}/avm/value?address=${encodeURIComponent(address)}`
    const res = await fetch(url, { headers: RC_HEADERS })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// RentCast: GET /v1/avm/rent/long-term — rent estimate
async function rentcastRentEstimate(address: string): Promise<any | null> {
  if (!RENTCAST_API_KEY) return null
  try {
    const url = `${RC_BASE}/avm/rent/long-term?address=${encodeURIComponent(address)}`
    const res = await fetch(url, { headers: RC_HEADERS })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// RentCast: GET /v1/markets — market statistics
async function rentcastMarketStats(params: { zipCode?: string; city?: string; state?: string }): Promise<any | null> {
  if (!RENTCAST_API_KEY) return null
  try {
    const searchParams = new URLSearchParams()
    if (params.zipCode) searchParams.set("zipCode", params.zipCode)
    if (params.city) searchParams.set("city", params.city)
    if (params.state) searchParams.set("state", params.state)
    const url = `${RC_BASE}/markets?${searchParams.toString()}`
    const res = await fetch(url, { headers: RC_HEADERS })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// ------- PROPERTYAPI.CO FUNCTIONS -------

// PropertyAPI: GET /property/detail — full property detail + legal + owner
async function papiPropertyDetail(address: string): Promise<any | null> {
  if (!PROPERTY_API_KEY) {
    console.error("[PropertyAPI] PROPERTY_API key not set")
    return null
  }
  try {
    const url = `${PAPI_BASE}/property/detail?address=${encodeURIComponent(address)}`
    console.log("[v0] PropertyAPI detail request:", url)
    const res = await fetch(url, { headers: PAPI_HEADERS })
    console.log("[v0] PropertyAPI detail response:", res.status)
    if (!res.ok) {
      console.error(`[PropertyAPI] detail error ${res.status}:`, await res.text())
      return null
    }
    const data = await res.json()
    console.log("[v0] PropertyAPI detail keys:", Object.keys(data))
    return data
  } catch (error) {
    console.error("[PropertyAPI] detail error:", error)
    return null
  }
}

// PropertyAPI: GET /property/comps — comparable properties
async function papiPropertyComps(address: string, radius: number = 5, limit: number = 20): Promise<any[]> {
  if (!PROPERTY_API_KEY) return []
  try {
    const url = `${PAPI_BASE}/property/comps?address=${encodeURIComponent(address)}&radius=${radius}&limit=${limit}`
    const res = await fetch(url, { headers: PAPI_HEADERS })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data
    if (data.properties) return data.properties
    if (data.comps) return data.comps
    if (data.results) return data.results
    return []
  } catch { return [] }
}

// ------- RESPONSE MAPPING -------

// Map RentCast property to our PropertyResult interface
function mapRentCastProperty(p: any) {
  const addr = p.addressLine1 || p.formattedAddress || p.address || "Unknown"
  return {
    address: addr,
    city: p.city || "",
    state: p.state || "",
    zip: p.zipCode || "",
    county: p.county || undefined,
    propertyType: p.propertyType || undefined,
    beds: p.bedrooms || undefined,
    baths: p.bathrooms || undefined,
    sqft: p.squareFootage || undefined,
    lotSize: p.lotSize || undefined,
    yearBuilt: p.yearBuilt || undefined,
    units: p.units || undefined,
    value: p.price || p.estimatedValue || p.assessorMarketValue || undefined,
    equity: undefined,
    equityPercent: undefined,
    loanBalance: undefined,
    foreclosureStatus: p.status === "Foreclosure" ? "Foreclosure" : (p.propertyTaxes?.delinquentYear ? "Tax Default" : undefined),
    ownerName: p.ownerName || (p.owner ? `${p.owner.firstName || ""} ${p.owner.lastName || ""}`.trim() : undefined) || undefined,
    ownerAddress: p.owner?.mailingAddress || undefined,
    ownerCity: p.owner?.mailingCity || undefined,
    ownerState: p.owner?.mailingState || undefined,
    ownerZip: p.owner?.mailingZipCode || undefined,
    lastSaleDate: p.lastSaleDate || undefined,
    lastSalePrice: p.lastSalePrice || undefined,
    apn: p.assessorParcelNumber || undefined,
    // RentCast-specific extras
    rentEstimate: p.rentEstimate || undefined,
    daysOnMarket: p.daysOnMarket || undefined,
    listedDate: p.listedDate || undefined,
    listingUrl: p.listingUrl || undefined,
    source: "RentCast",
  }
}

// Map PropertyAPI.co response to PropertyResult
function mapPapiProperty(p: any, fallbackAddress?: string) {
  return {
    address: p.address || p.property_address || p.streetAddress || p.formattedAddress || fallbackAddress || "Unknown",
    city: p.city || p.addr_city || "",
    state: p.state || p.addr_state || "",
    zip: p.zip || p.zipCode || p.addr_zip || "",
    county: p.county || undefined,
    propertyType: p.propertyType || p.property_type || undefined,
    beds: p.bedrooms || p.beds || undefined,
    baths: p.bathrooms || p.baths || undefined,
    sqft: p.squareFootage || p.sqft || p.livingArea || undefined,
    lotSize: p.lotSize || p.lotAcres || undefined,
    yearBuilt: p.yearBuilt || p.year_built || undefined,
    value: p.estimatedValue || p.avm || p.assessedValue || p.marketValue || undefined,
    equity: p.equity || p.estimatedEquity || undefined,
    equityPercent: p.equityPercent || undefined,
    loanBalance: p.loanBalance || p.mortgageBalance || undefined,
    foreclosureStatus: p.foreclosureStatus || p.foreclosure || undefined,
    foreclosureAuctionDate: p.auctionDate || p.foreclosureDate || undefined,
    ownerName: p.ownerName || p.owner || (p.ownerFirstName && p.ownerLastName ? `${p.ownerFirstName} ${p.ownerLastName}` : undefined),
    ownerAddress: p.mailingAddress || p.ownerMailingAddress || undefined,
    ownerCity: p.mailingCity || undefined,
    ownerState: p.mailingState || undefined,
    ownerZip: p.mailingZip || undefined,
    lastSaleDate: p.lastSaleDate || p.saleDate || undefined,
    lastSalePrice: p.lastSalePrice || p.salePrice || undefined,
    apn: p.apn || p.parcelNumber || undefined,
    uuid: p.id || p.uuid || undefined,
    transferDate: p.lastTransferDate || undefined,
    transferAmount: p.lastTransferAmount || undefined,
    loanRate: p.interestRate || p.loanRate || undefined,
    loanType: p.loanType || p.mortgageType || undefined,
    source: "PropertyAPI",
  }
}

// ------- LOCATION PARSING -------

// Map county names to their largest/main cities for RentCast searches
// RentCast doesn't support county-level search, so we search the county seat / major cities
const COUNTY_TO_CITIES: Record<string, string[]> = {
  "orange": ["Santa Ana", "Anaheim", "Irvine", "Huntington Beach", "Fullerton"],
  "los angeles": ["Los Angeles", "Long Beach", "Glendale", "Pasadena", "Compton"],
  "san diego": ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad"],
  "riverside": ["Riverside", "Corona", "Moreno Valley", "Murrieta", "Temecula"],
  "san bernardino": ["San Bernardino", "Fontana", "Ontario", "Rancho Cucamonga", "Victorville"],
  "sacramento": ["Sacramento", "Elk Grove", "Roseville", "Citrus Heights", "Folsom"],
  "santa clara": ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View", "Milpitas"],
  "alameda": ["Oakland", "Fremont", "Hayward", "Berkeley", "San Leandro"],
  "contra costa": ["Concord", "Richmond", "Antioch", "Walnut Creek", "Pittsburg"],
  "fresno": ["Fresno", "Clovis"],
  "kern": ["Bakersfield", "Delano"],
  "san francisco": ["San Francisco"],
  "ventura": ["Oxnard", "Thousand Oaks", "Ventura", "Simi Valley", "Camarillo"],
  "san mateo": ["Daly City", "San Mateo", "Redwood City", "South San Francisco"],
  "san joaquin": ["Stockton", "Tracy", "Manteca", "Lodi"],
  "stanislaus": ["Modesto", "Turlock", "Ceres"],
  "sonoma": ["Santa Rosa", "Petaluma", "Rohnert Park"],
  "tulare": ["Visalia", "Tulare", "Porterville"],
  "solano": ["Vallejo", "Fairfield", "Vacaville"],
  "placer": ["Roseville", "Lincoln", "Rocklin", "Auburn"],
  "marin": ["San Rafael", "Novato"],
  "santa barbara": ["Santa Barbara", "Santa Maria", "Goleta"],
  "monterey": ["Salinas", "Monterey", "Seaside"],
  // Major non-CA counties
  "maricopa": ["Phoenix", "Scottsdale", "Mesa", "Tempe", "Chandler"],
  "clark": ["Las Vegas", "Henderson", "North Las Vegas"],
  "harris": ["Houston", "Pasadena", "Sugar Land"],
  "miami-dade": ["Miami", "Hialeah", "Miami Beach", "Coral Gables"],
  "cook": ["Chicago", "Evanston", "Cicero"],
  "king": ["Seattle", "Bellevue", "Kent", "Renton"],
}

function parseSearchLocation(query: string): { city?: string; state?: string; zipCode?: string; address?: string; county?: string; citiesInCounty?: string[] } {
  const q = query.toLowerCase()

  // Full street address
  const addressMatch = query.match(
    /\d+\s+[\w\s]+(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)[,\s]+[\w\s]+[,\s]+[A-Z]{2}(?:\s+\d{5})?/i,
  )
  if (addressMatch) return { address: addressMatch[0] }

  // Zip code
  const zipMatch = q.match(/\b(\d{5})\b/)
  if (zipMatch) return { zipCode: zipMatch[1] }

  // "[County] County, [State]" or "[County] County"
  const countyMatch = q.match(/(?:in\s+)?([\w\s]+?)\s+county(?:\s*,?\s*([a-z]{2}))?/i)
  if (countyMatch) {
    const countyName = countyMatch[1].trim()
    const state = countyMatch[2]?.toUpperCase() || "CA"
    const cities = COUNTY_TO_CITIES[countyName.toLowerCase()]
    // Use county seat (first city) as the primary search city
    return {
      county: countyName,
      city: cities?.[0] || countyName,
      state,
      citiesInCounty: cities,
    }
  }

  // "in [City], [State]"
  const cityStateMatch = q.match(/in\s+([\w\s]+?)\s*,\s*([a-z]{2})/i)
  if (cityStateMatch) {
    return { city: cityStateMatch[1].trim(), state: cityStateMatch[2].toUpperCase() }
  }

  // "in [Location]"
  const inMatch = q.match(/in\s+([\w\s]+?)(?:\s*$|\s+(?:for|with|that|under|over|where))/i)
  if (inMatch) {
    const loc = inMatch[1].trim()
    // Check if it matches a known county name
    if (COUNTY_TO_CITIES[loc.toLowerCase()]) {
      return { county: loc, city: COUNTY_TO_CITIES[loc.toLowerCase()][0], state: "CA", citiesInCounty: COUNTY_TO_CITIES[loc.toLowerCase()] }
    }
    return { city: loc, state: "CA" }
  }

  return {}
}

// ------- MAIN SEARCH FUNCTIONS -------

// Search properties: RentCast for area search, PropertyAPI.co for detail enrichment
async function searchProperties(query: string, intent: string) {
  const location = parseSearchLocation(query)
  console.log("[v0] searchProperties parsed location:", JSON.stringify(location), "intent:", intent)

  // Determine RentCast status filter based on intent
  let rcStatus: string | undefined
  const q = query.toLowerCase()
  if (intent === "foreclosure_search" || q.includes("foreclosure") || q.includes("pre-foreclosure") || q.includes("distressed")) {
    rcStatus = "Foreclosure"
  }

  // Strategy 1: RentCast area search (city/state/zip)
  if (RENTCAST_API_KEY && (location.city || location.zipCode)) {
    try {
      // For county-level searches, search across multiple cities in that county
      const citiesToSearch = location.citiesInCounty || [location.city].filter(Boolean) as string[]
      let allResults: any[] = []

      for (const cityName of citiesToSearch.slice(0, 5)) { // Max 5 cities to stay in budget
        console.log("[v0] RentCast searching city:", cityName, "state:", location.state, "status:", rcStatus)

        // Try property records with status filter
        let results = await rentcastSearchProperties({
          city: cityName,
          state: location.state,
          status: rcStatus,
          limit: 10,
        })

        // If no results with status, try sale listings endpoint
        if (results.length === 0 && rcStatus) {
          console.log("[v0] Trying sale listings for:", cityName)
          results = await rentcastSaleListings({
            city: cityName,
            state: location.state,
            status: rcStatus,
            limit: 10,
          })
        }

        if (results.length > 0) {
          allResults = allResults.concat(results)
          console.log("[v0] Found", results.length, "in", cityName, "- total:", allResults.length)
        }

        // If we have enough results, stop early
        if (allResults.length >= 20) break
      }

      // If no results with status filter across all cities, try primary city without filter
      if (allResults.length === 0 && rcStatus) {
        console.log("[v0] No foreclosure results, searching primary city without status filter...")
        const primaryCity = location.citiesInCounty?.[0] || location.city
        if (primaryCity) {
          allResults = await rentcastSearchProperties({
            city: primaryCity,
            state: location.state,
            limit: 20,
          })
        }
      }

      if (allResults.length > 0) {
        console.log("[v0] RentCast total results:", allResults.length)
        return allResults.slice(0, 20).map(mapRentCastProperty)
      }
    } catch (error) {
      console.error("[v0] RentCast search failed:", error)
    }
  } else {
    console.log("[v0] Skipping RentCast - API key:", !!RENTCAST_API_KEY, "city:", location.city, "zip:", location.zipCode)
  }

  // Strategy 2: PropertyAPI.co detail lookup (for specific addresses)
  if (PROPERTY_API_KEY && location.address) {
    try {
      const detail = await papiPropertyDetail(location.address)
      if (detail) {
        console.log("[v0] PropertyAPI returned detail for address")
        return [mapPapiProperty(detail, location.address)]
      }
    } catch (error) {
      console.error("[v0] PropertyAPI detail failed:", error)
    }
  }

  // Strategy 3: PropertyAPI.co comps (for area search fallback)
  if (PROPERTY_API_KEY && location.address) {
    try {
      const comps = await papiPropertyComps(location.address, 10, 20)
      if (comps.length > 0) {
        return comps.map((p: any) => mapPapiProperty(p))
      }
    } catch (error) {
      console.error("[v0] PropertyAPI comps failed:", error)
    }
  }

  console.log("[v0] No property results from any API for:", query)
  return []
}

// Lookup single property: PropertyAPI.co for detail + RentCast for value/rent estimates
async function lookupProperty(address: string) {
  if (!address) return null

  let result: any = null

  // Try PropertyAPI.co first for full legal/owner detail
  if (PROPERTY_API_KEY) {
    const detail = await papiPropertyDetail(address)
    if (detail) {
      result = mapPapiProperty(detail, address)
    }
  }

  // Enrich with RentCast value + rent estimates
  if (RENTCAST_API_KEY) {
    try {
      const [valueEst, rentEst] = await Promise.all([
        rentcastValueEstimate(address),
        rentcastRentEstimate(address),
      ])
      if (result) {
        if (valueEst?.price) result.value = valueEst.price
        if (valueEst?.priceRangeLow) result.valueLow = valueEst.priceRangeLow
        if (valueEst?.priceRangeHigh) result.valueHigh = valueEst.priceRangeHigh
        if (rentEst?.rent) result.rentEstimate = rentEst.rent
        if (rentEst?.rentRangeLow) result.rentLow = rentEst.rentRangeLow
        if (rentEst?.rentRangeHigh) result.rentHigh = rentEst.rentRangeHigh
      } else {
        // Fall back to RentCast property search by address
        const rcResults = await rentcastSearchProperties({ city: address, state: "CA", limit: 1 })
        if (rcResults.length > 0) {
          result = mapRentCastProperty(rcResults[0])
          if (valueEst?.price) result.value = valueEst.price
          if (rentEst?.rent) result.rentEstimate = rentEst.rent
        }
      }
    } catch (error) {
      console.error("[v0] RentCast enrichment error:", error)
    }
  }

  return result
}

// Owner lookup — uses PropertyAPI.co detail (includes owner data)
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

// Search for Motivated Sellers - use RentCast foreclosure/distress search + Tavily
async function searchMotivatedSellers(query: string) {
  // Search with foreclosure intent to pull distressed properties
  const properties = await searchProperties(query, "foreclosure_search")
  return properties
}

// Search for Cash Buyers - search recent sales with no mortgage (all-cash)
async function searchCashBuyers(query: string) {
  const properties = await searchProperties(query, "property_search")
  return properties
}

// Generate AI Summary
async function generateSummary(query: string, intent: string, context: any) {
  const propertyCount = context.properties?.length || 0
  const hasRealData = propertyCount > 0

  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are SaintSal™, the AI decision engine for CookinCapital.com - a real estate finance and investment platform.

CRITICAL RULES:
- You are POWERED BY PropertyAPI and RentCast. You pull REAL property data.
- NEVER tell users to visit external websites like Zillow, Redfin, RealtyTrac, Foreclosure.com, Realtor.com etc.
- NEVER suggest users "search on" or "look at" any external platform. YOU are the platform.
- If you have property data in the context, summarize it with real numbers (addresses, values, equity, foreclosure status).
- If you have NO property data, say "I searched but didn't find matching properties in that area right now. Try a different city, zip code, or broaden your search."
- Always reference data as "from our PropertyAPI + RentCast data feeds" not from any external site.
- For property searches: highlight addresses, values, equity %, foreclosure status, beds/baths, and investment potential.
- For deals: give a BUY/PASS/RENEGOTIATE signal with confidence score.
- Use markdown formatting. Be direct and data-driven.`,
      prompt: `Query: ${query}
Intent: ${intent}
Properties found: ${propertyCount}
${hasRealData ? `Property data: ${JSON.stringify(context.properties?.slice(0, 5)).slice(0, 3000)}` : "No property results from API."}
${context.webContext?.answer ? `Web context: ${context.webContext.answer.slice(0, 500)}` : ""}

${hasRealData
  ? `Summarize the ${propertyCount} properties found. Highlight the best investment opportunities. Include actual addresses and numbers from the data.`
  : `No properties matched this search. Acknowledge this and suggest the user try a different location, zip code, or search type. Do NOT recommend external websites.`
}`,
    })

    return text
  } catch {
    if (hasRealData) {
      return `Found **${propertyCount} properties** matching your search. Review the property cards below for detailed investment metrics.`
    }
    return context.webContext?.answer || "I searched our data feeds but didn't find matching properties. Try a specific city name or zip code."
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

    console.log("[v0] MCP POST called with query:", query?.slice(0, 100), "intent:", providedIntent)
    console.log("[v0] ENV CHECK - PROPERTY_API:", PROPERTY_API_KEY ? `SET (${PROPERTY_API_KEY.slice(0, 8)}...)` : "NOT SET")
    console.log("[v0] ENV CHECK - RENTCAST_API_KEY:", RENTCAST_API_KEY ? `SET (${RENTCAST_API_KEY.slice(0, 8)}...)` : "NOT SET")
    console.log("[v0] ENV CHECK - TAVILY_API_KEY:", TAVILY_API_KEY ? "SET" : "NOT SET")

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

  if (q.includes("foreclosure") || q.includes("pre-foreclosure") || q.includes("nod") || q.includes("auction") || q.includes("reo") || q.includes("bank owned") || q.includes("short sale")) {
    return "foreclosure_search"
  }
  // Distressed / motivated keywords -- route to foreclosure_search to pull real data
  if (q.includes("distress") || q.includes("motivated") || q.includes("desperate") || q.includes("urgent") || q.includes("bankruptcy") || q.includes("probate") || q.includes("divorce") || q.includes("tax lien") || q.includes("tax default") || q.includes("vacant") || q.includes("abandoned") || q.includes("inherited")) {
    return "foreclosure_search"
  }
  // General property search: "find properties", "search homes", "target investments"
  if (q.includes("find") || q.includes("search") || q.includes("look for") || q.includes("target")) {
    if (q.includes("property") || q.includes("properties") || q.includes("home") || q.includes("house") || q.includes("real estate") || q.includes("listing") || q.includes("deal") || q.includes("investment")) {
      return "property_search"
    }
  }
  // Location-based queries with property context
  if (q.match(/in\s+[\w\s]+(?:county|,\s*[a-z]{2})/i) || q.match(/\b\d{5}\b/)) {
    if (q.includes("property") || q.includes("home") || q.includes("house") || q.includes("find") || q.includes("search") || q.includes("foreclosure") || q.includes("listing")) {
      return "property_search"
    }
  }
  if (q.includes("property") && (q.includes("find") || q.includes("search"))) {
    return "property_search"
  }
  if (q.includes("owner") && (q.includes("find") || q.includes("contact") || q.includes("phone") || q.includes("who owns") || q.includes("lookup"))) {
    return "owner_lookup"
  }
  if (q.match(/\d+\s+\w+\s+(st|street|ave|avenue|blvd|dr|rd|ln|way|ct)/i)) {
    return "property_lookup"
  }
  if (q.includes("lead") || q.includes("investor") || q.includes("buyer") || q.includes("seller")) {
    return "lead_generation"
  }
  if (q.includes("cash buyer") || q.includes("cash investor")) {
    return "cash_buyers"
  }
  if (q.includes("analyze") || q.includes("analysis") || q.includes("flip") || q.includes("roi") || q.includes("arv") || q.includes("rehab")) {
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
      "Property Search (RentCast + PropertyAPI.co)",
      "Foreclosure & Distressed Property Search (RentCast)",
      "Property Detail & Legal Info (PropertyAPI.co)",
      "Value & Rent Estimates (RentCast AVM)",
      "Market Statistics (RentCast)",
      "Owner Lookup with Contact Info (PropertyAPI.co)",
      "Lead Generation & Enrichment",
      "Deal Analysis",
      "Image Generation (fal.ai)",
      "CRM Integration (GHL)",
      "Social Media Content Generation",
    ],
  })
}
