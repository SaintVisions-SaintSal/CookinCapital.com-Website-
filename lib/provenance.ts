/**
 * ═══════════════════════════════════════════════════════════════════
 * DATA PROVENANCE — licence-driven field separation
 * ═══════════════════════════════════════════════════════════════════
 *
 * Two upstream data licences, two very different permissions:
 *
 *   • RentCast — the API licence expressly permits "sublicensure,
 *     disclosure, display, resale and distribution of the API Data to third
 *     parties". RentCast-sourced fields may therefore be rendered to
 *     investor-users, exported, and syndicated.
 *
 *   • PropertyRadar — the User Agreement expressly FORBIDS displaying its
 *     data to any third party. PropertyRadar-sourced fields may only ever
 *     be rendered inside internal CookinCapital operator views.
 *
 * Rather than rely on developer discipline, provenance is encoded in the
 * type system and enforced at runtime by `assertPublicSafe`, which throws in
 * development the moment a `propertyradar`-tagged field reaches a component
 * declared public.
 */

export type DataSource = "rentcast" | "propertyradar" | "derived";

/** Audience a component renders to. */
export type Audience = "public" | "internal";

/** A single value carrying its provenance. */
export interface Sourced<T> {
  value: T;
  source: DataSource;
}

export function sourced<T>(value: T, source: DataSource): Sourced<T> {
  return { value, source };
}

/**
 * Field-level provenance registry. Every field name the app can render is
 * declared here exactly once. Anything unregistered is treated as
 * `propertyradar` — fail closed, never fail open.
 */
export const FIELD_SOURCE: Readonly<Record<string, DataSource>> = {
  // ── RentCast: publicly displayable ──
  rcId: "rentcast",
  formattedAddress: "rentcast",
  addressLine1: "rentcast",
  addressLine2: "rentcast",
  city: "rentcast",
  state: "rentcast",
  zipCode: "rentcast",
  county: "rentcast",
  latitude: "rentcast",
  longitude: "rentcast",
  propertyType: "rentcast",
  bedrooms: "rentcast",
  bathrooms: "rentcast",
  squareFootage: "rentcast",
  lotSize: "rentcast",
  yearBuilt: "rentcast",
  assessorID: "rentcast",
  legalDescription: "rentcast",
  subdivision: "rentcast",
  zoning: "rentcast",
  lastSaleDate: "rentcast",
  lastSalePrice: "rentcast",
  ownerType: "rentcast",
  ownerOccupied: "rentcast",
  ownerMailingAddress: "rentcast",
  taxAssessmentYear: "rentcast",
  taxAssessedValue: "rentcast",
  taxAssessedLand: "rentcast",
  taxAssessedImprovements: "rentcast",
  annualPropertyTax: "rentcast",
  transactionCount: "rentcast",
  rentcastAvm: "rentcast",
  rentcastAvmLow: "rentcast",
  rentcastAvmHigh: "rentcast",
  rentcastRent: "rentcast",
  rentcastRentLow: "rentcast",
  rentcastRentHigh: "rentcast",
  zipMedianSalePrice: "rentcast",
  zipMedianRent: "rentcast",
  marketTrend: "rentcast",
  saleListingStatus: "rentcast",
  daysOnMarket: "rentcast",
  listPrice: "rentcast",

  // ── PropertyRadar: INTERNAL ONLY. Never render to a third party. ──
  radarId: "propertyradar",
  avm: "propertyradar",
  propertyRadarAvm: "propertyradar",
  equityPercent: "propertyradar",
  availableEquity: "propertyradar",
  totalLoanBalance: "propertyradar",
  foreclosureStage: "propertyradar",
  foreclosureRecDate: "propertyradar",
  nodDate: "propertyradar",
  auctionDate: "propertyradar",
  openingBid: "propertyradar",
  delinquentAmount: "propertyradar",
  isDeceased: "propertyradar",
  inProbateProperty: "propertyradar",
  inDivorce: "propertyradar",
  inBankruptcy: "propertyradar",
  inTaxDelinquency: "propertyradar",
  propertyHasOpenLiens: "propertyradar",
  isSiteVacant: "propertyradar",
  isMailVacant: "propertyradar",
  likelyListingScore: "propertyradar",
  ownerName: "propertyradar",
  ownerPhone: "propertyradar",
  ownerEmail: "propertyradar",
  signals: "propertyradar",
  screenCount: "propertyradar",

  // ── Derived by CookinCapital: our own work product ──
  score: "derived",
  tier: "derived",
  breakdown: "derived",
  reasons: "derived",
  capRate: "derived",
  cashOnCash: "derived",
  dcr: "derived",
  equityMultiple: "derived",
  breakEvenOccupancy: "derived",
  grm: "derived",
  irrBear: "derived",
  irrBase: "derived",
  irrBull: "derived",
  rentToValue: "derived",
  ltv: "derived",
  arvSpreadEstimate: "derived",
  avmDeltaPct: "derived",
  confidenceBandPct: "derived",
  estimatedEquityDollars: "derived",
  complianceStatus: "derived",
};

export function sourceOf(field: string): DataSource {
  return FIELD_SOURCE[field] ?? "propertyradar";
}

/** Fields an investor-facing (public) component is permitted to render. */
export function isPublicSafe(field: string): boolean {
  return sourceOf(field) !== "propertyradar";
}

export class ProvenanceViolationError extends Error {
  constructor(
    public readonly field: string,
    public readonly component: string
  ) {
    super(
      `Data provenance violation: field "${field}" is PropertyRadar-sourced and cannot be rendered by "${component}", which is declared public. ` +
        `PropertyRadar's User Agreement forbids display of its data to third parties — move this field into an internal operator view, or render the RentCast equivalent instead.`
    );
    this.name = "ProvenanceViolationError";
  }
}

/**
 * Runtime render guard. Throws in development the instant a
 * PropertyRadar-tagged field reaches a component declared public. In
 * production it degrades to a console error and redacts the value rather
 * than white-screening a live investor demo.
 */
export function assertPublicSafe(
  fields: string[],
  component: string,
  audience: Audience = "public"
): void {
  if (audience === "internal") return;
  const offenders = fields.filter((f) => !isPublicSafe(f));
  if (offenders.length === 0) return;
  const err = new ProvenanceViolationError(offenders.join(", "), component);
  if (isDev()) throw err;
  // eslint-disable-next-line no-console
  console.error(err.message);
}

function isDev(): boolean {
  try {
    // Vite replaces import.meta.env at build time on the client.
    const meta = import.meta as unknown as { env?: { DEV?: boolean } };
    if (typeof meta?.env?.DEV === "boolean") return meta.env.DEV;
  } catch {
    /* not a module environment */
  }
  return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
}

/**
 * Strips every PropertyRadar-sourced key out of an object before it crosses
 * into a public component. Recurses one level into plain objects.
 */
export function redactForPublic<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!isPublicSafe(k)) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

export const LICENCE_NOTE = {
  rentcast:
    "RentCast API licence permits sublicensure, disclosure, display, resale and distribution of API data to third parties.",
  propertyradar:
    "PropertyRadar User Agreement forbids display of its data to any third party. Internal operator use only.",
  derived:
    "CookinCapital work product — derived by the HACP™ scoring model from licensed inputs.",
} as const;
