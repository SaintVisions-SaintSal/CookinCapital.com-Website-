/**
 * PropertyRadar API client — typed, live-verified against production keys 2026-08-03.
 *
 * Source of truth: /home/user/workspace/research/VERIFIED_API_FINDINGS.md
 * (see the "✅ CORRECTION — FULL CATALOG RE-VALIDATED LIVE (192 criteria
 * tested)" section, which supersedes the earlier draft findings in the same
 * file). All 192 documented PropertyRadar criteria are valid on this
 * account; only 4 are plan-gated.
 *
 * Key facts baked into this client (do NOT "fix" these against generic docs
 * — they were confirmed against the live API and override the general
 * spec):
 *  - Criteria objects are ONLY `{ name, value }`. There is no `vt` key.
 *  - `County` / `FIPS` must be a 4-5 digit FIPS integer, not a county name.
 *  - `Purchase=0` returns `{ totalResultCount, results: [] }` and is always free.
 *  - `Purchase=1` returns real records and decrements paid quota
 *    (response includes `quantityFreeRemaining`).
 *  - Range criteria ("Multiple Range"): `{ name, value: [[min, max]] }`,
 *    null = unbounded. Applies to AVM, Age, AnnualTaxes, AssessedValue,
 *    AssessedValueDividedByAVM, AssessedYear, AvailableEquity, BasementSqFt,
 *    Baths, Beds, CLTV, CapRate, CensusTract, DOTAmount, DaysOnMarket,
 *    DefaultAmount, DelinquentAmount, DistressScore, DownPayment,
 *    DownPaymentPercent, EquityPercent, EstCashReturn, EstimatedRent,
 *    EstimatedTaxRate, GarageSize, GarageSqFt, ImpValue, LandValue,
 *    LastTransferDownPaymentPercent, LastTransferValue, LienAmount,
 *    LienRate, LikelyHelocScore, LikelyListingScore, LikelyPurchaseScore,
 *    LikelyRefinanceScore, ListingDiscountToEstValuePercent, ListingPrice,
 *    ListingPriceChange, LotSize, LotSizeAcres, NumProperties, NumberLoans,
 *    NumberPropertiesOwned, OpeningBid, OpeningBidDividedByAVM,
 *    PersonLienAmount, PersonLienRate, PersonOpenLiens,
 *    PriorTransferChangeInPrice, PriorTransferChangeInPricePercent,
 *    PriorTransferMonthsSince, PropertyAge, PropertyOpenLiens,
 *    PublishedBidDividedByAVM, Rooms, SaleAmount, SiteNumber, SqFt, Stories,
 *    TotalLoanBalance, Units, ValuePerSF, WinningBid, YearBuilt.
 *  - Relative date criteria ("Relative Date"): `{ name, value: [-30] }` for
 *    "last 30 days". Applies to BankruptcyRecordingDate, DOTRecDate,
 *    DefaultAsOf, DivorceFilingDate, EvictionFilingDate, ForeclosureRecDate,
 *    LastTransferRecDate, LienRecDate, ListingDate, ListingStatusDate,
 *    NoticePublishedDate, OriginalSaleDate (gated), PersonLienRecDate,
 *    PreviousSaleDate (gated), ProbateFilingDate, SaleDate (gated),
 *    TransferPublishedDate, TransferRecDate.
 *  - Enum criteria ("Multiple Values" from a fixed list) must use exact
 *    verbatim strings, e.g. ForeclosureStage, ListingStatus, ListingType,
 *    LienStatus (`O`|`r`), PersonLienStatus (`Open`|`Released`),
 *    PersonLienDocType, OwnershipType, BankruptcyStatus, BankruptcyChapter,
 *    BankruptcyDistrict, Gender, FloodZone, FloodZoneRisk, SiteDirection,
 *    State, TransferType, LastTransferType, TransferDocType,
 *    LastTransferDocType, ForeclosureDocType, LienDocType,
 *    ConstructionType, BasementType, RoofType, ExteriorWallType, ViewType.
 *  - `PropertyType` requires a nested sub-param array: `{ name:
 *    "PropertyType", value: [{ name: "PType", value: ["SFR", "CND"] }] }`.
 *  - `LimitNearest` requires a `type` field: `address` | `current_location`.
 *  - `Radius` must be a GeoJSON Circle: `{ type: "Circle", coordinates:
 *    [lon, lat], radius, radius_units }`.
 *  - `Polygon` must specify its search region type explicitly.
 *  - `RadarID` values must begin with `"P"`.
 *  - Invalid criterion names come back as `"Unexpected Criterion: <name>"`.
 *  - Plan-gated (valid but rejected) criteria come back as
 *    `"The param: X cannot be used by this user"` — confirmed to be ONLY
 *    `PostReason`, `PreviousSaleDate`, `SaleDate`, `SiteAddress` on this
 *    account.
 */

import { getEnv } from "@/lib/env";

const BASE_URL = "https://api.propertyradar.com";

// ---------------------------------------------------------------------------
// Criteria value shapes
// ---------------------------------------------------------------------------

export type CriteriaValue =
  | (string | number)[]
  | [number | null, number | null][]
  | [number]
  | { name: string; value: (string | number)[] }[]
  | { limit: number; type: "address" | "current_location"; address?: string }[]
  | { limit: number; sort_field: string; sort_dir: "ASC" | "DESC" }[]
  | Record<string, unknown>;

export interface CriteriaEntry {
  name: string;
  value: CriteriaValue;
}

// ---------------------------------------------------------------------------
// Verified criteria catalog (live-probed against production account,
// 192/192 documented criteria confirmed valid; only 4 plan-gated)
// ---------------------------------------------------------------------------

/**
 * Criteria names confirmed to be ACCEPTED by this account/plan. This is the
 * full 192-criterion PropertyRadar catalog minus the 4 plan-gated fields
 * (tracked separately in PLAN_GATED_CRITERIA).
 */
export const VALID_CRITERIA: ReadonlySet<string> = new Set([
  // Location
  "State", "County", "FIPS", "City", "ZipFive", "Address", "SiteStreetName",
  "SiteNumber", "APN", "Subdivision", "LimitNearest", "RadarID",
  "isStreetNumberOdd", "isSiteComplete", "SiteDirection", "SitePostDirection",
  "CarrierRoute", "TaxRateArea", "CensusTract", "CensusBlock",
  "SiteCongressionalDistrict", "Polygon", "Radius",
  // Property
  "PropertyType", "PType", "AdvancedPropertyType", "isSameMailingOrExempt",
  "OwnershipType", "Beds", "Baths", "YearBuilt", "SqFt", "Units", "Stories",
  "PropertyAge", "LotSize", "LotSizeAcres", "Rooms", "GarageSize",
  "GarageSqFt", "BasementSqFt", "Pool", "Fireplace", "AirCond", "Heating",
  "isSameMailing", "isSameCounty", "isSameState", "Zoning", "ViewType",
  "BasementType", "ConstructionType", "RoofType", "ExteriorWallType",
  "FloodZone", "FloodZoneRisk",
  // Owner
  "OwnerName", "NumberPropertiesOwned", "OwnerPhone", "hasOwnerPhone",
  "hasOwnerMobilePhone", "OwnerEmail", "hasOwnerEmail", "Age", "Gender",
  // Value / Equity / Tax
  "AVM", "ValuePerSF", "AvailableEquity", "EquityPercent", "CLTV",
  "TotalLoanBalance", "EstimatedRent", "CapRate", "EstCashReturn",
  "AssessedValue", "AssessedValueDividedByAVM", "LandValue", "ImpValue",
  "AssessedYear", "AnnualTaxes", "EstimatedTaxRate", "OwnerExemption",
  // Foreclosure
  "inForeclosure", "ForeclosureStage", "ForeclosureDocType",
  "ForeclosureRecDate", "NoticePublishedDate", "OriginalSaleDate",
  "PostReason", "OpeningBid", "WinningBid", "SaleAmount",
  "OpeningBidDividedByAVM", "PublishedBidDividedByAVM", "DefaultAmount",
  "DefaultAsOf", "LisPendensType", "Trustee", "TrusteePhone",
  "TrusteeSaleNum", "Attorney", "AttorneyPhone", "CaseNumber", "DOTPosition",
  "DOTAmount", "DOTRecDate", "ForeclosingLender", "ForeclosureDocNumber",
  "ForeclosureBookNumber", "ForeclosurePageNumber", "SaleDate",
  "PreviousSaleDate",
  // Other Distress
  "DistressScore", "isSiteVacant", "isMailVacant", "isDeceased",
  "inProbateProperty", "ProbateFilingDate", "inTaxDelinquency",
  "YearsDelinquent", "DelinquentAmount", "inBankruptcy", "BankruptcyStatus",
  "BankruptcyRecordingDate", "BankruptcyChapter", "BankruptcyDistrict",
  "inDivorce", "DivorceFilingDate", "hasRecentEviction", "EvictionFilingDate",
  "PropertyHasOpenPersonLiens", "PersonOpenLiens", "PersonLienDocType",
  "PersonLienStatus", "PersonLienRecDate", "PersonLienAmount",
  "PersonLienRate", "PersonLienholder", "PropertyHasOpenLiens",
  "PropertyOpenLiens", "LienDocType", "LienPositionNum", "LienStatus",
  "LienRecDate", "LienAmount", "LienRate", "PropertyLienholder",
  "LikelyListingScore", "LikelyPurchaseScore", "LikelyRefinanceScore",
  "LikelyHelocScore", "NumberLoans",
  "LastTransferValue", "LastTransferSeller", "LastTransferRecDate",
  "LastTransferType", "LastTransferDocType", "LastTransferDownPaymentPercent",
  "PriorTransferChangeInPrice", "PriorTransferChangeInPricePercent",
  "PriorTransferMonthsSince", "TransferType", "TransferRecDate",
  "TransferPublishedDate", "TransferDocType", "PurchaseMonth",
  "DownPayment", "DownPaymentPercent", "isCashTransaction", "wasListed",
  "isMostRecentMarketTransfer", "isMultipleParcels", "NumProperties",
  "Buyer", "Seller", "TitleCo", "isListedForSale", "isListedForSaleByOwner",
  "ListingStatus", "ListingType", "ListingPrice", "ListingPriceChange",
  "ListingDiscountToEstValuePercent", "ListingDate", "DaysOnMarket",
  "ListingStatusDate", "FirstLoanType",
  // List membership / workflow
  "InList", "InAllLists", "NotInList", "StatusLevel", "InterestLevel",
  "hasPhotos", "hasNotes", "hasDocs", "LimitSort",
]);

/**
 * Criteria names that are VALID field names but REJECTED at query time with
 * "The param: X cannot be used by this user" — i.e. require a plan
 * upgrade. The research doc's "only 4 gated fields" list covered the
 * fields it re-probed, but live testing during implementation surfaced
 * additional Trustee-Sale-Tracking-gated auction-economics fields
 * (OpeningBid/WinningBid/*DividedByAVM family) that return the same
 * "Upgrade Required" / "The feature [Trustee Sale Tracking] is not
 * included in your current subscription plan" error. All confirmed via
 * live 400 responses against the production account.
 */
export const PLAN_GATED_CRITERIA: Readonly<Record<string, string>> = {
  PostReason: "Requires Trustee Sale Tracking subscription add-on; not available on this plan.",
  PreviousSaleDate: "Requires Trustee Sale Tracking subscription add-on; not available on this plan.",
  SaleDate: "Requires Trustee Sale Tracking subscription add-on. Use ForeclosureStage=Auction plus ForeclosureRecDate as a timing proxy instead.",
  SiteAddress: "Requires a plan upgrade for full-address parsing. Use Address + City + State + ZipFive separately instead.",
  OpeningBid: 'Requires Trustee Sale Tracking subscription add-on ("Upgrade Required" live 400). Use ForeclosureStage=Auction alone as a proxy instead.',
  OpeningBidDividedByAVM: 'Requires Trustee Sale Tracking subscription add-on ("Upgrade Required" live 400). Use ForeclosureStage=Auction alone as a proxy instead.',
  WinningBid: "Requires Trustee Sale Tracking subscription add-on; not available on this plan.",
  PublishedBidDividedByAVM: "Requires Trustee Sale Tracking subscription add-on; not available on this plan.",
  OriginalSaleDate: "Requires Trustee Sale Tracking subscription add-on; not available on this plan.",
};

/**
 * Common naming mistakes (aliases people might guess) mapped to the correct
 * verified criterion name, so callers get an actionable error instead of a
 * silent 400 from the live API.
 */
export const CRITERIA_NAME_CORRECTIONS: Readonly<Record<string, string>> = {
  isProbate: "inProbateProperty",
  isDivorce: "inDivorce",
  isBankruptcy: "inBankruptcy",
  isTaxDelinquent: "inTaxDelinquency",
  TaxDelinquent: "inTaxDelinquency",
  isCashBuyer: "isCashTransaction",
  ListPrice: "ListingPrice",
  ListDate: "ListingDate",
  isLien: "PropertyHasOpenLiens",
  isInvoluntaryLien: "PropertyHasOpenLiens",
  isJudgment: "PersonLienDocType (value ABJ) or PersonOpenLiens range",
  isHighEquity: "EquityPercent (range)",
  MyValue: "AVM",
  isFreeClear: "TotalLoanBalance (tight low range, e.g. [[0,1000]])",
  isVeteran: "not available — no verified criterion",
  isTrust: "OwnershipType (value Trust)",
  isCorporateOwned: "OwnershipType (value Corporate)",
  OwnerOccupied: "isSameMailingOrExempt",
};

export class CriteriaValidationError extends Error {
  constructor(name: string, reason: string) {
    super(`PropertyRadar criterion "${name}" cannot be used: ${reason}`);
    this.name = "CriteriaValidationError";
  }
}

function assertValidCriterion(name: string): void {
  if (name in PLAN_GATED_CRITERIA) {
    throw new CriteriaValidationError(
      name,
      `valid field but gated on this account's plan tier ("The param: ${name} cannot be used by this user"). ${PLAN_GATED_CRITERIA[name]}`
    );
  }
  if (!VALID_CRITERIA.has(name)) {
    const suggestion = CRITERIA_NAME_CORRECTIONS[name];
    if (suggestion) {
      throw new CriteriaValidationError(
        name,
        `not a valid criterion name ("Unexpected Criterion"). Did you mean "${suggestion}"?`
      );
    }
    throw new CriteriaValidationError(
      name,
      "not in the live-verified VALID_CRITERIA set (192-criterion catalog). If this is a real PropertyRadar field, verify it live with Purchase=0 before adding it."
    );
  }
}

// ---------------------------------------------------------------------------
// Criteria builder
// ---------------------------------------------------------------------------

export class CriteriaBuilder {
  private entries: CriteriaEntry[] = [];

  /** Equality / membership criterion: OR'd list of scalar values. */
  eq(name: string, vals: (string | number)[]): this {
    assertValidCriterion(name);
    this.entries.push({ name, value: vals });
    return this;
  }

  /** Boolean criterion, e.g. bool("isDeceased", 1) / bool("isSiteVacant", 0). */
  bool(name: string, val: 0 | 1): this {
    assertValidCriterion(name);
    this.entries.push({ name, value: [val] });
    return this;
  }

  /** Numeric range criterion -> nested 2-element array. null = unbounded. */
  range(name: string, min: number | null, max: number | null): this {
    assertValidCriterion(name);
    this.entries.push({ name, value: [[min, max]] });
    return this;
  }

  /**
   * Relative date criterion using the small negative-integer form, e.g.
   * relativeDays("ForeclosureRecDate", 30) -> last 30 days.
   *
   * IMPORTANT (live-verified quirk, 2026-08-03): the bare `-N` integer form
   * only reliably returns a `totalResultCount` for N up to roughly 150
   * days; beyond that the API silently returns `{results: []}` with NO
   * `totalResultCount` and NO error. For longer lookback windows use
   * `relativePreset()` with one of the documented preset strings (e.g.
   * "Last 365 Days", "Last Year") or `relativeRange()` with explicit dates
   * instead — both are confirmed to work correctly for multi-year windows.
   */
  relativeDays(name: string, n: number): this {
    assertValidCriterion(name);
    if (Math.abs(n) > 150) {
      throw new Error(
        `relativeDays("${name}", ${n}): the bare -N integer form is only verified reliable up to ~150 days. ` +
          `Use relativePreset("${name}", "Last 365 Days") or relativeRange("${name}", from, to) for longer windows.`
      );
    }
    this.entries.push({ name, value: [-Math.abs(n)] });
    return this;
  }

  /**
   * Relative date criterion using a documented preset string, e.g.
   * relativePreset("LastTransferRecDate", "Last 365 Days"). Verified presets:
   * Today, Tomorrow, Yesterday, This Week, This Month, This Quarter, This
   * Year, Last Week, Last Month, Last Quarter, Last Year, Last 7 Days,
   * Last 30 Days, Last 90 Days, Last 180 Days, Last 365 Days, Next Week,
   * Next Month, Next Quarter, Next Year, Next 7 Days, Next 30 Days,
   * Next 90 Days, Next 365 Days.
   */
  relativePreset(name: string, preset: string): this {
    assertValidCriterion(name);
    this.entries.push({ name, value: [preset] });
    return this;
  }

  /**
   * Relative date criterion using an explicit "from: M/D/YYYY to: M/D/YYYY"
   * range string — confirmed to work for arbitrarily long lookback windows
   * (e.g. 10-year hold-time screens), unlike the bare -N integer form.
   */
  relativeRange(name: string, from: string, to: string): this {
    assertValidCriterion(name);
    this.entries.push({ name, value: [`from: ${from} to: ${to}`] });
    return this;
  }

  /** PropertyType sub-param form: propertyType("SFR", "CND"). */
  propertyType(...ptypes: string[]): this {
    assertValidCriterion("PropertyType");
    this.entries.push({
      name: "PropertyType",
      value: [{ name: "PType", value: ptypes }],
    });
    return this;
  }

  /** InList / NotInList / InAllLists membership criterion. */
  inList(name: "InList" | "InAllLists" | "NotInList", listIds: number[]): this {
    assertValidCriterion(name);
    this.entries.push({ name, value: listIds });
    return this;
  }

  /** LimitNearest — circle-prospecting by straight-line distance from an address. */
  limitNearest(limit: number, address: string): this {
    assertValidCriterion("LimitNearest");
    this.entries.push({
      name: "LimitNearest",
      value: [{ limit, type: "address", address }],
    });
    return this;
  }

  /** Radius — GeoJSON Circle search region. */
  radius(lon: number, lat: number, radiusMi: number): this {
    assertValidCriterion("Radius");
    this.entries.push({
      name: "Radius",
      value: { type: "Circle", coordinates: [lon, lat], radius: radiusMi, radius_units: "mi" },
    });
    return this;
  }

  /** Escape hatch for raw criteria not covered by helpers above (still validated). */
  raw(name: string, value: CriteriaValue): this {
    assertValidCriterion(name);
    this.entries.push({ name, value });
    return this;
  }

  build(): CriteriaEntry[] {
    return this.entries;
  }
}

export function criteria(): CriteriaBuilder {
  return new CriteriaBuilder();
}

// ---------------------------------------------------------------------------
// FIPS county map — CA/AZ/TX/NV/FL major counties
// ---------------------------------------------------------------------------

export const FIPS: Readonly<Record<string, number>> = {
  // California
  "CA:Orange": 6059,
  "CA:Los Angeles": 6037,
  "CA:San Diego": 6073,
  "CA:Riverside": 6065,
  "CA:San Bernardino": 6071,
  "CA:Ventura": 6111,
  "CA:Sacramento": 6067,
  "CA:Fresno": 6019,
  "CA:Kern": 6029,
  "CA:Alameda": 6001,
  "CA:Santa Clara": 6085,
  "CA:Contra Costa": 6013,
  // Arizona
  "AZ:Maricopa": 4013,
  "AZ:Pima": 4019,
  // Nevada
  "NV:Clark": 32003,
  "NV:Washoe": 32031,
  // Texas
  "TX:Harris": 48201,
  "TX:Dallas": 48113,
  "TX:Tarrant": 48439,
  "TX:Bexar": 48029,
  "TX:Travis": 48453,
  // Florida
  "FL:Miami-Dade": 12086,
  "FL:Broward": 12011,
  "FL:Palm Beach": 12099,
  "FL:Hillsborough": 12057,
  "FL:Orange-FL": 12095,
};

export function fips(stateCounty: string): number {
  const code = FIPS[stateCounty];
  if (code === undefined) {
    throw new Error(
      `Unknown FIPS lookup "${stateCounty}". Known keys: ${Object.keys(FIPS).join(", ")}`
    );
  }
  return code;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface CountResponse {
  totalResultCount: number;
  results: [];
  /** Live account export quota remaining. Returned even on free Purchase=0 calls. */
  quantityFreeRemaining?: number;
  maxAllowedAcrossLists?: number;
}

/** Property record shape for Fields=All (103 verified fields). Optional
 * because different Fields params / plan tiers may omit some. */
export interface PropertyRadarRecord {
  RadarID: string;
  APN?: string;
  Address?: string;
  City?: string;
  State?: string;
  County?: string;
  ZipFive?: string;
  AVM?: number;
  AVMAsOf?: string;
  AVMPerSqFt?: number;
  AssessedValue?: number;
  AssessedYear?: number;
  AvailableEquity?: number;
  EquityPercent?: number;
  CLTV?: number;
  TotalLoanBalance?: number;
  AnnualTaxes?: number;
  EstimatedTaxRate?: number;
  Baths?: number;
  Beds?: number;
  SqFt?: number;
  LotSize?: number;
  LotSizeAcres?: number;
  YearBuilt?: number;
  Units?: number;
  Stories?: number;
  Pool?: number;
  Fireplace?: number;
  AirCond?: number;
  Heating?: number;
  GarageSize?: number;
  GarageSqFt?: number;
  PType?: string;
  AdvancedPropertyType?: string;
  inForeclosure?: number;
  ForeclosureStage?: string;
  ForeclosureRecDate?: string;
  ForeclosureDocNumber?: string;
  DefaultAmount?: number;
  DefaultAsOf?: string;
  ForeclosingLender?: string;
  Trustee?: string;
  TrusteePhone?: string;
  TrusteeSaleNum?: string;
  LisPendensType?: string;
  NoticeKey?: string;
  OpeningBid?: number;
  OpeningBidDividedByAVM?: number;
  WinningBid?: number;
  isAuction?: number;
  isBankOwned?: number;
  isPreforeclosure?: number;
  OwnerExemption?: number;
  isSameMailing?: number;
  isSameMailingOrExempt?: number;
  isDeceased?: number;
  isMailVacant?: number;
  isSiteVacant?: number;
  isListedForSale?: number;
  isListedForSaleByOwner?: number;
  ListingStatus?: string;
  ListingType?: string;
  DaysOnMarket?: number;
  LastTransferRecDate?: string;
  LastTransferValue?: number;
  LastTransferType?: string;
  FirstLoanType?: string;
  DOTAmount?: number;
  DOTRecDate?: string;
  DOTPosition?: string;
  DelinquentAmount?: number;
  YearsDelinquent?: number;
  PropertyHasOpenLiens?: number;
  LienAmount?: number;
  LienStatus?: string;
  EvictionFilingDate?: string;
  inProbateProperty?: number;
  inDivorce?: number;
  inBankruptcy?: number;
  inTaxDelinquency?: number;
  hasRecentEviction?: number;
  DistressScore?: number;
  LikelyListingScore?: number;
  LikelyPurchaseScore?: number;
  LikelyRefinanceScore?: number;
  LikelyHelocScore?: number;
  CapRate?: number;
  EstimatedRent?: number;
  EstCashReturn?: number;
  AssessedValueDividedByAVM?: number;
  OwnershipType?: string;
  NumberPropertiesOwned?: number;
  hasOwnerPhone?: number;
  hasOwnerMobilePhone?: number;
  hasOwnerEmail?: number;
  Latitude?: number;
  Longitude?: number;
  Taxpayer?: string;
  FullLegal?: string;
  Transactions?: unknown;
  CompsListingsForSale?: unknown;
  CompsSales?: unknown;
  _links?: unknown;
  [key: string]: unknown;
}

export interface SearchResponse {
  totalResultCount?: number;
  resultCount?: number;
  totalCost?: string;
  quantityFreeRemaining?: number;
  results: PropertyRadarRecord[];
}

export interface PersonRecord {
  isPrimaryContact?: boolean;
  OwnershipRole?: string;
  Status?: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  Suffix?: string;
  EntityName?: string;
  Age?: number;
  Gender?: string;
  Phone?: unknown;
  Email?: unknown;
  SocialAccounts?: unknown;
  MailAddress?: string;
  PrimaryResidence?: boolean;
  OtherProperties?: unknown;
  Occupation?: string;
  isDeceased?: boolean;
  [key: string]: unknown;
}

export interface ListSummary {
  ListID?: number;
  Name?: string;
  Type?: string;
  [key: string]: unknown;
}

export interface ListsResponse {
  results: ListSummary[];
  totalCountAcrossLists: number;
  maxAllowedAcrossLists: number;
  remainingAcrossAllLists: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export interface SearchOptions {
  limit?: number;
  start?: number;
  fields?: string | string[];
}

export interface PropertyRadarClientOptions {
  apiKey?: string;
  baseUrl?: string;
  maxRetries?: number;
}

export class PropertyRadarClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;

  constructor(opts: PropertyRadarClientOptions = {}) {
    const apiKey = opts.apiKey ?? getEnv("PROPERTY_RADAR_API");
    if (!apiKey) {
      throw new Error(
        "Missing PropertyRadar API key. Set PROPERTY_RADAR_API in your environment (see .env.example)."
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = opts.baseUrl ?? BASE_URL;
    this.maxRetries = opts.maxRetries ?? 4;
  }

  private async request<T>(
    path: string,
    init: RequestInit & { query?: Record<string, string | number | undefined> } = {}
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    let attempt = 0;
    for (;;) {
      const res = await fetch(url.toString(), {
        method: init.method ?? "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(init.headers as Record<string, string> | undefined),
        },
        body: init.body,
      });

      if (res.status === 429 || res.status >= 500) {
        if (attempt >= this.maxRetries) {
          const text = await safeText(res);
          throw new Error(
            `PropertyRadar request failed after ${attempt + 1} attempts: ${res.status} ${res.statusText} — ${text}`
          );
        }
        const backoffMs = Math.min(30_000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250);
        await sleep(backoffMs);
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`PropertyRadar API error ${res.status} ${res.statusText}: ${text}`);
      }

      return (await res.json()) as T;
    }
  }

  /**
   * Free counting call. Always sends Purchase=0. Returns totalResultCount
   * with no records and no cost.
   */
  async count(crit: CriteriaEntry[]): Promise<CountResponse> {
    return this.request<CountResponse>("/v1/properties", {
      method: "POST",
      query: { Fields: "All", Limit: 1, Start: 0, Purchase: 0 },
      body: JSON.stringify({ Criteria: crit }),
    });
  }

  /**
   * Paid search call. Sends Purchase=1 — this WILL decrement your account's
   * export quota / balance for every record returned. Always call count()
   * first and gate total volume against MAX_PURCHASE in the pipeline.
   */
  async search(
    crit: CriteriaEntry[],
    opts: SearchOptions = {}
  ): Promise<SearchResponse> {
    const fields = opts.fields ?? "All";
    return this.request<SearchResponse>("/v1/properties", {
      method: "POST",
      query: {
        Fields: Array.isArray(fields) ? fields.join(",") : fields,
        Limit: opts.limit ?? 20,
        Start: opts.start ?? 0,
        Purchase: 1,
      },
      body: JSON.stringify({ Criteria: crit }),
    });
  }

  /** GET /v1/properties/{RadarID} — single property detail. Purchase param required. */
  async getProperty(
    radarId: string,
    opts: { purchase?: 0 | 1; fields?: string | string[] } = {}
  ): Promise<PropertyRadarRecord> {
    const fields = opts.fields ?? "All";
    const res = await this.request<{ results: PropertyRadarRecord[] } | PropertyRadarRecord>(
      `/v1/properties/${encodeURIComponent(radarId)}`,
      {
        method: "GET",
        query: {
          Fields: Array.isArray(fields) ? fields.join(",") : fields,
          Purchase: opts.purchase ?? 0,
        },
      }
    );
    if ("results" in res && Array.isArray(res.results)) {
      const first = res.results[0];
      if (!first) throw new Error(`No property found for RadarID ${radarId}`);
      return first;
    }
    return res as PropertyRadarRecord;
  }

  /** GET /v1/properties/{RadarID}/persons — owner contact records. */
  async getPersons(
    radarId: string,
    opts: { purchase?: 0 | 1; fields?: string } = {}
  ): Promise<PersonRecord[]> {
    const res = await this.request<{ results: PersonRecord[] }>(
      `/v1/properties/${encodeURIComponent(radarId)}/persons`,
      {
        method: "GET",
        query: { Fields: opts.fields ?? "default", Purchase: opts.purchase ?? 0 },
      }
    );
    return res.results ?? [];
  }

  /** GET /v1/properties/{RadarID}/transactions — transfer/loan history. */
  async getTransactions(
    radarId: string,
    opts: { purchase?: 0 | 1 } = {}
  ): Promise<unknown[]> {
    const res = await this.request<{ results: unknown[] }>(
      `/v1/properties/${encodeURIComponent(radarId)}/transactions`,
      { method: "GET", query: { Purchase: opts.purchase ?? 0 } }
    );
    return res.results ?? [];
  }

  /** GET /v1/properties/{RadarID}/comps/sales — comparable sales. */
  async getComps(
    radarId: string,
    opts: { purchase?: 0 | 1; type?: "sales" | "forsale" } = {}
  ): Promise<unknown[]> {
    const type = opts.type ?? "sales";
    const res = await this.request<{ results: unknown[] }>(
      `/v1/properties/${encodeURIComponent(radarId)}/comps/${type}`,
      { method: "GET", query: { Purchase: opts.purchase ?? 0 } }
    );
    return res.results ?? [];
  }

  /** GET /v1/lists — enumerate saved lists. */
  async lists(): Promise<ListsResponse> {
    return this.request<ListsResponse>("/v1/lists", { method: "GET" });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}
