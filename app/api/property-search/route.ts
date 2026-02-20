import { type NextRequest, NextResponse } from "next/server"
import {
  searchPropertiesAdvanced,
  getProperty,
  getSalesComps,
  getListingComps,
  mapToPropertyResult,
  type PropertySearchParams,
  ALL_FIELDS,
} from "@/lib/propertyradar"

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY
const PROPERTYRADAR_API_KEY = process.env.PROPERTYRADAR_API_KEY

// -------------------------------------------------------
// GET /api/property-search
// Supports: source=propertyradar (default) | source=rentcast
// -------------------------------------------------------
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const source = sp.get("source") || "propertyradar"

  // ---- PropertyRadar source (primary) ----
  if (source === "propertyradar" && PROPERTYRADAR_API_KEY) {
    return handlePropertyRadarSearch(sp)
  }

  // ---- RentCast AVM fallback ----
  return handleRentCastSearch(sp)
}

// -------------------------------------------------------
// POST /api/property-search
// Advanced PropertyRadar search with full filter body
// -------------------------------------------------------
export async function POST(request: NextRequest) {
  if (!PROPERTYRADAR_API_KEY) {
    return NextResponse.json({ error: "PropertyRadar API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const params: PropertySearchParams = {
      state: body.state || undefined,
      city: body.city || undefined,
      zip: body.zip || undefined,
      county: body.county || undefined,
      address: body.address || undefined,
      propertyType: body.propertyType || undefined,
      bedsMin: body.bedsMin ?? undefined,
      bedsMax: body.bedsMax ?? undefined,
      bathsMin: body.bathsMin ?? undefined,
      bathsMax: body.bathsMax ?? undefined,
      yearBuiltMin: body.yearBuiltMin ?? undefined,
      yearBuiltMax: body.yearBuiltMax ?? undefined,
      valueMin: body.valueMin ?? undefined,
      valueMax: body.valueMax ?? undefined,
      equityMin: body.equityMin ?? undefined,
      equityMax: body.equityMax ?? undefined,
      foreclosure: body.foreclosure ?? undefined,
      foreclosureStage: body.foreclosureStage || undefined,
      taxDelinquent: body.taxDelinquent ?? undefined,
      bankruptcy: body.bankruptcy ?? undefined,
      divorce: body.divorce ?? undefined,
      vacant: body.vacant ?? undefined,
      deceased: body.deceased ?? undefined,
      ownerOccupied: body.ownerOccupied ?? undefined,
      absenteeOwner: body.absenteeOwner ?? undefined,
      listedForSale: body.listedForSale ?? undefined,
      limit: body.limit ?? 20,
      purchase: body.purchase ?? 1,
    }

    const { properties, resultCount } = await searchPropertiesAdvanced(params)
    const mapped = properties.map(mapToPropertyResult)

    return NextResponse.json({
      source: "PropertyRadar",
      resultCount,
      properties: mapped,
    })
  } catch (error) {
    console.error("PropertyRadar advanced search error:", error)
    return NextResponse.json({ error: "PropertyRadar search failed" }, { status: 500 })
  }
}

// -------------------------------------------------------
// PropertyRadar GET handler
// -------------------------------------------------------
async function handlePropertyRadarSearch(sp: URLSearchParams) {
  const action = sp.get("action")

  // Single property detail by RadarID
  if (action === "detail" && sp.get("radarId")) {
    try {
      const property = await getProperty(sp.get("radarId")!, ALL_FIELDS, 1)
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 })
      }
      return NextResponse.json({ source: "PropertyRadar", property: mapToPropertyResult(property) })
    } catch (error) {
      console.error("PropertyRadar detail error:", error)
      return NextResponse.json({ error: "Property detail failed" }, { status: 500 })
    }
  }

  // Sales comps
  if (action === "comps-sales" && sp.get("radarId")) {
    try {
      const comps = await getSalesComps(sp.get("radarId")!, 0)
      return NextResponse.json({ source: "PropertyRadar", comps: comps.map(mapToPropertyResult) })
    } catch (error) {
      return NextResponse.json({ error: "Comps lookup failed" }, { status: 500 })
    }
  }

  // Listing comps
  if (action === "comps-listings" && sp.get("radarId")) {
    try {
      const comps = await getListingComps(sp.get("radarId")!, 0)
      return NextResponse.json({ source: "PropertyRadar", comps: comps.map(mapToPropertyResult) })
    } catch (error) {
      return NextResponse.json({ error: "Listing comps lookup failed" }, { status: 500 })
    }
  }

  // Basic area search via GET params
  const city = sp.get("city")
  const state = sp.get("state")
  const zip = sp.get("zip")
  const address = sp.get("address")

  if (!city && !state && !zip && !address) {
    return NextResponse.json({ error: "At least city/state, zip, or address is required" }, { status: 400 })
  }

  try {
    const params: PropertySearchParams = {
      state: state || "CA",
      city: city || undefined,
      zip: zip || undefined,
      address: address || undefined,
      propertyType: sp.get("propertyType") || undefined,
      foreclosure: sp.get("foreclosure") === "true" || undefined,
      taxDelinquent: sp.get("taxDelinquent") === "true" || undefined,
      bankruptcy: sp.get("bankruptcy") === "true" || undefined,
      divorce: sp.get("divorce") === "true" || undefined,
      vacant: sp.get("vacant") === "true" || undefined,
      absenteeOwner: sp.get("absenteeOwner") === "true" || undefined,
      limit: parseInt(sp.get("limit") || "20"),
      purchase: 1,
    }

    const { properties, resultCount } = await searchPropertiesAdvanced(params)
    const mapped = properties.map(mapToPropertyResult)

    return NextResponse.json({
      source: "PropertyRadar",
      resultCount,
      properties: mapped,
    })
  } catch (error) {
    console.error("PropertyRadar search error:", error)
    return NextResponse.json({ error: "PropertyRadar search failed" }, { status: 500 })
  }
}

// -------------------------------------------------------
// RentCast GET handler (AVM fallback)
// -------------------------------------------------------
async function handleRentCastSearch(sp: URLSearchParams) {
  const address = sp.get("address")
  const city = sp.get("city")
  const state = sp.get("state")
  const zip = sp.get("zip")

  if (!RENTCAST_API_KEY) {
    return NextResponse.json({ error: "No property search API configured" }, { status: 500 })
  }

  if (!address || !city || !state) {
    return NextResponse.json({ error: "Address, city, and state are required for RentCast" }, { status: 400 })
  }

  const fullAddress = `${address}, ${city}, ${state}${zip ? `, ${zip}` : ""}`
  let apiUrl = `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(fullAddress)}&compCount=5`

  const propertyType = sp.get("propertyType") || ""
  const bedrooms = sp.get("bedrooms") || ""
  const bathrooms = sp.get("bathrooms") || ""
  const squareFootage = sp.get("squareFootage") || ""

  if (propertyType) apiUrl += `&propertyType=${encodeURIComponent(propertyType)}`
  if (bedrooms) apiUrl += `&bedrooms=${encodeURIComponent(bedrooms)}`
  if (bathrooms) apiUrl += `&bathrooms=${encodeURIComponent(bathrooms)}`
  if (squareFootage) apiUrl += `&squareFootage=${encodeURIComponent(squareFootage)}`

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-Api-Key": RENTCAST_API_KEY,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("RentCast API error:", response.status, errorText)
      return NextResponse.json({ error: `Property lookup failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ source: "RentCast", ...data })
  } catch (error) {
    console.error("Property search error:", error)
    return NextResponse.json({ error: "Failed to fetch property data" }, { status: 500 })
  }
}
