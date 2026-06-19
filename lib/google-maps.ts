import { resolveStateLabel } from "@/lib/us-states"

export interface AddressComponents {
  street_number?: string
  route?: string
  locality?: string
  administrative_area_level_1?: string
  postal_code?: string
  country?: string
}

export interface GeocodeResult {
  address: string
  lat: number
  lng: number
  components: AddressComponents
  placeId: string
}

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API
const MAPS_SECRET = process.env.GOOGLE_MAPS_SECRET_KEY

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!MAPS_API_KEY) {
    console.warn("[v0] Google Maps API key not configured")
    return null
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" || !data.results[0]) {
      return null
    }

    const result = data.results[0]
    const location = result.geometry.location

    const components: AddressComponents = {}
    for (const component of result.address_components) {
      const type = component.types[0]
      components[type as keyof AddressComponents] = component.short_name
    }

    return {
      address: result.formatted_address,
      lat: location.lat,
      lng: location.lng,
      components,
      placeId: result.place_id,
    }
  } catch (error) {
    console.error("[v0] Geocoding error:", error)
    return null
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  if (!MAPS_API_KEY) {
    console.warn("[v0] Google Maps API key not configured")
    return null
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" || !data.results[0]) {
      return null
    }

    const result = data.results[0]
    const location = result.geometry.location

    const components: AddressComponents = {}
    for (const component of result.address_components) {
      const type = component.types[0]
      components[type as keyof AddressComponents] = component.short_name
    }

    return {
      address: result.formatted_address,
      lat: location.lat,
      lng: location.lng,
      components,
      placeId: result.place_id,
    }
  } catch (error) {
    console.error("[v0] Reverse geocoding error:", error)
    return null
  }
}

export function getStaticMapUrl(lat: number, lng: number, zoom = 15, width = 600, height = 400): string {
  if (!MAPS_API_KEY) {
    return ""
  }

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${MAPS_API_KEY}`
}

export function getStreetViewUrl(
  lat: number,
  lng: number,
  width = 600,
  height = 400,
  heading = 0,
): string {
  if (!MAPS_API_KEY) {
    return ""
  }

  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=0&fov=90&key=${MAPS_API_KEY}`
}

export async function hasStreetViewImagery(lat: number, lng: number): Promise<boolean> {
  if (!MAPS_API_KEY) return false

  try {
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${MAPS_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()
    return data.status === "OK"
  } catch {
    return false
  }
}

export function getPropertyImagePath(property: {
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  state?: string
  zip?: string
}): string | undefined {
  const params = new URLSearchParams()

  if (property.latitude != null && property.longitude != null) {
    params.set("lat", String(property.latitude))
    params.set("lng", String(property.longitude))
    return `/api/property-image?${params.toString()}`
  }

  const address = [property.address, property.city, property.state, property.zip]
    .filter(Boolean)
    .join(", ")
    .trim()

  if (address) {
    params.set("address", address)
    return `/api/property-image?${params.toString()}`
  }

  return undefined
}

export interface ResolvedSearchLocation {
  state?: string
  city?: string
  zip?: string
  county?: string
  address?: string
  formattedAddress?: string
  stateOnly?: boolean
  countyOnly?: boolean
}

/** Resolve a user-entered location to structured search fields via Google Geocoding. */
export async function resolveSearchLocation(input: string): Promise<ResolvedSearchLocation | null> {
  const stateLabel = resolveStateLabel(input)
  if (stateLabel) {
    return {
      state: stateLabel.state,
      stateOnly: true,
    }
  }

  if (!MAPS_API_KEY) return null

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    url.searchParams.set("address", input)
    url.searchParams.set("key", MAPS_API_KEY)
    url.searchParams.set("components", "country:US")

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK" || !data.results?.[0]) {
      return null
    }

    const result = data.results[0]
    const resultTypes: string[] = result.types || []

    let state: string | undefined
    let city: string | undefined
    let zip: string | undefined
    let county: string | undefined
    let streetNumber: string | undefined
    let route: string | undefined

    for (const component of result.address_components) {
      const types: string[] = component.types

      if (types.includes("administrative_area_level_1")) {
        state = component.short_name
      }
      if (types.includes("locality") || types.includes("postal_town")) {
        city = city || component.long_name
      }
      if (types.includes("sublocality") && !city) {
        city = component.long_name
      }
      if (types.includes("postal_code")) {
        zip = component.short_name
      }
      if (types.includes("administrative_area_level_2")) {
        county = component.long_name.replace(/\s+County$/i, "").trim()
      }
      if (types.includes("street_number")) {
        streetNumber = component.short_name
      }
      if (types.includes("route")) {
        route = component.short_name
      }
    }

    const address = streetNumber && route ? `${streetNumber} ${route}` : undefined
    const stateOnly =
      resultTypes.includes("administrative_area_level_1") && !city && !address && !county
    const countyOnly =
      resultTypes.includes("administrative_area_level_2") && !city && !address

    return {
      state,
      city: stateOnly || countyOnly ? undefined : city,
      zip,
      county: countyOnly ? county : undefined,
      address,
      formattedAddress: result.formatted_address,
      stateOnly,
      countyOnly,
    }
  } catch (error) {
    console.error("[resolveSearchLocation] error:", error)
    return null
  }
}
