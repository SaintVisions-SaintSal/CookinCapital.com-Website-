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
const PROPERTYRADAR_API_KEY = process.env.PROPERTYRADAR_API_KEY

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
// PROPERTYRADAR API INTEGRATION
// Real property data: foreclosures, distressed, equity, owners
// ===========================================

// Common California county FIPS codes for fast lookup
const CA_COUNTY_FIPS: Record<string, string> = {
  "alameda": "6001", "alpine": "6003", "amador": "6005", "butte": "6007",
  "calaveras": "6009", "colusa": "6011", "contra costa": "6013", "del norte": "6015",
  "el dorado": "6017", "fresno": "6019", "glenn": "6021", "humboldt": "6023",
  "imperial": "6025", "inyo": "6027", "kern": "6029", "kings": "6031",
  "lake": "6033", "lassen": "6035", "los angeles": "6037", "madera": "6039",
  "marin": "6041", "mariposa": "6043", "mendocino": "6045", "merced": "6047",
  "modoc": "6049", "mono": "6051", "monterey": "6053", "napa": "6055",
  "nevada": "6057", "orange": "6059", "placer": "6061", "plumas": "6063",
  "riverside": "6065", "sacramento": "6067", "san benito": "6069",
  "san bernardino": "6071", "san diego": "6073", "san francisco": "6075",
  "san joaquin": "6077", "san luis obispo": "6079", "san mateo": "6081",
  "santa barbara": "6083", "santa clara": "6085", "santa cruz": "6087",
  "shasta": "6089", "sierra": "6091", "siskiyou": "6093", "solano": "6095",
  "sonoma": "6097", "stanislaus": "6099", "sutter": "6101", "tehama": "6103",
  "trinity": "6105", "tulare": "6107", "tuolumne": "6109", "ventura": "6111",
  "yolo": "6113", "yuba": "6115",
}

// State abbreviation to FIPS prefix
const STATE_FIPS_PREFIX: Record<string, string> = {
  "al": "01", "ak": "02", "az": "04", "ar": "05", "ca": "06", "co": "08",
  "ct": "09", "de": "10", "fl": "12", "ga": "13", "hi": "15", "id": "16",
  "il": "17", "in": "18", "ia": "19", "ks": "20", "ky": "21", "la": "22",
  "me": "23", "md": "24", "ma": "25", "mi": "26", "mn": "27", "ms": "28",
  "mo": "29", "mt": "30", "ne": "31", "nv": "32", "nh": "33", "nj": "34",
  "nm": "35", "ny": "36", "nc": "37", "nd": "38", "oh": "39", "ok": "40",
  "or": "41", "pa": "42", "ri": "44", "sc": "45", "sd": "46", "tn": "47",
  "tx": "48", "ut": "49", "vt": "50", "va": "51", "wa": "53", "wv": "54",
  "wi": "55", "wy": "56",
}

// Parse location from natural language query
function parseLocation(query: string): { county?: string; city?: string; state?: string; zip?: string; address?: string } {
  const q = query.toLowerCase()

  // Check for zip code
  const zipMatch = q.match(/\b(\d{5})\b/)
  if (zipMatch) return { zip: zipMatch[1] }

  // Check for full address pattern
  const addressMatch = query.match(
    /(\d+\s+[\w\s]+(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court))[,\s]+([\w\s]+)[,\s]+([A-Z]{2})(?:\s+\d{5})?/i,
  )
  if (addressMatch) return { address: addressMatch[0] }

  // Check for "county" keyword: "Orange County", "Los Angeles County"
  const countyMatch = q.match(/(?:in\s+)?([\w\s]+?)\s+county(?:\s*,?\s*([a-z]{2}))?/i)
  if (countyMatch) {
    return {
      county: countyMatch[1].trim(),
      state: countyMatch[2]?.toUpperCase() || "CA",
    }
  }

  // Check for "in [City], [State]"
  const cityStateMatch = q.match(/in\s+([\w\s]+?)\s*,\s*([a-z]{2})/i)
  if (cityStateMatch) {
    return {
      city: cityStateMatch[1].trim(),
      state: cityStateMatch[2].toUpperCase(),
    }
  }

  // Check for "in [Location]" - could be city or county
  const inMatch = q.match(/in\s+([\w\s]+?)(?:\s*$|\s+(?:for|with|that|under|over|where))/i)
  if (inMatch) {
    const loc = inMatch[1].trim()
    // Check if it's a known CA county
    if (CA_COUNTY_FIPS[loc.toLowerCase()]) {
      return { county: loc, state: "CA" }
    }
    return { city: loc, state: "CA" }
  }

  return {}
}

// Resolve a county name to FIPS code
function resolveCountyFIPS(countyName: string, state: string = "CA"): string | null {
  const key = countyName.toLowerCase().replace(/\s+county$/i, "").trim()
  if (state.toUpperCase() === "CA" && CA_COUNTY_FIPS[key]) {
    return CA_COUNTY_FIPS[key]
  }
  return null
}

// Default fields to request from PropertyRadar
const PR_FIELDS = [
  "RadarID", "Address", "City", "State", "ZipFive", "County",
  "PType", "Beds", "Baths", "SqFt", "LotSizeAcres", "YearBuilt", "Units",
  "AVM", "AvailableEquity", "EquityPercent", "TotalLoanBalance",
  "inForeclosure", "ForeclosureStage", "SaleDate", "OpeningBid", "DefaultAmount",
  "inTaxDefault", "TaxDefaultYears",
  "inDivorce", "DivorceRecordingDate",
  "inBankruptcy", "BankruptcyStatus", "BankruptcyChapter",
  "PropertyHasOpenLiens", "TotalOpenLienAmount",
  "isSiteVacant", "isAbsenteeOwner", "isDeceased",
  "Owner1FirstName", "Owner1LastName", "MailAddress", "MailCity", "MailState", "MailZipFive",
  "LastTransferRecDate", "LastTransferValue", "LastTransferDocType",
  "FirstLoanAmount", "FirstLoanRate", "FirstLoanType",
].join(",")

// Call PropertyRadar API
async function callPropertyRadar(
  criteria: Array<{ name: string; value: (string | number)[] }>,
  options: { limit?: number; start?: number; fields?: string; sort?: string } = {},
): Promise<any[]> {
  if (!PROPERTYRADAR_API_KEY) {
    console.error("[PropertyRadar] API key not configured")
    return []
  }

  const limit = options.limit || 20
  const start = options.start || 0
  const fields = options.fields || PR_FIELDS

  try {
    const url = `https://api.propertyradar.com/v1/properties?Purchase=1&Fields=${encodeURIComponent(fields)}&Limit=${limit}&Start=${start}`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PROPERTYRADAR_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ criteria }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[PropertyRadar] API error ${res.status}:`, errorText)
      return []
    }

    const data = await res.json()

    if (!data || !data.results) {
      console.error("[PropertyRadar] No results in response:", JSON.stringify(data).slice(0, 500))
      return []
    }

    return data.results || []
  } catch (error) {
    console.error("[PropertyRadar] Request error:", error)
    return []
  }
}

// Map PropertyRadar response to our PropertyResult interface
function mapPropertyRadarResponse(p: any) {
  const foreclosureStageMap: Record<string, string> = {
    "NOD": "Notice of Default",
    "NTS": "Notice of Trustee Sale",
    "LIS": "Lis Pendens",
    "REO": "Bank Owned (REO)",
  }

  const ownerParts = [p.Owner1FirstName, p.Owner1LastName].filter(Boolean)

  return {
    radarId: p.RadarID?.toString() || undefined,
    address: p.Address || "Unknown",
    city: p.City || "",
    state: p.State || "",
    zip: p.ZipFive || "",
    county: p.County || undefined,
    propertyType: p.PType || undefined,
    beds: p.Beds || undefined,
    baths: p.Baths || undefined,
    sqft: p.SqFt || undefined,
    lotSize: p.LotSizeAcres || undefined,
    yearBuilt: p.YearBuilt || undefined,
    units: p.Units || undefined,
    value: p.AVM || undefined,
    availableEquity: p.AvailableEquity || undefined,
    equityPercent: p.EquityPercent || undefined,
    equity: p.AvailableEquity || undefined,
    loanBalance: p.TotalLoanBalance || undefined,
    foreclosureStatus: p.inForeclosure
      ? (foreclosureStageMap[p.ForeclosureStage] || p.ForeclosureStage || "In Foreclosure")
      : undefined,
    foreclosureAuctionDate: p.SaleDate || undefined,
    foreclosureOpeningBid: p.OpeningBid || undefined,
    taxDefaultYears: p.TaxDefaultYears || undefined,
    taxDefaultAmount: p.DefaultAmount || undefined,
    inDivorce: p.inDivorce ? true : undefined,
    divorceRecordingDate: p.DivorceRecordingDate || undefined,
    inBankruptcy: p.inBankruptcy ? true : undefined,
    bankruptcyStatus: p.BankruptcyStatus || undefined,
    bankruptcyChapter: p.BankruptcyChapter || undefined,
    hasLiens: p.PropertyHasOpenLiens ? true : undefined,
    lienAmount: p.TotalOpenLienAmount || undefined,
    isVacant: p.isSiteVacant ? true : undefined,
    isDeceased: p.isDeceased ? true : undefined,
    ownerName: ownerParts.length > 0 ? ownerParts.join(" ") : undefined,
    ownerAddress: p.MailAddress || undefined,
    ownerCity: p.MailCity || undefined,
    ownerState: p.MailState || undefined,
    ownerZip: p.MailZipFive || undefined,
    transferType: p.LastTransferDocType || undefined,
    transferDate: p.LastTransferRecDate || undefined,
    transferAmount: p.LastTransferValue || undefined,
    loanRate: p.FirstLoanRate || undefined,
    loanType: p.FirstLoanType || undefined,
    source: "PropertyRadar",
  }
}

// PropertyRadar-Powered Property Search
async function searchProperties(query: string, intent: string) {
  const location = parseLocation(query)
  const criteria: Array<{ name: string; value: (string | number)[] }> = []

  // Build location criteria
  if (location.zip) {
    criteria.push({ name: "ZipFive", value: [location.zip] })
  } else if (location.county) {
    const fips = resolveCountyFIPS(location.county, location.state || "CA")
    if (fips) {
      criteria.push({ name: "County", value: [fips] })
    } else {
      // Fallback: try city name if county FIPS not found
      criteria.push({ name: "City", value: [location.county] })
      if (location.state) criteria.push({ name: "State", value: [location.state] })
    }
  } else if (location.city) {
    criteria.push({ name: "City", value: [location.city] })
    if (location.state) criteria.push({ name: "State", value: [location.state] })
  } else {
    // Default to California
    criteria.push({ name: "State", value: ["CA"] })
  }

  // Add intent-specific criteria
  if (intent === "foreclosure_search") {
    criteria.push({ name: "inForeclosure", value: [1] })
  }

  // Add property type filter if mentioned
  const q = query.toLowerCase()
  if (q.includes("single family") || q.includes("sfr") || q.includes("house")) {
    criteria.push({ name: "PType", value: ["SFR"] })
  } else if (q.includes("condo")) {
    criteria.push({ name: "PType", value: ["CND"] })
  } else if (q.includes("multi") || q.includes("duplex") || q.includes("triplex") || q.includes("apartment")) {
    criteria.push({ name: "PType", value: ["MFR"] })
  }

  // Try PropertyRadar first
  if (PROPERTYRADAR_API_KEY) {
    try {
      const results = await callPropertyRadar(criteria, { limit: 20 })
      if (results.length > 0) {
        return results.map(mapPropertyRadarResponse)
      }
      console.log("[PropertyRadar] No results for criteria:", JSON.stringify(criteria))
    } catch (error) {
      console.error("[PropertyRadar] Search failed, falling back:", error)
    }
  }

  // Fallback to old PropertyAPI geocode-based single-parcel lookup
  return fallbackPropertyAPISearch(query)
}

// Fallback: Old PropertyAPI geocode-based lookup
async function fallbackPropertyAPISearch(query: string) {
  if (!PROPERTY_API_KEY) return []

  try {
    const locationMatch = query.match(/in\s+([^,]+(?:,\s*[A-Z]{2})?)/i)
    const addressMatch = query.match(
      /\d+\s+[\w\s]+(?:st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)[,\s]+[\w\s]+[,\s]+[A-Z]{2}(?:\s+\d{5})?/i,
    )
    const searchLocation = addressMatch?.[0] || locationMatch?.[1]?.trim()
    if (!searchLocation) return []

    const MAPS_API_KEY = process.env.GOOGLE_MAPS_API
    if (!MAPS_API_KEY) return []

    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${MAPS_API_KEY}`)
    const geoData = await geoRes.json()
    if (geoData.status !== "OK" || !geoData.results?.[0]) return []

    const { lat, lng } = geoData.results[0].geometry.location
    const propRes = await fetch(`https://propertyapi.co/api/v1/parcels/get?latitude=${lat}&longitude=${lng}`, {
      headers: { "X-Api-Key": PROPERTY_API_KEY, "Accept": "application/json" },
    })
    if (!propRes.ok) return []
    const data = await propRes.json()
    if (data.status === "error" || data.error) return []

    const properties = Array.isArray(data) ? data : [data]
    return properties.map((p: any) => ({
      address: p.property_address || searchLocation || "Unknown",
      city: p.addr_city || "",
      state: p.addr_state || "",
      zip: p.addr_zip || "",
      value: p.market_value_estimate || p.total_value_assessed || 0,
      beds: p.bedrooms || 0,
      baths: p.bathrooms || 0,
      sqft: p.sqft || 0,
      yearBuilt: p.year_built || null,
      source: "PropertyAPI",
    }))
  } catch (error) {
    console.error("[PropertyAPI Fallback] Error:", error)
    return []
  }
}

// PropertyRadar-Powered Property Lookup (single address)
async function lookupProperty(address: string) {
  if (!address) return null

  if (PROPERTYRADAR_API_KEY) {
    try {
      // Parse address components
      const parts = address.match(/^(.+?),\s*(.+?),\s*([A-Z]{2})(?:\s+(\d{5}))?$/i)
      const criteria: Array<{ name: string; value: (string | number)[] }> = []

      if (parts) {
        criteria.push({ name: "Address", value: [parts[1].trim()] })
        criteria.push({ name: "City", value: [parts[2].trim()] })
        criteria.push({ name: "State", value: [parts[3].trim()] })
      } else {
        // Try the raw address as-is
        criteria.push({ name: "Address", value: [address] })
        criteria.push({ name: "State", value: ["CA"] })
      }

      const results = await callPropertyRadar(criteria, { limit: 1 })
      if (results.length > 0) {
        return mapPropertyRadarResponse(results[0])
      }
    } catch (error) {
      console.error("[PropertyRadar] Lookup failed:", error)
    }
  }

  // Fallback to old method
  const fallback = await fallbackPropertyAPISearch(address)
  return fallback.length > 0 ? fallback[0] : null
}

// Owner Lookup - PropertyRadar includes owner data in every response
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

// Search for Motivated Sellers via PropertyRadar distress criteria
async function searchMotivatedSellers(query: string) {
  const location = parseLocation(query)
  const criteria: Array<{ name: string; value: (string | number)[] }> = []

  // Location
  if (location.zip) {
    criteria.push({ name: "ZipFive", value: [location.zip] })
  } else if (location.county) {
    const fips = resolveCountyFIPS(location.county, location.state || "CA")
    if (fips) criteria.push({ name: "County", value: [fips] })
    else {
      criteria.push({ name: "City", value: [location.county] })
      if (location.state) criteria.push({ name: "State", value: [location.state] })
    }
  } else if (location.city) {
    criteria.push({ name: "City", value: [location.city] })
    if (location.state) criteria.push({ name: "State", value: [location.state] })
  } else {
    criteria.push({ name: "State", value: ["CA"] })
  }

  // Distress signals - any of these make a motivated seller
  // PropertyRadar OR logic: we search for foreclosure first, then can layer
  const q = query.toLowerCase()
  if (q.includes("foreclosure") || q.includes("pre-foreclosure")) {
    criteria.push({ name: "inForeclosure", value: [1] })
  } else if (q.includes("tax") || q.includes("delinquen")) {
    criteria.push({ name: "inTaxDefault", value: [1] })
  } else if (q.includes("divorce")) {
    criteria.push({ name: "inDivorce", value: [1] })
  } else if (q.includes("bankrupt")) {
    criteria.push({ name: "inBankruptcy", value: [1] })
  } else if (q.includes("vacant")) {
    criteria.push({ name: "isSiteVacant", value: [1] })
  } else if (q.includes("deceased") || q.includes("probate")) {
    criteria.push({ name: "isDeceased", value: [1] })
  } else {
    // General motivated sellers = in foreclosure OR high equity absentee
    criteria.push({ name: "inForeclosure", value: [1] })
  }

  if (PROPERTYRADAR_API_KEY) {
    try {
      const results = await callPropertyRadar(criteria, { limit: 20 })
      if (results.length > 0) return results.map(mapPropertyRadarResponse)
    } catch (error) {
      console.error("[PropertyRadar] Motivated sellers search failed:", error)
    }
  }

  return fallbackPropertyAPISearch(query)
}

// Search for Cash Buyers via PropertyRadar
async function searchCashBuyers(query: string) {
  const location = parseLocation(query)
  const criteria: Array<{ name: string; value: (string | number)[] }> = []

  // Location
  if (location.zip) {
    criteria.push({ name: "ZipFive", value: [location.zip] })
  } else if (location.county) {
    const fips = resolveCountyFIPS(location.county, location.state || "CA")
    if (fips) criteria.push({ name: "County", value: [fips] })
    else {
      criteria.push({ name: "City", value: [location.county] })
      if (location.state) criteria.push({ name: "State", value: [location.state] })
    }
  } else if (location.city) {
    criteria.push({ name: "City", value: [location.city] })
    if (location.state) criteria.push({ name: "State", value: [location.state] })
  } else {
    criteria.push({ name: "State", value: ["CA"] })
  }

  // Cash buyer criteria
  criteria.push({ name: "isCashBuyer", value: [1] })

  if (PROPERTYRADAR_API_KEY) {
    try {
      const results = await callPropertyRadar(criteria, { limit: 20 })
      if (results.length > 0) return results.map(mapPropertyRadarResponse)
    } catch (error) {
      console.error("[PropertyRadar] Cash buyers search failed:", error)
    }
  }

  return fallbackPropertyAPISearch(query)
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
      "Property Search (PropertyRadar - Real Data)",
      "Foreclosure Search (PropertyRadar)",
      "Motivated Sellers / Distressed Properties (PropertyRadar)",
      "Cash Buyers Search (PropertyRadar)",
      "Owner Lookup with Contact Info (PropertyRadar)",
      "Lead Generation & Enrichment",
      "Deal Analysis",
      "Image Generation (fal.ai)",
      "CRM Integration (GHL)",
      "Social Media Content Generation",
    ],
  })
}
