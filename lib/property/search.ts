import type { PropertySearchFilters } from "@/lib/property/types"

export function filtersToSearchBody(
  filters: PropertySearchFilters,
  address: string,
  options?: { start?: number; limit?: number },
) {
  const body: Record<string, unknown> = {
    address,
    limit: options?.limit ?? 20,
    start: options?.start ?? 0,
    purchase: 1,
  }

  if (filters.propertyType) body.propertyType = filters.propertyType
  if (filters.foreclosure) body.foreclosure = true
  if (filters.taxDelinquent) body.taxDelinquent = true
  if (filters.divorce) body.divorce = true
  if (filters.vacant) body.vacant = true
  if (filters.absenteeOwner) body.absenteeOwner = true
  if (filters.listedForSale) body.listedForSale = true
  if (filters.bedsMin) body.bedsMin = Number(filters.bedsMin)
  if (filters.bedsMax) body.bedsMax = Number(filters.bedsMax)
  if (filters.bathsMin) body.bathsMin = Number(filters.bathsMin)
  if (filters.bathsMax) body.bathsMax = Number(filters.bathsMax)
  if (filters.valueMin) body.valueMin = Number(filters.valueMin)
  if (filters.valueMax) body.valueMax = Number(filters.valueMax)
  if (filters.equityMin) body.equityMin = Number(filters.equityMin)
  if (filters.equityMax) body.equityMax = Number(filters.equityMax)
  if (filters.yearBuiltMin) body.yearBuiltMin = Number(filters.yearBuiltMin)
  if (filters.yearBuiltMax) body.yearBuiltMax = Number(filters.yearBuiltMax)

  return body
}

export function parseFiltersFromParams(params: URLSearchParams): PropertySearchFilters {
  return {
    propertyType: params.get("propertyType") || "",
    foreclosure: params.get("foreclosure") === "1",
    taxDelinquent: params.get("taxDelinquent") === "1",
    divorce: params.get("divorce") === "1",
    vacant: params.get("vacant") === "1",
    absenteeOwner: params.get("absenteeOwner") === "1",
    listedForSale: params.get("listedForSale") === "1",
    bedsMin: params.get("bedsMin") || "",
    bedsMax: params.get("bedsMax") || "",
    bathsMin: params.get("bathsMin") || "",
    bathsMax: params.get("bathsMax") || "",
    valueMin: params.get("valueMin") || "",
    valueMax: params.get("valueMax") || "",
    equityMin: params.get("equityMin") || "",
    equityMax: params.get("equityMax") || "",
    yearBuiltMin: params.get("yearBuiltMin") || "",
    yearBuiltMax: params.get("yearBuiltMax") || "",
  }
}

export function filtersToQueryParams(filters: PropertySearchFilters, location: string) {
  const params = new URLSearchParams()
  params.set("q", location)

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "boolean" && value) params.set(key, "1")
    else if (typeof value === "string" && value) params.set(key, value)
  })

  return params
}
