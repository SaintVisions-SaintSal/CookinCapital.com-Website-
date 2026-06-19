import { type NextRequest, NextResponse } from "next/server"
import {
  DETAIL_FIELDS,
  getProperty,
  getPropertyPersons,
  mapToPropertyResult,
} from "@/lib/propertyradar"
import { formatApiError } from "@/lib/property-search-utils"
import { getPropertyImagePath } from "@/lib/google-maps"

const PROPERTY_API_KEY =
  process.env.PROPERTYAPI_KEY || process.env.PROPERTY_API || process.env.PROPERTY_API_KEY
const PROPERTY_API_BASE = "https://propertyapi.co/api/v1"

// -------------------------------------------------------
// GET /api/property-search/detail?radarId=xxx
// Full property detail (loaded on card click)
// -------------------------------------------------------
export async function GET(request: NextRequest) {
  const radarId = request.nextUrl.searchParams.get("radarId")
  const address = request.nextUrl.searchParams.get("address")

  if (!radarId && !address) {
    return NextResponse.json({ error: "radarId or address is required" }, { status: 400 })
  }

  try {
    if (radarId) {
      const property = await getProperty(radarId, DETAIL_FIELDS, 1)
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 })
      }

      const result = mapToPropertyResult(property)

      // Enrich with owner/person mailing data when available
      try {
        const persons = await getPropertyPersons(radarId, 1)
        if (persons.length > 0) {
          const person = persons[0] as Record<string, unknown>
          result.ownerName =
            result.ownerName ||
            (person.Name as string) ||
            (person.FullName as string) ||
            undefined
          result.ownerAddress =
            (person.MailingAddress as string) ||
            (person.Address as string) ||
            result.ownerAddress
          result.ownerCity = (person.MailingCity as string) || result.ownerCity
          result.ownerState = (person.MailingState as string) || result.ownerState
          result.ownerZip = (person.MailingZip as string) || result.ownerZip
          if (person.YearsOwned != null) {
            result.yearsOwned = Number(person.YearsOwned)
          }
        }
      } catch (personErr) {
        console.warn("[property-detail] persons lookup failed:", personErr)
      }

      return NextResponse.json({ source: "PropertyRadar", property: result })
    }

    // PropertyAPI fallback when no radarId (single-address lookup results)
    if (address && PROPERTY_API_KEY) {
      const url = `${PROPERTY_API_BASE}/parcels/search-by-address?address=${encodeURIComponent(address)}`
      const res = await fetch(url, {
        headers: {
          "X-API-Key": PROPERTY_API_KEY,
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 })
      }

      const payload = await res.json()
      if (payload?.status !== "ok" || !payload.data) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 })
      }

      const p = payload.data
      const property = {
        address: p.address || "",
        city: p.city || "",
        state: p.state || "",
        zip: p.zip_code || p.zip || "",
        county: p.county,
        latitude: p.latitude || p.lat,
        longitude: p.longitude || p.long,
        propertyType: p.property_type || p.propertyType,
        beds: p.bedrooms,
        baths: p.bathrooms,
        sqft: p.square_feet,
        lotSize: p.lot_size,
        yearBuilt: p.year_built,
        value: p.market_value || p.assessed_total,
        ownerName: p.owner,
        ownerAddress: p.mailing_address,
        lastSaleDate: p.last_sale_date,
        lastSalePrice: p.last_sale_price,
        apn: p.apn,
        assessedValue: p.assessed_total,
        annualTaxes: p.annual_tax,
        source: "PropertyAPI",
      }

      return NextResponse.json({
        source: "PropertyAPI",
        property: {
          ...property,
          imageUrl: getPropertyImagePath(property),
        },
      })
    }

    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  } catch (error) {
    console.error("[property-detail] error:", error)
    const msg = error instanceof Error ? error.message : "Failed to load property details"
    return NextResponse.json({ error: formatApiError(msg) }, { status: 502 })
  }
}
