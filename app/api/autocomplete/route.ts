import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API

// -------------------------------------------------------
// GET /api/autocomplete
// Address autocomplete using Google Places API
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
    // Call Google Places API for address predictions
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json")
    url.searchParams.set("input", input)
    url.searchParams.set("key", GOOGLE_PLACES_API_KEY)
    url.searchParams.set("components", "country:us") // Restrict to US
    url.searchParams.set("types", "geocode") // Only geocoded locations (addresses, buildings, etc)

    if (sessionToken) {
      url.searchParams.set("sessiontoken", sessionToken)
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === "OK" && data.predictions) {
      return NextResponse.json({
        predictions: data.predictions.map((p: any) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.main_text,
          secondaryText: p.secondary_text,
        })),
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

    // Other statuses like OVER_QUERY_LIMIT, REQUEST_DENIED, UNKNOWN_ERROR
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
// POST /api/autocomplete/details
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
    // Call Google Place Details API
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
    url.searchParams.set("place_id", placeId)
    url.searchParams.set("key", GOOGLE_PLACES_API_KEY)
    url.searchParams.set(
      "fields",
      "formatted_address,geometry,address_components,place_id"
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
