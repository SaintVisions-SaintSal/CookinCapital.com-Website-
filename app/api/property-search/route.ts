import { type NextRequest, NextResponse } from "next/server"

const PROPERTY_API_KEY =
  process.env.PROPERTYAPI_KEY || process.env.PROPERTY_API || process.env.PROPERTY_API_KEY
const PROPERTY_API_BASE = "https://propertyapi.co/api/v1"
const PROPERTY_API_HEADERS = {
  "X-API-Key": PROPERTY_API_KEY || "",
  Accept: "application/json",
  "Content-Type": "application/json",
}

// -------------------------------------------------------
// GET /api/property-search
// PropertyAPI address lookup via query params
// -------------------------------------------------------
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const address = sp.get("address")

  if (!PROPERTY_API_KEY) {
    return NextResponse.json({ error: "PropertyAPI key not configured" }, { status: 500 })
  }

  if (!address) {
    return NextResponse.json({ 
      error: "address query parameter is required (e.g., ?address=123%20Main%20St,%20Los%20Angeles,%20CA)" 
    }, { status: 400 })
  }

  try {
    const detail = await papiPropertyDetail(address)
    if (!detail) {
      return NextResponse.json({ error: "Property not found at that address" }, { status: 404 })
    }
    return NextResponse.json({
      source: "PropertyAPI",
      resultCount: 1,
      properties: [mapPapiProperty(detail)],
    })
  } catch (error) {
    console.error("PropertyAPI lookup error:", error)
    const msg = error instanceof Error ? error.message : "PropertyAPI lookup failed"
    // Upstream/network errors should surface as 502 Bad Gateway
    const status = msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("PropertyAPI") ? 502 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

// -------------------------------------------------------
// POST /api/property-search
// PropertyAPI address lookup only
// -------------------------------------------------------
export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!PROPERTY_API_KEY) {
    return NextResponse.json({ error: "PropertyAPI key not configured" }, { status: 500 })
  }

  const address = body.address || `${body.streetAddress || ""} ${body.city || ""} ${body.state || ""} ${body.zip || ""}`.trim()
  
  if (!address) {
    return NextResponse.json({ 
      error: "PropertyAPI requires a complete address. Please use Address Lookup mode and enter a full street address with city and state." 
    }, { status: 400 })
  }

  try {
    const detail = await papiPropertyDetail(address)
    if (!detail) {
      return NextResponse.json({ error: "Property not found at that address" }, { status: 404 })
    }
    return NextResponse.json({
      source: "PropertyAPI",
      resultCount: 1,
      properties: [mapPapiProperty(detail)],
    })
  } catch (error) {
    console.error("PropertyAPI search error:", error)
    const msg = error instanceof Error ? error.message : "PropertyAPI search failed"
    const status = msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("PropertyAPI") ? 502 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

async function papiPropertyDetail(address: string): Promise<any | null> {
  if (!PROPERTY_API_KEY) return null

  try {
    const url = `${PROPERTY_API_BASE}/parcels/search-by-address?address=${encodeURIComponent(address)}`
    console.log("[PropertyAPI] search-by-address request:", url)
    const res = await fetch(url, { headers: PROPERTY_API_HEADERS })
    if (!res.ok) {
      const text = await res.text()
      console.error("[PropertyAPI] search-by-address error", res.status, text)
      throw new Error(`[PropertyAPI ${res.status}] ${text}`)
    }

    const payload = await res.json()
    if (!payload || payload.status !== "ok" || !payload.data) {
      console.error("[PropertyAPI] unexpected response", payload)
      return null
    }

    return payload.data
  } catch (error) {
    console.error("[PropertyAPI] search-by-address error:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

function mapPapiProperty(p: any) {
  return {
    address: p.address || p.property_address || p.streetAddress || p.formattedAddress || "",
    city: p.city || p.addr_city || "",
    state: p.state || p.addr_state || "",
    zip: p.zip || p.zipCode || p.zip_code || p.addr_zip || "",
    county: p.county || undefined,
    latitude: p.latitude || p.lat || undefined,
    longitude: p.longitude || p.longitude || p.long || undefined,
    propertyType: p.propertyType || p.property_type || undefined,
    beds: p.bedrooms || p.beds || undefined,
    baths: p.bathrooms || p.baths || undefined,
    sqft: p.square_feet || p.squareFootage || p.sqft || p.livingArea || undefined,
    lotSize: p.lot_size || p.lotSize || p.lotAcres || undefined,
    yearBuilt: p.yearBuilt || p.year_built || undefined,
    value: p.estimatedValue || p.avm || p.assessedValue || p.marketValue || undefined,
    equity: p.equity || undefined,
    ownerName: p.ownerName || p.owner || undefined,
    ownerAddress: p.mailingAddress || p.ownerMailingAddress || p.mailing_address || undefined,
    lastSaleDate: p.lastSaleDate || p.saleDate || undefined,
    lastSalePrice: p.lastSalePrice || p.salePrice || undefined,
    apn: p.apn || p.parcelNumber || p.apn_unformatted || undefined,
    source: "PropertyAPI",
  }
}
