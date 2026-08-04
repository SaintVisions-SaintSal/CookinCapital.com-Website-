/**
 * Intelligence wire types. Ported from cookincapital-app/shared/schema.ts with
 * the Drizzle/SQLite table definitions replaced by plain row interfaces —
 * production persistence is Supabase/Postgres plus the in-memory RentCast
 * corpus store (see lib/intelligence/store.ts).
 */

export interface ScreenCount {
  screenKey: string;
  title: string;
  county: number;
  totalResultCount: number;
}

export interface Lead {
  radarId: string;
  screenKey: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  avm: number | null;
  equityPercent: number | null;
  availableEquity: number | null;
  totalLoanBalance: number | null;
  foreclosureStage: string | null;
  score: number;
  tier: string;
  reasonsJson: string;
  breakdownJson: string;
  enrichedJson: string;
  approvedForOutreach: number;
}

export interface Property {
  rcId: string;
  formattedAddress: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  lotSize: number | null;
  yearBuilt: number | null;
  assessorId: string | null;
  legalDescription: string | null;
  subdivision: string | null;
  ownerType: string | null;
  ownerOccupied: number | null;
  ownerMailingCity: string | null;
  ownerMailingState: string | null;
  outOfStateOwner: number | null;
  taxAssessmentYear: number | null;
  taxAssessedValue: number | null;
  taxAssessedLand: number | null;
  taxAssessedImprovements: number | null;
  annualPropertyTax: number | null;
  taxHistoryJson: string | null;
  rentcastAvm: number | null;
  rentcastAvmLow: number | null;
  rentcastAvmHigh: number | null;
  rentcastRent: number | null;
  rentcastRentLow: number | null;
  rentcastRentHigh: number | null;
  valuedAt: string | null;
  featuresJson: string | null;
}

export interface MarketTrend {
  zipCode: string;
  medianPrice: number | null;
  medianRent: number | null;
  medianPricePerSquareFoot: number | null;
  medianDaysOnMarket: number | null;
  newListings: number | null;
  totalListings: number | null;
  saleHistoryJson: string;
  rentHistoryJson: string;
}

/**
 * Precomputed free (Purchase=0) screen counts, seeded from the lead engine's
 * out/counts.json so the left rail renders instantly without an API call.
 */


/**
 * Scored pipeline leads. `reasonsJson`, `breakdownJson` and `enrichedJson`
 * are JSON text columns — SQLite has no array/JSON column type.
 */


// ───────────────────────────────────────────────────────────────────
// Wire types shared by client + server (not persisted tables)
// ───────────────────────────────────────────────────────────────────

export type Tier = "HOT" | "WARM" | "NURTURE" | "COLD";

export interface ScoreBreakdownDTO {
  equity: number;
  distress: number;
  dealSpread: number;
  timing: number;
  contactability: number;
  total: number;
  tier: Tier;
  reasons: string[];
  scoreVersion: string;
}

/** A lead as sent to the client — JSON columns already parsed. */
export interface LeadDTO {
  radarId: string;
  screenKey: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  avm: number | null;
  equityPercent: number | null;
  availableEquity: number | null;
  totalLoanBalance: number | null;
  foreclosureStage: string | null;
  score: number;
  tier: Tier;
  reasons: string[];
  breakdown: ScoreBreakdownDTO;
  enriched: EnrichedDTO;
  approvedForOutreach: boolean;
  /** Distress signal chips derived server-side from the raw record. */
  signals: string[];
}

export interface EnrichedDTO {
  radarId: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  avm: number | null;
  totalLoanBalance: number | null;
  equityPercent: number | null;
  availableEquity: number | null;
  foreclosureStage: string | null;
  rentcastAvm: number | null;
  rentcastAvmLow: number | null;
  rentcastAvmHigh: number | null;
  rentcastRent: number | null;
  rentcastRentLow: number | null;
  rentcastRentHigh: number | null;
  zipMedianSalePrice: number | null;
  zipMedianRent: number | null;
  capRate: number | null;
  grossRentMultiplier: number | null;
  rentToValue: number | null;
  estimatedEquityDollars: number | null;
  ltv: number | null;
  arvSpreadEstimate: number | null;
  enrichedAt: string;
  raw: Record<string, unknown>;
}

/** The 7-metric investment panel computed for the Deal Analyzer. */
export interface InvestmentMetrics {
  capRate: number | null;
  cashOnCash: number | null;
  dcr: number | null;
  equityMultiple: number | null;
  breakEvenOccupancy: number | null;
  grm: number | null;
  irrBear: number | null;
  irrBase: number | null;
  irrBull: number | null;
  assumptions: {
    downPaymentPct: number;
    interestRate: number;
    amortYears: number;
    holdYears: number;
    vacancyPct: number;
    opexPct: number;
    closingCostPct: number;
    sellingCostPct: number;
    appreciationBear: number;
    appreciationBase: number;
    appreciationBull: number;
  };
}

/**
 * Deal Analyzer payload, split by data provenance.
 *
 *  • `public`   — RentCast-sourced valuation + market context. Displayable to
 *                 investors, exportable, distributable under RentCast's licence.
 *  • `derived`  — CookinCapital's own metrics. Displayable.
 *  • `internal` — PropertyRadar-sourced. Operator-only. PropertyRadar's User
 *                 Agreement forbids display to third parties, so this branch
 *                 renders exclusively inside views marked internal.
 */
export interface AnalyzerPublic {
  address: string;
  property: PropertyDTO | null;
  rentcastAvm: number | null;
  rentcastAvmLow: number | null;
  rentcastAvmHigh: number | null;
  rentcastRent: number | null;
  rentcastRentLow: number | null;
  rentcastRentHigh: number | null;
  confidenceBandPct: number | null;
  zipMedianSalePrice: number | null;
  zipMedianRent: number | null;
  trend: MarketTrendDTO | null;
  characteristics: {
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    yearBuilt: number | null;
    propertyType: string | null;
    lotSize: number | null;
    annualTaxes: number | null;
    assessedValue: number | null;
    ownerType: string | null;
    ownerOccupied: boolean | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
}

export interface AnalyzerInternal {
  radarId: string | null;
  propertyRadarAvm: number | null;
  equityPercent: number | null;
  availableEquity: number | null;
  totalLoanBalance: number | null;
  ltv: number | null;
  foreclosureStage: string | null;
  signals: string[];
  score: ScoreBreakdownDTO | null;
  lead: LeadDTO | null;
  /** Cross-source AVM reconciliation — internal because one input is PR. */
  avmDeltaPct: number | null;
  avmDeltaWarning: boolean;
}

export interface AnalyzerResult {
  address: string;
  source: "live" | "corpus" | "pipeline";
  public: AnalyzerPublic;
  metrics: InvestmentMetrics;
  internal: AnalyzerInternal | null;
  notes: string[];
}

// ───────────────────────────────────────────────────────────────────
// Compliance gate
// ───────────────────────────────────────────────────────────────────

export interface ComplianceCheck {
  id: string;
  label: string;
  status: "pass" | "fail" | "review";
  detail: string;
  citation: string;
  citationUrl: string;
}

export interface ComplianceGateResult {
  radarId: string;
  address: string | null;
  state: string | null;
  checks: ComplianceCheck[];
  clearedForOutreach: boolean;
  approvedForOutreach: boolean;
  evaluatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC CORPUS — RentCast-sourced only.
//
// RentCast's licence permits display, resale and distribution to third
// parties, so this table is the ONLY property data that investor-facing
// views are allowed to render. Nothing PropertyRadar-sourced may be joined
// into it. See shared/provenance.ts.
// ═══════════════════════════════════════════════════════════════════





/** Public property card. Every field here is RentCast-sourced or derived. */
export interface PropertyDTO {
  rcId: string;
  formattedAddress: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  lotSize: number | null;
  yearBuilt: number | null;
  assessorID: string | null;
  ownerType: string | null;
  ownerOccupied: boolean | null;
  outOfStateOwner: boolean | null;
  taxAssessedValue: number | null;
  taxAssessmentYear: number | null;
  annualPropertyTax: number | null;
  rentcastAvm: number | null;
  rentcastAvmLow: number | null;
  rentcastAvmHigh: number | null;
  rentcastRent: number | null;
  rentcastRentLow: number | null;
  rentcastRentHigh: number | null;
  /** Derived — CookinCapital work product, safe to display. */
  capRate: number | null;
  grm: number | null;
  rentToValue: number | null;
  pricePerSqft: number | null;
  assessedToAvm: number | null;
  yieldScore: number | null;
  /**
   * Data-quality flags on the derived economics. Present so an implausible
   * figure is labelled rather than silently presented as fact — e.g. a
   * manufactured home whose AVM excludes land value will produce a cap rate
   * that no real transaction supports.
   */
  dataFlags: string[];
}

export interface TrendPoint {
  month: string;
  medianPrice?: number | null;
  medianPricePerSquareFoot?: number | null;
  medianDaysOnMarket?: number | null;
  newListings?: number | null;
  totalListings?: number | null;
  medianRent?: number | null;
  medianRentPerSquareFoot?: number | null;
}

export interface MarketTrendDTO {
  zipCode: string;
  medianPrice: number | null;
  medianRent: number | null;
  medianPricePerSquareFoot: number | null;
  medianDaysOnMarket: number | null;
  newListings: number | null;
  totalListings: number | null;
  saleHistory: TrendPoint[];
  rentHistory: TrendPoint[];
  /** Derived 12-month change in median sale price. */
  priceChange12moPct: number | null;
  rentChange12moPct: number | null;
}

export interface MarketQueryResult {
  total: number;
  returned: number;
  rows: PropertyDTO[];
  facets: {
    cities: Array<{ value: string; count: number }>;
    propertyTypes: Array<{ value: string; count: number }>;
    zips: Array<{ value: string; count: number }>;
  };
  corpus: { properties: number; valued: number; fetchedAt: string | null };
}

// ───────────────────────────────────────────────────────────────────
// Screener wire types (internal operator surfaces)
// ───────────────────────────────────────────────────────────────────

/** Preset cohort metadata from GET /api/screens. */
export interface ScreenMeta {
  key: string;
  title: string;
  category: string;
  thesis: string;
  loanProduct: string;
  county: number;
  /** Cached result of a free Purchase=0 count; null until counted. */
  totalResultCount: number | null;
}

/** Response of the FREE Purchase=0 count routes. `creditsSpent` is always 0. */
export interface CountResult {
  totalResultCount: number;
  quantityFreeRemaining: number | null;
  creditsSpent: 0;
  criteria: Array<{ name: string; value: unknown }>;
  countedAt: string;
}

/** Response of the PAID Purchase=1 draw route. */
export interface DrawResult {
  drawn: number;
  creditsSpent: number;
  quantityFreeRemaining: number | null;
  leads: LeadDTO[];
}

/** Account quota snapshot, sourced from a free probe call. */
export interface QuotaResult {
  quantityFreeRemaining: number | null;
  asOf: string;
  live: boolean;
  maxAllowedAcrossLists: number | null;
  error?: string;
}
