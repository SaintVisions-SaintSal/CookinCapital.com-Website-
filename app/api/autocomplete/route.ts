import { type NextRequest, NextResponse } from "next/server"
import { formatPlacePrediction } from "@/lib/place-format"

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API

// -------------------------------------------------------
// GET /api/autocomplete
// Location autocomplete — cities, states, counties, zips
// -------------------------------------------------------
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input")
  const sessionToken = request.nextUrl.searchParams.get("sessionToken")

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    )
  }

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] })
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json")
    url.searchParams.set("input", input)
    url.searchParams.set("key", GOOGLE_PLACES_API_KEY)
    url.searchParams.set("components", "country:us")
    // Cities, states, counties, and postal codes — not highways or vague geocodes
    url.searchParams.set("types", "(regions)")

    if (sessionToken) {
      url.searchParams.set("sessiontoken", sessionToken)
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === "OK" && data.predictions) {
      return NextResponse.json({
        predictions: data.predictions.map(formatPlacePrediction),
      })
    }

    if (data.status === "ZERO_RESULTS") {
      return NextResponse.json({ predictions: [] })
    }

    if (data.status === "INVALID_REQUEST") {
      return NextResponse.json(
        { error: "Invalid request: " + data.error_message },
        { status: 400 }
      )
    }

    console.error("[Autocomplete] Google API error:", data.status, data.error_message)
    return NextResponse.json(
      { error: "Autocomplete service unavailable" },
      { status: 503 }
    )
  } catch (error) {
    console.error("[Autocomplete] fetch error:", error)
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// -------------------------------------------------------
// POST /api/autocomplete
// Get detailed place information (address components)
// -------------------------------------------------------
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { placeId, sessionToken } = body

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    )
  }

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
    url.searchParams.set("place_id", placeId)
    url.searchParams.set("key", GOOGLE_PLACES_API_KEY)
    url.searchParams.set(
      "fields",
      "formatted_address,geometry,address_components,place_id,types"
    )

    if (sessionToken) {
      url.searchParams.set("sessiontoken", sessionToken)
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === "OK" && data.result) {
      const result = data.result
      return NextResponse.json({
        address: result.formatted_address,
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng,
        components: result.address_components || [],
        placeId: result.place_id,
        types: result.types || [],
      })
    }

    console.error("[Autocomplete Details] Google API error:", data.status)
    return NextResponse.json(
      { error: "Could not fetch place details" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[Autocomplete Details] fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    )
  }
}
