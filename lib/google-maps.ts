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

export function getStreetViewUrl(lat: number, lng: number, width = 600, height = 400): string {
  if (!MAPS_API_KEY) {
    return ""
  }

  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&key=${MAPS_API_KEY}`
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
