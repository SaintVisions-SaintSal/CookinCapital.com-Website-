import { type NextRequest, NextResponse } from "next/server"
import {
  DETAIL_FIELDS,
  getProperty,
  mapToPropertyResult,
  searchPropertiesAdvanced,
} from "@/lib/propertyradar"
import { parseAddressQuery } from "@/lib/property-search-utils"
import { resolveSearchLocation } from "@/lib/google-maps"
import type { PropertyResult } from "@/lib/property/types"

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY
const PROPERTY_API_KEY =
  process.env.PROPERTYAPI_KEY || process.env.PROPERTY_API || process.env.PROPERTY_API_KEY

interface ValuationComparable {
  formattedAddress: string
  city: string
  state: string
  price?: number
  squareFootage?: number
  bedrooms?: number
  bathrooms?: number
}

async function rentcastValueEstimate(fullAddress: string) {
  if (!RENTCAST_API_KEY) return null
  try {
    const url = `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(fullAddress)}`
    const res = await fetch(url, {
      headers: { "X-Api-Key": RENTCAST_API_KEY, Accept: "application/json" },
    })
    if (!res.ok) return null
    return (await res.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

async function lookupViaPropertyRadar(
  address: string,
  city?: string | null,
  state?: string | null,
  zip?: string | null,
  radarId?: string | null,
): Promise<PropertyResult | null> {
  if (radarId) {
    const record = await getProperty(radarId, DETAIL_FIELDS, 1)
    return record ? mapToPropertyResult(record) : null
  }

  const query =
    [address, city, state, zip].filter(Boolean).join(", ").trim() || address

  const geocoded = await resolveSearchLocation(query)
  const parsed = parseAddressQuery(query)

  const params = {
    state: geocoded?.state || parsed.state,
    city: geocoded?.city || parsed.city || city || undefined,
    zip: geocoded?.zip || parsed.zip || zip || undefined,
    address: geocoded?.address || parsed.address || address,
    limit: 5,
    purchase: 1 as const,
  }

  const { properties } = await searchPropertiesAdvanced(params)
  if (!properties.length) return null

  const normalizedTarget = address.trim().toLowerCase()
  const match =
    properties.find((p) => p.Address?.trim().toLowerCase() === normalizedTarget) ||
    properties.find((p) => p.Address?.toLowerCase().includes(normalizedTarget)) ||
    properties[0]

  return match ? mapToPropertyResult(match) : null
}

async function lookupViaPropertyApi(fullAddress: string): Promise<PropertyResult | null> {
  if (!PROPERTY_API_KEY) return null

  try {
    const url = `https://propertyapi.co/api/v1/parcels/search-by-address?address=${encodeURIComponent(fullAddress)}`
    const res = await fetch(url, {
      headers: { "X-API-Key": PROPERTY_API_KEY, Accept: "application/json" },
    })
    if (!res.ok) return null

    const payload = await res.json()
    if (payload?.status !== "ok" || !payload.data) return null

    const p = payload.data
    return {
      address: p.address || fullAddress,
      city: p.city || "",
      state: p.state || "",
      zip: p.zip_code || p.zip || "",
      beds: p.bedrooms,
      baths: p.bathrooms,
      sqft: p.square_feet,
      yearBuilt: p.year_built,
      lotSize: p.lot_size,
      value: p.market_value || p.assessed_total || p.estimatedValue,
      propertyType: p.property_type || p.propertyType,
      ownerName: p.owner,
      apn: p.apn,
      source: "PropertyAPI",
    }
  } catch {
    return null
  }
}

function buildValuation(property: PropertyResult, avm: Record<string, unknown> | null) {
  const avmPrice = Number(avm?.price || 0)
  const baseValue = avmPrice || property.value || property.listPrice || 0

  if (!baseValue) {
    return null
  }

  const priceRangeLow =
    Number(avm?.priceRangeLow) ||
    Number((avm as { lowPrice?: number })?.lowPrice) ||
    Math.round(baseValue * 0.9)
  const priceRangeHigh =
    Number(avm?.priceRangeHigh) ||
    Number((avm as { highPrice?: number })?.highPrice) ||
    Math.round(baseValue * 1.1)

  const rawComps = (avm?.comparables || avm?.comps || []) as Array<Record<string, unknown>>
  const comparables: ValuationComparable[] = rawComps.slice(0, 5).map((comp) => ({
    formattedAddress: String(comp.formattedAddress || comp.address || "Comparable"),
    city: String(comp.city || ""),
    state: String(comp.state || ""),
    price: Number(comp.price || comp.salePrice || 0) || undefined,
    squareFootage: Number(comp.squareFootage || comp.sqft || 0) || undefined,
    bedrooms: Number(comp.bedrooms || comp.beds || 0) || undefined,
    bathrooms: Number(comp.bathrooms || comp.baths || 0) || undefined,
  }))

  return {
    price: Math.round(baseValue),
    priceRangeLow: Math.round(priceRangeLow),
    priceRangeHigh: Math.round(priceRangeHigh),
    latitude: property.latitude,
    longitude: property.longitude,
    comparables,
    source: avmPrice ? "RentCast + PropertyRadar" : property.source || "PropertyRadar",
    property: {
      radarId: property.radarId,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      yearBuilt: property.yearBuilt,
      lotSize: property.lotSize,
      propertyType: property.propertyType,
      value: baseValue,
      assessedValue: property.assessedValue,
      annualTaxes: property.annualTaxes,
      ownerName: property.ownerName,
    },
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const address = sp.get("address")?.trim()
  const city = sp.get("city")?.trim()
  const state = sp.get("state")?.trim()
  const zip = sp.get("zip")?.trim()
  const radarId = sp.get("radarId")?.trim()

  if (!address && !radarId) {
    return NextResponse.json({ error: "address or radarId is required" }, { status: 400 })
  }

  if (!address && !city && !state && !radarId) {
    return NextResponse.json({ error: "Enter address, city, and state" }, { status: 400 })
  }

  try {
    const fullAddress = [address, city, state, zip].filter(Boolean).join(", ")

    let property =
      (await lookupViaPropertyRadar(address || fullAddress, city, state, zip, radarId)) ||
      (fullAddress ? await lookupViaPropertyApi(fullAddress) : null)

    if (!property) {
      return NextResponse.json(
        { error: "No property found for this address. Check the address and try again." },
        { status: 404 },
      )
    }

    const avm = fullAddress ? await rentcastValueEstimate(fullAddress) : null
    const valuation = buildValuation(property, avm)

    if (!valuation) {
      return NextResponse.json(
        { error: "Property found but no valuation data is available for this address." },
        { status: 404 },
      )
    }

    return NextResponse.json(valuation)
  } catch (error) {
    console.error("[analyzer/valuation] error:", error)
    const msg = error instanceof Error ? error.message : "Valuation lookup failed"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
