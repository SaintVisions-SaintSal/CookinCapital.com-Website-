import type { PropertySearchFilters } from "@/lib/property/types"

export const DEFAULT_PROPERTY_FILTERS: PropertySearchFilters = {
  propertyType: "",
  foreclosure: false,
  taxDelinquent: false,
  divorce: false,
  vacant: false,
  absenteeOwner: false,
  listedForSale: false,
  bedsMin: "",
  bedsMax: "",
  bathsMin: "",
  bathsMax: "",
  valueMin: "",
  valueMax: "",
  equityMin: "",
  equityMax: "",
  yearBuiltMin: "",
  yearBuiltMax: "",
}

export const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "SFR", label: "Single Family" },
  { value: "MFR", label: "Multi-Family" },
  { value: "CND", label: "Condo / Townhouse" },
  { value: "COM", label: "Commercial" },
  { value: "VL", label: "Vacant Land" },
  { value: "MH", label: "Mobile / Manufactured" },
] as const

export const RECENT_SEARCHES_COOKIE = "cc_recent_searches"
export const FAVORITES_COOKIE = "cc_property_favorites"
export const SEARCH_RESULTS_CACHE_KEY = "cc_property_search_results"
export const MAX_RECENT_SEARCHES = 6
export const MAX_COOKIE_FAVORITES = 50
