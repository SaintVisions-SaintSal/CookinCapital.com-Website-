import { type NextRequest, NextResponse } from "next/server"
import {
  searchPropertiesAdvanced,
  mapToPropertyResult,
  type PropertySearchParams,
} from "@/lib/propertyradar"
import { formatApiError, parseAddressQuery } from "@/lib/property-search-utils"
import { getPropertyImagePath } from "@/lib/google-maps"

const PROPERTY_API_KEY =
  process.env.PROPERTYAPI_KEY || process.env.PROPERTY_API || process.env.PROPERTY_API_KEY
const PROPERTY_API_BASE = "https://propertyapi.co/api/v1"
const PROPERTY_API_HEADERS = {
  "X-API-Key": PROPERTY_API_KEY || "",
  Accept: "application/json",
  "Content-Type": "application/json",
}

function hasPropertyRadarKey(): boolean {
  return Boolean(
    process.env.PROPERTYRADAR_API_KEY ||
      process.env.PROPERTY_RADAR_API_TOKEN ||
      process.env.PROPERTY_RADAR_API_KEY,
  )
}

function buildSearchParams(body: Record<string, unknown>): PropertySearchParams {
  const addressInput =
    (body.address as string) ||
    `${body.streetAddress || ""} ${body.city || ""} ${body.state || ""} ${body.zip || ""}`.trim()

  const parsed = addressInput ? parseAddressQuery(addressInput) : null

  const params: PropertySearchParams = {
    state: (body.state as string) || parsed?.state || "CA",
    city: (body.city as string) || parsed?.city,
    zip: (body.zip as string) || parsed?.zip,
    address: parsed?.address || (parsed?.hasStreetNumber ? addressInput : undefined),
    limit: typeof body.limit === "number" ? body.limit : 20,
    purchase: body.purchase === 0 ? 0 : 1,
  }

  if (body.propertyType) params.propertyType = body.propertyType as string
  if (body.foreclosure) params.foreclosure = true
  if (body.taxDelinquent) params.taxDelinquent = true
  if (body.bankruptcy) params.bankruptcy = true
  if (body.divorce) params.divorce = true
  if (body.vacant) params.vacant = true
  if (body.deceased) params.deceased = true
  if (body.absenteeOwner) params.absenteeOwner = true
  if (body.listedForSale) params.listedForSale = true
  if (body.bedsMin) params.bedsMin = Number(body.bedsMin)
  if (body.bedsMax) params.bedsMax = Number(body.bedsMax)
  if (body.bathsMin) params.bathsMin = Number(body.bathsMin)
  if (body.bathsMax) params.bathsMax = Number(body.bathsMax)
  if (body.valueMin) params.valueMin = Number(body.valueMin)
  if (body.valueMax) params.valueMax = Number(body.valueMax)
  if (body.equityMin) params.equityMin = Number(body.equityMin)
  if (body.equityMax) params.equityMax = Number(body.equityMax)
  if (body.yearBuiltMin) params.yearBuiltMin = Number(body.yearBuiltMin)
  if (body.yearBuiltMax) params.yearBuiltMax = Number(body.yearBuiltMax)

  return params
}

async function searchPropertyRadar(params: PropertySearchParams) {
  const { properties, resultCount } = await searchPropertiesAdvanced(params)
  return {
    source: "PropertyRadar" as const,
    resultCount,
    properties: properties.map(mapToPropertyResult),
  }
}

async function searchPropertyApi(address: string) {
  const detail = await papiPropertyDetail(address)
  if (!detail) return null
  return {
    source: "PropertyAPI" as const,
    resultCount: 1,
    properties: [mapPapiProperty(detail)],
  }
}

// -------------------------------------------------------
// GET /api/property-search
// -------------------------------------------------------
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const address = sp.get("address")

  if (!address) {
    return NextResponse.json(
      { error: "address query parameter is required (e.g., ?address=Los%20Angeles,%20CA)" },
      { status: 400 },
    )
  }

  try {
    if (hasPropertyRadarKey()) {
      const params = buildSearchParams({ address, state: sp.get("state") || "CA" })
      const radar = await searchPropertyRadar(params)
      if (radar.properties.length > 0) return NextResponse.json(radar)
    }

    const parsed = parseAddressQuery(address)
    if (parsed.hasStreetNumber && PROPERTY_API_KEY) {
      const fallback = await searchPropertyApi(address)
      if (fallback) return NextResponse.json(fallback)
    }

    return NextResponse.json(
      { error: "No properties found for this location. Try a different city or full street address." },
      { status: 404 },
    )
  } catch (error) {
    console.error("Property search GET error:", error)
    const msg = error instanceof Error ? error.message : "Property search failed"
    return NextResponse.json({ error: formatApiError(msg) }, { status: 502 })
  }
}

// -------------------------------------------------------
// POST /api/property-search
// PropertyRadar first, PropertyAPI fallback for street addresses
// -------------------------------------------------------
export async function POST(request: NextRequest) {
  const body = await request.json()

  const addressInput =
    body.address ||
    `${body.streetAddress || ""} ${body.city || ""} ${body.state || ""} ${body.zip || ""}`.trim()

  if (!addressInput && !body.city && !body.zip) {
    return NextResponse.json(
      { error: "Enter a city, zip code, or address to search." },
      { status: 400 },
    )
  }

  try {
    // 1. PropertyRadar (primary)
    if (hasPropertyRadarKey()) {
      const params = buildSearchParams(body)
      console.log("[property-search] PropertyRadar params:", JSON.stringify(params))

      const radar = await searchPropertyRadar(params)
      if (radar.properties.length > 0) {
        return NextResponse.json(radar)
      }
    }

    // 2. PropertyAPI fallback for full street addresses
    const parsed = parseAddressQuery(addressInput || "")
    if (parsed.hasStreetNumber && PROPERTY_API_KEY) {
      console.log("[property-search] PropertyAPI fallback for:", addressInput)
      const fallback = await searchPropertyApi(addressInput)
      if (fallback) return NextResponse.json(fallback)
    }

    return NextResponse.json(
      {
        error: parsed.hasStreetNumber
          ? "No property found at this address. Try a different address or check spelling."
          : "No properties found in this area. Try another city or add a state (e.g., Los Angeles, CA).",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Property search POST error:", error)
    const msg = error instanceof Error ? error.message : "Property search failed"
    return NextResponse.json({ error: formatApiError(msg) }, { status: 502 })
  }
}

async function papiPropertyDetail(address: string): Promise<Record<string, unknown> | null> {
  if (!PROPERTY_API_KEY) return null

  try {
    const url = `${PROPERTY_API_BASE}/parcels/search-by-address?address=${encodeURIComponent(address)}`
    console.log("[PropertyAPI] search-by-address request:", url)
    const res = await fetch(url, { headers: PROPERTY_API_HEADERS })
    if (!res.ok) {
      const text = await res.text()
      console.error("[PropertyAPI] search-by-address error", res.status, text)
      return null
    }

    const payload = await res.json()
    if (!payload || payload.status !== "ok" || !payload.data) {
      console.error("[PropertyAPI] unexpected response", payload)
      return null
    }

    return payload.data
  } catch (error) {
    console.error("[PropertyAPI] search-by-address error:", error)
    return null
  }
}

function mapPapiProperty(p: Record<string, unknown>) {
  const result = {
    address: (p.address || p.property_address || p.streetAddress || p.formattedAddress || "") as string,
    city: (p.city || p.addr_city || "") as string,
    state: (p.state || p.addr_state || "") as string,
    zip: (p.zip || p.zipCode || p.zip_code || p.addr_zip || "") as string,
    county: p.county as string | undefined,
    latitude: (p.latitude || p.lat) as number | undefined,
    longitude: (p.longitude || p.long) as number | undefined,
    propertyType: (p.propertyType || p.property_type) as string | undefined,
    beds: (p.bedrooms || p.beds) as number | undefined,
    baths: (p.bathrooms || p.baths) as number | undefined,
    sqft: (p.square_feet || p.squareFootage || p.sqft || p.livingArea) as number | undefined,
    lotSize: (p.lot_size || p.lotSize || p.lotAcres) as number | undefined,
    yearBuilt: (p.yearBuilt || p.year_built) as number | undefined,
    value: (p.estimatedValue || p.avm || p.assessedValue || p.marketValue) as number | undefined,
    equity: p.equity as number | undefined,
    ownerName: (p.ownerName || p.owner) as string | undefined,
    ownerAddress: (p.mailingAddress || p.ownerMailingAddress || p.mailing_address) as string | undefined,
    lastSaleDate: (p.lastSaleDate || p.saleDate) as string | undefined,
    lastSalePrice: (p.lastSalePrice || p.salePrice) as number | undefined,
    apn: (p.apn || p.parcelNumber || p.apn_unformatted) as string | undefined,
    source: "PropertyAPI",
  }

  return {
    ...result,
    imageUrl: getPropertyImagePath(result),
  }
}
