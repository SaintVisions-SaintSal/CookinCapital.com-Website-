import type { PropertyResult } from "@/lib/property/types"
import { propertyStorageId, propertySummaryLine } from "@/lib/property/format"

export function buildPropertyDetailUrl(property: PropertyResult, returnTo?: string): string | null {
  const params = new URLSearchParams()
  if (returnTo) params.set("returnTo", returnTo)

  if (property.radarId) {
    const qs = params.toString()
    return `/properties/${property.radarId}${qs ? `?${qs}` : ""}`
  }

  const address = propertySummaryLine(property)
  if (!address || /^unknown/i.test(property.address)) return null

  params.set("address", address)
  return `/properties/view?${params.toString()}`
}

export function buildAnalyzerUrl(property: PropertyResult): string {
  const params = new URLSearchParams()
  if (property.radarId) params.set("radarId", property.radarId)
  if (property.address && !/^unknown/i.test(property.address)) {
    params.set("address", property.address)
  }
  if (property.city) params.set("city", property.city)
  if (property.state) params.set("state", property.state)
  if (property.zip) params.set("zip", property.zip)
  if (property.value) params.set("price", String(property.value))
  if (property.value) params.set("arv", String(property.value))
  if (property.sqft) params.set("sqft", String(property.sqft))
  if (property.beds) params.set("beds", String(property.beds))
  if (property.baths) params.set("baths", String(property.baths))
  if (property.yearBuilt) params.set("yearBuilt", String(property.yearBuilt))
  if (property.propertyType) params.set("propertyType", property.propertyType)
  return `/app/analyzer?${params.toString()}`
}

export function buildApplyUrl(property: PropertyResult): string {
  const params = new URLSearchParams()
  const fullAddress = propertySummaryLine(property)
  if (fullAddress) params.set("address", fullAddress)
  if (property.value) params.set("price", String(property.value))
  return `/apply?${params.toString()}`
}

export function favoriteKey(property: PropertyResult): string {
  return property.radarId || propertyStorageId(property)
}
