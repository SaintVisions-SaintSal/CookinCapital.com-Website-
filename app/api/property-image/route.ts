import { type NextRequest, NextResponse } from "next/server"
import {
  geocodeAddress,
  getStaticMapUrl,
  getStreetViewUrl,
  hasStreetViewImagery,
} from "@/lib/google-maps"

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const latParam = sp.get("lat")
  const lngParam = sp.get("lng")
  const address = sp.get("address")
  const heading = Number(sp.get("heading") || 0)
  const view = sp.get("view")

  let lat = latParam ? Number(latParam) : NaN
  let lng = lngParam ? Number(lngParam) : NaN

  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && address) {
    const geocoded = await geocodeAddress(address)
    if (geocoded) {
      lat = geocoded.lat
      lng = geocoded.lng
    }
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Could not resolve property location" }, { status: 400 })
  }

  try {
    const useSatellite = view === "satellite"
    let imageUrl = ""

    if (useSatellite) {
      imageUrl = getStaticMapUrl(lat, lng, 19, 960, 540)
    } else {
      const streetViewAvailable = await hasStreetViewImagery(lat, lng)
      imageUrl = streetViewAvailable
        ? getStreetViewUrl(lat, lng, 960, 540, heading)
        : getStaticMapUrl(lat, lng, 18, 960, 540)
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch property image" }, { status: 502 })
    }

    const imageBuffer = await imageRes.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": imageRes.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("[property-image] error:", error)
    return NextResponse.json({ error: "Failed to load property image" }, { status: 500 })
  }
}
