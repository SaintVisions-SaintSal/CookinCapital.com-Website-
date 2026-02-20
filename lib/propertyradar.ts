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
  Latitude?: number
  Longitude?: number
  // Property details
  PType?: string
  Beds?: number
  Baths?: number
  SqFt?: number
  LotSqFt?: number
  YearBuilt?: number
  Units?: number
  Pool?: string
  OwnerOccupied?: string
  // Valuation
  AVM?: number
  AVMPerSqFt?: number
  EquityPercent?: number
  EquityEstimated?: number
  CLTV?: number
  OpenLoansBalance?: number
  HUDFairMarketRent?: number
  // Owner
  OwnerNames?: string
  OwnerMailAddress?: string
  OwnerMailCity?: string
  OwnerMailState?: string
  OwnerMailZip?: string
  YearsOwned?: number
  NumberOfPropertiesOwned?: number
  Deceased?: string
  // Distress
  InForeclosure?: string
  ForeclosureStage?: string
  NoticeRecordingDate?: string
  SaleDate?: string
  OpeningBid?: number
  PublishedBid?: number
  DefaultAmount?: number
  ForeclosingLoanAmount?: number
  TaxDelinquent?: string
  YearsTaxDelinquent?: number
  TaxDelinquentAmount?: number
  InBankruptcy?: string
  BankruptcyChapter?: string
  BankruptcyStatus?: string
  BankruptcyRecordingDate?: string
  HasDivorce?: string
  DivorceRecordingDate?: string
  SiteVacant?: string
  // Transfer
  PurchaseDate?: string
  PurchaseAmount?: number
  PurchaseType?: string
  TransferType?: string
  TransferDate?: string
  TransferAmount?: number
  CashTransfer?: string
  // Loans
  LoanAmount?: number
  LoanRate?: number
  LoanType?: string
  LoanPurpose?: string
  LoanDate?: string
  LoanTerm?: string
  // Listing
  ListedForSale?: string
  ListPrice?: number
  ListingDate?: string
  DaysOnMarket?: number
  ListingStatus?: string
  ListingType?: string
  // Tax
  AssessedValue?: number
  AnnualTaxes?: number
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
  "LotSqFt",
  "YearBuilt",
  "Units",
  "Pool",
  "OwnerOccupied",
].join(",")

export const VALUE_FIELDS = [
  "AVM",
  "AVMPerSqFt",
  "EquityPercent",
  "EquityEstimated",
  "CLTV",
  "OpenLoansBalance",
  "HUDFairMarketRent",
].join(",")

export const OWNER_FIELDS = [
  "OwnerNames",
  "OwnerMailAddress",
  "OwnerMailCity",
  "OwnerMailState",
  "OwnerMailZip",
  "YearsOwned",
  "NumberOfPropertiesOwned",
  "Deceased",
].join(",")

export const DISTRESS_FIELDS = [
  "InForeclosure",
  "ForeclosureStage",
  "NoticeRecordingDate",
  "SaleDate",
  "OpeningBid",
  "PublishedBid",
  "DefaultAmount",
  "TaxDelinquent",
  "YearsTaxDelinquent",
  "TaxDelinquentAmount",
  "InBankruptcy",
  "BankruptcyChapter",
  "BankruptcyStatus",
  "HasDivorce",
  "DivorceRecordingDate",
  "SiteVacant",
].join(",")

export const TRANSFER_FIELDS = [
  "PurchaseDate",
  "PurchaseAmount",
  "PurchaseType",
  "TransferDate",
  "TransferAmount",
  "TransferType",
  "CashTransfer",
].join(",")

export const LOAN_FIELDS = [
  "LoanAmount",
  "LoanRate",
  "LoanType",
  "LoanPurpose",
  "LoanDate",
  "LoanTerm",
].join(",")

export const LISTING_FIELDS = [
  "ListedForSale",
  "ListPrice",
  "ListingDate",
  "DaysOnMarket",
  "ListingStatus",
  "ListingType",
].join(",")

export const TAX_FIELDS = ["AssessedValue", "AnnualTaxes"].join(",")

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
  "OwnerNames",
  "YearsOwned",
  "PurchaseDate",
  "PurchaseAmount",
  "ListedForSale",
  "ListPrice",
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
    // Specific stage: Preforeclosure, Auction, BankOwned
    return [{ name: "ForeclosureStage", value: [stage] }]
  }
  // Any active foreclosure
  return [{ name: "InForeclosure", value: ["Yes"] }]
}

export function buildDistressCriteria(types: string[]): CriterionItem[] {
  const criteria: CriterionItem[] = []
  for (const t of types) {
    const lower = t.toLowerCase()
    if (lower.includes("foreclosure") || lower.includes("preforeclosure")) {
      criteria.push({ name: "InForeclosure", value: ["Yes"] })
    }
    if (lower.includes("tax") || lower.includes("delinquent")) {
      criteria.push({ name: "TaxDelinquent", value: ["Yes"] })
    }
    if (lower.includes("bankruptcy")) {
      criteria.push({ name: "InBankruptcy", value: ["Yes"] })
    }
    if (lower.includes("divorce")) {
      criteria.push({ name: "HasDivorce", value: ["Yes"] })
    }
    if (lower.includes("vacant")) {
      criteria.push({ name: "SiteVacant", value: ["Yes"] })
    }
    if (lower.includes("deceased")) {
      criteria.push({ name: "Deceased", value: ["Yes"] })
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
  if (opts.minEquityPercent !== undefined || opts.maxEquityPercent !== undefined) {
    criteria.push({
      name: "EquityPercent",
      value: [opts.minEquityPercent ?? -100, opts.maxEquityPercent ?? 100],
    })
  }
  if (opts.minCLTV !== undefined || opts.maxCLTV !== undefined) {
    criteria.push({
      name: "CLTV",
      value: [opts.minCLTV ?? 0, opts.maxCLTV ?? 200],
    })
  }
  return criteria
}

export function buildValueCriteria(opts: {
  minValue?: number
  maxValue?: number
}): CriterionItem[] {
  if (opts.minValue === undefined && opts.maxValue === undefined) return []
  return [
    {
      name: "AVM",
      value: [opts.minValue ?? 0, opts.maxValue ?? 99999999],
    },
  ]
}

export function buildBedsFilter(min?: number, max?: number): CriterionItem[] {
  if (min === undefined && max === undefined) return []
  return [{ name: "Beds", value: [min ?? 0, max ?? 99] }]
}

export function buildBathsFilter(min?: number, max?: number): CriterionItem[] {
  if (min === undefined && max === undefined) return []
  return [{ name: "Baths", value: [min ?? 0, max ?? 99] }]
}

export function buildYearBuiltFilter(min?: number, max?: number): CriterionItem[] {
  if (min === undefined && max === undefined) return []
  return [{ name: "YearBuilt", value: [min ?? 1800, max ?? new Date().getFullYear()] }]
}

export function buildOwnerOccupiedFilter(ownerOccupied: boolean): CriterionItem[] {
  return [{ name: "OwnerOccupied", value: [ownerOccupied ? "Yes" : "No"] }]
}

export function buildListedForSaleFilter(listed: boolean): CriterionItem[] {
  return [{ name: "ListedForSale", value: [listed ? "Yes" : "No"] }]
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
    throw new Error(`PropertyRadar search failed (${res.status}): ${errorText}`)
  }

  const data = await res.json()
  // The API returns an array of property objects
  const properties: PRProperty[] = Array.isArray(data) ? data : data.results || data.properties || []

  console.log("[PropertyRadar] Returned", properties.length, "properties")

  return { properties, resultCount: properties.length }
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
  return Array.isArray(data) ? data[0] || null : data
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
  return Array.isArray(data) ? data : []
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
  return Array.isArray(data) ? data : []
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
  return Array.isArray(data) ? data : []
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

  // Distress signals
  const distressTypes: string[] = []
  if (params.foreclosure) distressTypes.push("foreclosure")
  if (params.taxDelinquent) distressTypes.push("tax delinquent")
  if (params.bankruptcy) distressTypes.push("bankruptcy")
  if (params.divorce) distressTypes.push("divorce")
  if (params.vacant) distressTypes.push("vacant")
  if (params.deceased) distressTypes.push("deceased")
  if (distressTypes.length > 0) {
    criteria.push(...buildDistressCriteria(distressTypes))
  }

  // Specific foreclosure stage
  if (params.foreclosureStage) {
    criteria.push(...buildForeclosureCriteria(params.foreclosureStage))
  }

  // Owner occupancy
  if (params.ownerOccupied !== undefined) {
    criteria.push(...buildOwnerOccupiedFilter(params.ownerOccupied))
  }
  if (params.absenteeOwner) {
    criteria.push(...buildOwnerOccupiedFilter(false))
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
    latitude: p.Latitude,
    longitude: p.Longitude,
    propertyType: p.PType || undefined,
    beds: p.Beds ?? undefined,
    baths: p.Baths ?? undefined,
    sqft: p.SqFt ?? undefined,
    lotSize: p.LotSqFt ?? undefined,
    yearBuilt: p.YearBuilt ?? undefined,
    units: p.Units ?? undefined,
    // Valuation
    value: p.AVM ?? undefined,
    equity: p.EquityEstimated ?? undefined,
    equityPercent: p.EquityPercent ?? undefined,
    availableEquity: p.EquityEstimated ?? undefined,
    loanBalance: p.OpenLoansBalance ?? undefined,
    // Owner
    ownerName: p.OwnerNames || undefined,
    ownerAddress: p.OwnerMailAddress || undefined,
    ownerCity: p.OwnerMailCity || undefined,
    ownerState: p.OwnerMailState || undefined,
    ownerZip: p.OwnerMailZip || undefined,
    yearsOwned: p.YearsOwned ?? undefined,
    // Distress signals
    foreclosureStatus: p.InForeclosure === "Yes" ? (p.ForeclosureStage || "Active") : undefined,
    foreclosureAuctionDate: p.SaleDate || undefined,
    foreclosureOpeningBid: p.OpeningBid ?? undefined,
    taxDefaultYears: p.YearsTaxDelinquent ?? undefined,
    taxDefaultAmount: p.TaxDelinquentAmount ?? undefined,
    inBankruptcy: p.InBankruptcy === "Yes",
    bankruptcyStatus: p.BankruptcyStatus || undefined,
    bankruptcyChapter: p.BankruptcyChapter || undefined,
    inDivorce: p.HasDivorce === "Yes",
    divorceRecordingDate: p.DivorceRecordingDate || undefined,
    isVacant: p.SiteVacant === "Yes",
    isDeceased: p.Deceased === "Yes",
    hasLiens: false,
    lienAmount: undefined,
    // Transfer
    transferType: p.TransferType || p.PurchaseType || undefined,
    transferDate: p.TransferDate || p.PurchaseDate || undefined,
    transferAmount: p.TransferAmount || p.PurchaseAmount || undefined,
    lastSaleDate: p.PurchaseDate || undefined,
    lastSalePrice: p.PurchaseAmount ?? undefined,
    // Loan
    loanRate: p.LoanRate ?? undefined,
    loanType: p.LoanType || undefined,
    // Listing
    listedForSale: p.ListedForSale === "Yes",
    listPrice: p.ListPrice ?? undefined,
    listingDate: p.ListingDate || undefined,
    daysOnMarket: p.DaysOnMarket ?? undefined,
    // Tax
    assessedValue: p.AssessedValue ?? undefined,
    annualTaxes: p.AnnualTaxes ?? undefined,
    // Source
    source: "PropertyRadar",
  }
}
