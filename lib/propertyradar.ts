/**
 * PropertyRadar API Client Library
 * API Version: v4.26 (2026-01-20)
 * Docs: https://developers.propertyradar.com
 *
 * Endpoints:
 *  POST /v1/properties         – Search by Criteria
 *  GET  /v1/properties/:id     – Single property by RadarID
 *  GET  /v1/properties/:id/persons       – Owner / persons data
 *  GET  /v1/properties/:id/comps/sales   – Sales comps
 *  GET  /v1/properties/:id/comps/forsale – Listing comps
 *  GET  /v1/suggestions/fips             – County FIPS lookup
 */

const BASE_URL = "https://api.propertyradar.com"

function getApiKey(): string {
  const key = process.env.PROPERTYRADAR_API_KEY
  if (!key) throw new Error("[PropertyRadar] PROPERTYRADAR_API_KEY not set")
  return key
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CriterionItem {
  name: string
  value: (string | number | boolean | CriterionItem[])[]
}

/** The body sent in POST /v1/properties */
export interface CriteriaBody {
  Criteria: CriterionItem[]
}

/** A single property record returned by the API */
export interface PRProperty {
  RadarID: string
  Address?: string
  City?: string
  State?: string
  ZipFive?: string
  County?: string
  APN?: string
  Latitude?: number | string
  Longitude?: number | string
  // Property details
  PType?: string
  AdvancedPropertyType?: string
  Beds?: number
  Baths?: number
  SqFt?: number
  LotSize?: number
  LotSizeAcres?: number
  YearBuilt?: number
  Units?: number
  Pool?: number
  isSameMailingOrExempt?: number
  // Valuation
  AVM?: number
  AVMPerSqFt?: number
  EquityPercent?: number | string
  AvailableEquity?: number
  CLTV?: number
  TotalLoanBalance?: number
  HUDRent?: number
  // Owner
  Owner?: string
  Owner2?: string
  Taxpayer?: string
  isCashBuyer?: number
  // Distress
  inForeclosure?: number
  ForeclosureStage?: string
  ForeclosureRecDate?: string
  SaleDate?: string
  OpeningBid?: number
  DefaultAmount?: number
  DefaultAsOf?: string
  inTaxDelinquency?: number
  inBankruptcyProperty?: number // available as field, not criteria
  inDivorce?: number
  isSiteVacant?: number
  isDeceasedProperty?: number // available as field, not criteria
  isPreforeclosure?: number
  isAuction?: number
  isBankOwned?: number
  // Transfer
  LastTransferRecDate?: string
  LastTransferValue?: number
  LastTransferType?: string
  LastTransferSeller?: string
  LastTransferDownPaymentPercent?: number
  isRecentSale?: number
  isRecentFlip?: number
  // Loans
  FirstAmount?: number
  FirstRate?: number
  FirstLoanType?: string
  FirstPurpose?: string
  FirstDate?: string
  FirstTermInYears?: string
  NumberLoans?: number
  // Listing
  isListedForSale?: number
  ListingPrice?: number
  ListingDate?: string
  DaysOnMarket?: number
  ListingStatus?: string
  ListingType?: string
  // Tax
  AssessedValue?: number
  AnnualTaxes?: number
  EstimatedTaxRate?: number
  // Misc
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Default fields to request – covers all the key data categories
// ---------------------------------------------------------------------------

export const CORE_FIELDS = [
  "RadarID",
  "Address",
  "City",
  "State",
  "ZipFive",
  "County",
  "APN",
  "Latitude",
  "Longitude",
].join(",")

export const PROPERTY_FIELDS = [
  "PType",
  "Beds",
  "Baths",
  "SqFt",
  "LotSize",
  "LotSizeAcres",
  "YearBuilt",
  "Units",
  "Pool",
  "isSameMailingOrExempt",
].join(",")

export const VALUE_FIELDS = [
  "AVM",
  "AVMPerSqFt",
  "EquityPercent",
  "AvailableEquity",
  "CLTV",
  "TotalLoanBalance",
  "HUDRent",
].join(",")

export const OWNER_FIELDS = [
  "Owner",
  "Owner2",
  "Taxpayer",
  "isCashBuyer",
].join(",")

export const DISTRESS_FIELDS = [
  "inForeclosure",
  "ForeclosureStage",
  "ForeclosureRecDate",
  "SaleDate",
  "OpeningBid",
  "DefaultAmount",
  "DefaultAsOf",
  "inTaxDelinquency",
  "inBankruptcyProperty", // works as field, not as criteria
  "inDivorce",
  "isSiteVacant",
  "isDeceasedProperty", // works as field, not as criteria
  "isPreforeclosure",
  "isAuction",
  "isBankOwned",
].join(",")

export const TRANSFER_FIELDS = [
  "LastTransferRecDate",
  "LastTransferValue",
  "LastTransferType",
  "LastTransferSeller",
  "LastTransferDownPaymentPercent",
  "isRecentSale",
  "isRecentFlip",
].join(",")

export const LOAN_FIELDS = [
  "FirstAmount",
  "FirstRate",
  "FirstLoanType",
  "FirstPurpose",
  "FirstDate",
  "FirstTermInYears",
  "NumberLoans",
].join(",")

export const LISTING_FIELDS = [
  "isListedForSale",
  "ListingPrice",
  "ListingDate",
  "DaysOnMarket",
  "ListingStatus",
  "ListingType",
].join(",")

export const TAX_FIELDS = ["AssessedValue", "AnnualTaxes", "EstimatedTaxRate"].join(",")

/** All important fields combined for a full property lookup */
export const ALL_FIELDS = [
  CORE_FIELDS,
  PROPERTY_FIELDS,
  VALUE_FIELDS,
  OWNER_FIELDS,
  DISTRESS_FIELDS,
  TRANSFER_FIELDS,
  LOAN_FIELDS,
  LISTING_FIELDS,
  TAX_FIELDS,
].join(",")

/** Lighter field set for search results (keeps cost lower) */
export const SEARCH_FIELDS = [
  CORE_FIELDS,
  PROPERTY_FIELDS,
  VALUE_FIELDS,
  DISTRESS_FIELDS,
  "Owner",
  "Taxpayer",
  "isCashBuyer",
  "LastTransferRecDate",
  "LastTransferValue",
  "isListedForSale",
  "ListingPrice",
  "AssessedValue",
  "AnnualTaxes",
].join(",")

// ---------------------------------------------------------------------------
// Criteria Builders
// ---------------------------------------------------------------------------

export function buildLocationCriteria(opts: {
  state?: string
  city?: string
  zip?: string
  county?: string | number
  address?: string
}): CriterionItem[] {
  const criteria: CriterionItem[] = []
  if (opts.state) criteria.push({ name: "State", value: [opts.state.toUpperCase()] })
  if (opts.city) criteria.push({ name: "City", value: [opts.city] })
  if (opts.zip) criteria.push({ name: "ZipFive", value: [opts.zip] })
  if (opts.county) criteria.push({ name: "County", value: [opts.county] })
  if (opts.address) criteria.push({ name: "Address", value: [opts.address] })
  return criteria
}

/** Property type mapping – user-friendly names to API PType codes */
const PROPERTY_TYPE_MAP: Record<string, string> = {
  sfr: "SFR",
  "single family": "SFR",
  singlefamily: "SFR",
  "single-family": "SFR",
  mfr: "MFR",
  multifamily: "MFR",
  "multi-family": "MFR",
  "multi family": "MFR",
  condo: "CND",
  cnd: "CND",
  condominium: "CND",
  townhouse: "CND",
  commercial: "COM",
  com: "COM",
  land: "VL",
  "vacant land": "VL",
  vl: "VL",
  mobile: "MH",
  "mobile home": "MH",
  mh: "MH",
  manufactured: "MH",
}

export function buildPropertyTypeCriteria(type: string): CriterionItem[] {
  const code = PROPERTY_TYPE_MAP[type.toLowerCase()] || type.toUpperCase()
  return [
    {
      name: "PropertyType",
      value: [{ name: "PType", value: [code] }] as unknown as string[],
    },
  ]
}

export function buildForeclosureCriteria(stage?: string): CriterionItem[] {
  if (stage) {
    // Specific stage: Preforeclosure, Preforeclosure-NTS, Auction, BankOwned
    return [{ name: "ForeclosureStage", value: [stage] }]
  }
  // Any active foreclosure (Boolean criterion – uses [1])
  return [{ name: "inForeclosure", value: [1] }]
}

export function buildDistressCriteria(types: string[]): CriterionItem[] {
  const criteria: CriterionItem[] = []
  for (const t of types) {
    const lower = t.toLowerCase()
    if (lower.includes("foreclosure") || lower.includes("preforeclosure")) {
      criteria.push({ name: "inForeclosure", value: [1] })
    }
    if (lower.includes("tax") || lower.includes("delinquent")) {
      criteria.push({ name: "inTaxDelinquency", value: [1] })
    }
    // Note: inBankruptcyProperty and isDeceasedProperty are plan-restricted
    // and will cause 400 errors. Skip them as criteria but we can still
    // display them if the API returns them as fields.
    if (lower.includes("divorce")) {
      criteria.push({ name: "inDivorce", value: [1] })
    }
    if (lower.includes("vacant")) {
      criteria.push({ name: "isSiteVacant", value: [1] })
    }
  }
  return criteria
}

export function buildEquityCriteria(opts: {
  minEquityPercent?: number
  maxEquityPercent?: number
  minCLTV?: number
  maxCLTV?: number
}): CriterionItem[] {
  const criteria: CriterionItem[] = []
  // EquityPercent uses Multiple Range: [[min, max]] with null for open-ended
  if (opts.minEquityPercent !== undefined || opts.maxEquityPercent !== undefined) {
    criteria.push({
      name: "EquityPercent",
      value: [[opts.minEquityPercent ?? null, opts.maxEquityPercent ?? null]] as unknown as string[],
    })
  }
  if (opts.minCLTV !== undefined || opts.maxCLTV !== undefined) {
    criteria.push({
      name: "CLTV",
      value: [[opts.minCLTV ?? null, opts.maxCLTV ?? null]] as unknown as string[],
    })
  }
  return criteria
}

export function buildValueCriteria(opts: {
  minValue?: number
  maxValue?: number
}): CriterionItem[] {
  if (opts.minValue === undefined && opts.maxValue === undefined) return []
  // AVM uses Multiple Range: [[min, max]] with null for open-ended
  return [
    {
      name: "AVM",
      value: [[opts.minValue ?? null, opts.maxValue ?? null]] as unknown as string[],
    },
  ]
}

export function buildBedsFilter(min?: number, max?: number): CriterionItem[] {
  if (min === undefined && max === undefined) return []
  // Beds uses Multiple Range: [[min, max]] with null for open-ended
  return [{ name: "Beds", value: [[min ?? null, max ?? null]] as unknown as string[] }]
}

export function buildBathsFilter(min?: number, max?: number): CriterionItem[] {
  if (min === undefined && max === undefined) return []
  return [{ name: "Baths", value: [[min ?? null, max ?? null]] as unknown as string[] }]
}

export function buildYearBuiltFilter(min?: number, max?: number): CriterionItem[] {
  if (min === undefined && max === undefined) return []
  return [{ name: "YearBuilt", value: [[min ?? null, max ?? null]] as unknown as string[] }]
}

export function buildOwnerOccupiedFilter(ownerOccupied: boolean): CriterionItem[] {
  // isSameMailingOrExempt works for both: [1] = owner-occupied, [0] = absentee
  // Note: isNotSameMailingOrExempt is plan-restricted, so we use [0] instead
  return [{ name: "isSameMailingOrExempt", value: [ownerOccupied ? 1 : 0] }]
}

export function buildListedForSaleFilter(listed: boolean): CriterionItem[] {
  return [{ name: "isListedForSale", value: [listed ? 1 : 0] }]
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Search properties by Criteria (POST /v1/properties)
 * @param criteria - Array of CriterionItem objects
 * @param fields - Comma-separated field names to return
 * @param limit - Max number of results (default 20)
 * @param purchase - 0 = preview (free for RadarID-only), 1 = charged per record
 */
export async function searchProperties(
  criteria: CriterionItem[],
  fields: string = SEARCH_FIELDS,
  limit: number = 20,
  purchase: 0 | 1 = 1,
): Promise<{ properties: PRProperty[]; resultCount: number }> {
  const url = `${BASE_URL}/v1/properties?Purchase=${purchase}&Fields=${fields}&Limit=${limit}`

  console.log("[PropertyRadar] POST", url)
  console.log("[PropertyRadar] Criteria:", JSON.stringify(criteria, null, 2))

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ Criteria: criteria }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`[PropertyRadar] search error ${res.status}:`, errorText)

    // If a field name is rejected, retry with only CORE_FIELDS (always safe)
    if (res.status === 400 && errorText.includes("specified in Fields param")) {
      console.warn("[PropertyRadar] Field rejected, retrying with minimal fields...")
      const retryUrl = `${BASE_URL}/v1/properties?Purchase=${purchase}&Fields=${CORE_FIELDS}&Limit=${limit}`
      const retryRes = await fetch(retryUrl, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ Criteria: criteria }),
      })
      if (retryRes.ok) {
        const retryData = await retryRes.json()
        const retryProps: PRProperty[] = Array.isArray(retryData?.results) ? retryData.results : Array.isArray(retryData) ? retryData : []
        console.log("[PropertyRadar] Retry returned", retryProps.length, "results with minimal fields")
        return { properties: retryProps, resultCount: retryData?.totalResultCount ?? retryProps.length }
      }
    }

    // If a criteria is rejected, retry without the bad criteria
    if (res.status === 400 && errorText.includes("specified in Criteria")) {
      console.warn("[PropertyRadar] Criteria rejected, retrying with location-only criteria...")
      const locationCriteria = criteria.filter((c: CriterionItem) =>
        ["State", "City", "ZipFive", "County", "Address"].includes(c.name)
      )
      if (locationCriteria.length > 0) {
        const retryUrl = `${BASE_URL}/v1/properties?Purchase=${purchase}&Fields=${fields}&Limit=${limit}`
        const retryRes = await fetch(retryUrl, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ Criteria: locationCriteria }),
        })
        if (retryRes.ok) {
          const retryData = await retryRes.json()
          const retryProps: PRProperty[] = Array.isArray(retryData?.results) ? retryData.results : Array.isArray(retryData) ? retryData : []
          console.log("[PropertyRadar] Criteria retry returned", retryProps.length, "results")
          return { properties: retryProps, resultCount: retryData?.totalResultCount ?? retryProps.length }
        }
      }
    }

    throw new Error(`PropertyRadar search failed (${res.status}): ${errorText}`)
  }

  const data = await res.json()
  // The API returns { results: [...], resultCount, totalResultCount, totalCost }
  const properties: PRProperty[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
  const totalResultCount = data?.totalResultCount ?? data?.resultCount ?? properties.length

  console.log("[PropertyRadar] Returned", properties.length, "of", totalResultCount, "total properties")

  return { properties, resultCount: totalResultCount }
}

/**
 * Get a single property by RadarID (GET /v1/properties/:id)
 */
export async function getProperty(
  radarId: string,
  fields: string = ALL_FIELDS,
  purchase: 0 | 1 = 1,
): Promise<PRProperty | null> {
  const url = `${BASE_URL}/v1/properties/${radarId}?Purchase=${purchase}&Fields=${fields}`

  console.log("[PropertyRadar] GET property:", radarId)

  const res = await fetch(url, { headers: headers() })

  if (!res.ok) {
    console.error(`[PropertyRadar] getProperty error ${res.status}:`, await res.text())
    return null
  }

  const data = await res.json()
  // Response: { results: [...], resultCount, totalCost }
  const results = data?.results || data
  return Array.isArray(results) ? results[0] || null : results
}

/**
 * Get persons / owners for a property (GET /v1/properties/:id/persons)
 */
export async function getPropertyPersons(
  radarId: string,
  purchase: 0 | 1 = 1,
): Promise<unknown[]> {
  const url = `${BASE_URL}/v1/properties/${radarId}/persons?Purchase=${purchase}&Fields=default`

  console.log("[PropertyRadar] GET persons:", radarId)

  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    console.error(`[PropertyRadar] getPersons error ${res.status}`)
    return []
  }

  const data = await res.json()
  return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
}

/**
 * Get sales comps for a property (GET /v1/properties/:id/comps/sales)
 */
export async function getSalesComps(
  radarId: string,
  purchase: 0 | 1 = 0,
): Promise<PRProperty[]> {
  const url = `${BASE_URL}/v1/properties/${radarId}/comps/sales?Purchase=${purchase}&Fields=default`

  console.log("[PropertyRadar] GET sales comps:", radarId)

  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    console.error(`[PropertyRadar] getSalesComps error ${res.status}`)
    return []
  }

  const data = await res.json()
  return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
}

/**
 * Get listing comps for a property (GET /v1/properties/:id/comps/forsale)
 */
export async function getListingComps(
  radarId: string,
  purchase: 0 | 1 = 0,
): Promise<PRProperty[]> {
  const url = `${BASE_URL}/v1/properties/${radarId}/comps/forsale?Purchase=${purchase}&Fields=default`

  console.log("[PropertyRadar] GET listing comps:", radarId)

  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    console.error(`[PropertyRadar] getListingComps error ${res.status}`)
    return []
  }

  const data = await res.json()
  return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
}

/**
 * Lookup FIPS code for a county name (GET /v1/suggestions/fips)
 */
export async function lookupFips(countyName: string): Promise<{ fips: string; name: string }[]> {
  const url = `${BASE_URL}/v1/suggestions/fips?SuggestionInput=${encodeURIComponent(countyName)}`

  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return []

  const data = await res.json()
  return Array.isArray(data) ? data : []
}

// ---------------------------------------------------------------------------
// High-level search helpers that build criteria from user-friendly params
// ---------------------------------------------------------------------------

export interface PropertySearchParams {
  // Location
  state?: string
  city?: string
  zip?: string
  county?: string
  address?: string
  // Property
  propertyType?: string
  bedsMin?: number
  bedsMax?: number
  bathsMin?: number
  bathsMax?: number
  yearBuiltMin?: number
  yearBuiltMax?: number
  // Value
  valueMin?: number
  valueMax?: number
  // Equity
  equityMin?: number
  equityMax?: number
  // Distress
  foreclosure?: boolean
  foreclosureStage?: string
  taxDelinquent?: boolean
  bankruptcy?: boolean
  divorce?: boolean
  vacant?: boolean
  deceased?: boolean
  // Owner
  ownerOccupied?: boolean
  absenteeOwner?: boolean
  // Listing
  listedForSale?: boolean
  // Limits
  limit?: number
  purchase?: 0 | 1
}

/**
 * High-level property search that builds Criteria from user-friendly params
 */
export async function searchPropertiesAdvanced(
  params: PropertySearchParams,
): Promise<{ properties: PRProperty[]; resultCount: number }> {
  const criteria: CriterionItem[] = []

  // Location
  criteria.push(
    ...buildLocationCriteria({
      state: params.state,
      city: params.city,
      zip: params.zip,
      county: params.county,
      address: params.address,
    }),
  )

  // Property type
  if (params.propertyType) {
    criteria.push(...buildPropertyTypeCriteria(params.propertyType))
  }

  // Beds / Baths
  if (params.bedsMin !== undefined || params.bedsMax !== undefined) {
    criteria.push(...buildBedsFilter(params.bedsMin, params.bedsMax))
  }
  if (params.bathsMin !== undefined || params.bathsMax !== undefined) {
    criteria.push(...buildBathsFilter(params.bathsMin, params.bathsMax))
  }

  // Year built
  if (params.yearBuiltMin !== undefined || params.yearBuiltMax !== undefined) {
    criteria.push(...buildYearBuiltFilter(params.yearBuiltMin, params.yearBuiltMax))
  }

  // Value
  if (params.valueMin !== undefined || params.valueMax !== undefined) {
    criteria.push(...buildValueCriteria({ minValue: params.valueMin, maxValue: params.valueMax }))
  }

  // Equity
  if (params.equityMin !== undefined || params.equityMax !== undefined) {
    criteria.push(
      ...buildEquityCriteria({
        minEquityPercent: params.equityMin,
        maxEquityPercent: params.equityMax,
      }),
    )
  }

  // Distress signals (only include API-supported criteria)
  const distressTypes: string[] = []
  if (params.foreclosure) distressTypes.push("foreclosure")
  if (params.taxDelinquent) distressTypes.push("tax delinquent")
  // bankruptcy and deceased are plan-restricted, skip as criteria
  if (params.divorce) distressTypes.push("divorce")
  if (params.vacant) distressTypes.push("vacant")
  if (distressTypes.length > 0) {
    criteria.push(...buildDistressCriteria(distressTypes))
  }

  // Specific foreclosure stage
  if (params.foreclosureStage) {
    criteria.push(...buildForeclosureCriteria(params.foreclosureStage))
  }

  // Owner occupancy (absenteeOwner uses isSameMailingOrExempt=0)
  if (params.absenteeOwner) {
    criteria.push(...buildOwnerOccupiedFilter(false))
  } else if (params.ownerOccupied !== undefined) {
    criteria.push(...buildOwnerOccupiedFilter(params.ownerOccupied))
  }

  // Listed for sale
  if (params.listedForSale !== undefined) {
    criteria.push(...buildListedForSaleFilter(params.listedForSale))
  }

  return searchProperties(criteria, SEARCH_FIELDS, params.limit || 20, params.purchase ?? 1)
}

// ---------------------------------------------------------------------------
// Mapper: PRProperty -> our standard PropertyResult shape
// ---------------------------------------------------------------------------

export function mapToPropertyResult(p: PRProperty) {
  return {
    radarId: p.RadarID || undefined,
    address: p.Address || "Unknown",
    city: p.City || "",
    state: p.State || "",
    zip: p.ZipFive || "",
    county: p.County || undefined,
    apn: p.APN || undefined,
    latitude: p.Latitude != null ? Number(p.Latitude) : undefined,
    longitude: p.Longitude != null ? Number(p.Longitude) : undefined,
    propertyType: p.PType || undefined,
    beds: p.Beds ?? undefined,
    baths: p.Baths ?? undefined,
    sqft: p.SqFt ?? undefined,
    lotSize: p.LotSize ?? undefined,
    yearBuilt: p.YearBuilt ?? undefined,
    units: p.Units ?? undefined,
    // Valuation
    value: p.AVM ?? undefined,
    equity: p.AvailableEquity ?? undefined,
    equityPercent: p.EquityPercent != null ? Number(p.EquityPercent) : undefined,
    availableEquity: p.AvailableEquity ?? undefined,
    loanBalance: p.TotalLoanBalance ?? undefined,
    // Owner (Persons data comes in a separate endpoint but Owner field is a summary)
    ownerName: p.Owner || p.Owner2 || undefined,
    ownerOccupied: p.isSameMailingOrExempt === 1,
    absenteeOwner: p.isSameMailingOrExempt === 0,
    // Distress signals (API returns 1/0 booleans)
    foreclosureStatus: p.inForeclosure === 1 ? (p.ForeclosureStage || "Active") : undefined,
    isPreforeclosure: p.isPreforeclosure === 1,
    isAuction: p.isAuction === 1,
    isBankOwned: p.isBankOwned === 1,
    foreclosureAuctionDate: p.SaleDate || undefined,
    foreclosureOpeningBid: p.OpeningBid ?? undefined,
    foreclosureRecDate: p.ForeclosureRecDate || undefined,
    defaultAmount: p.DefaultAmount ?? undefined,
    inTaxDelinquency: p.inTaxDelinquency === 1,
    // Compat with UI (taxDefaultYears used as boolean-ish in property cards)
    taxDefaultYears: p.inTaxDelinquency === 1 ? 1 : 0,
    taxDefaultAmount: undefined,
    inBankruptcy: p.inBankruptcyProperty === 1, // read from field data
    inDivorce: p.inDivorce === 1,
    isVacant: p.isSiteVacant === 1,
    isDeceased: p.isDeceasedProperty === 1, // read from field data
    // Transfer
    transferType: p.LastTransferType || undefined,
    transferDate: p.LastTransferRecDate || undefined,
    transferAmount: p.LastTransferValue ?? undefined,
    lastSaleDate: p.LastTransferRecDate || undefined,
    lastSalePrice: p.LastTransferValue ?? undefined,
    // Loan
    loanAmount: p.FirstAmount ?? undefined,
    loanRate: p.FirstRate ?? undefined,
    loanType: p.FirstLoanType || undefined,
    loanPurpose: p.FirstPurpose || undefined,
    // Listing
    listedForSale: p.isListedForSale === 1,
    listPrice: p.ListingPrice ?? undefined,
    listingDate: p.ListingDate || undefined,
    daysOnMarket: p.DaysOnMarket ?? undefined,
    // Tax
    assessedValue: p.AssessedValue ?? undefined,
    annualTaxes: p.AnnualTaxes ?? undefined,
    // Source
    source: "PropertyRadar",
  }
}
