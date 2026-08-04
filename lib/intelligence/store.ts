/**
 * ═══════════════════════════════════════════════════════════════════
 * INTELLIGENCE STORE — server only
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ported from cookincapital-app/server/storage.ts. The SQLite/Drizzle layer
 * has been replaced by an in-process store over the licensable RentCast
 * corpus (2,400 Orange County records, 869 valued) plus the precomputed
 * scored-lead seed. Nothing here spends an API credit and nothing here
 * requires a database, so `/properties/search` is never empty and never
 * costs money to browse.
 *
 * Supabase persistence for the lead pipeline is the next step — see
 * MIGRATION-NOTES.md §Outstanding. The query/DTO logic below is the piece
 * that ports directly to Postgres (`queryMarket` → WHERE + GROUP BY).
 *
 * PROVENANCE: every field in `PropertyDTO` is RentCast-sourced or derived.
 * `LeadDTO` carries PropertyRadar-sourced fields and must only ever be
 * serialized to an authenticated operator route.
 */

import corpusJson from "./data/rentcast-corpus.json";
import { SEED_COUNTS, SEED_LEADS } from "./data/seed";
import type {
  Lead,
  LeadDTO,
  MarketTrendDTO,
  Property,
  PropertyDTO,
  ScoreBreakdownDTO,
  ScreenCount,
  Tier,
  TrendPoint,
} from "./schema";

// ═══════════════════════════════════════════════════════════════════
// Signals + lead DTO
// ═══════════════════════════════════════════════════════════════════

/** Distress + contactability signal chips derived from the raw record. */
export function deriveSignals(
  raw: Record<string, unknown>,
  foreclosureStage: string | null,
): string[] {
  const out: string[] = [];
  const on = (k: string) => raw[k] === 1 || raw[k] === true;
  if (foreclosureStage) out.push(foreclosureStage);
  else if (on("isPreforeclosure")) out.push("Preforeclosure");
  if (on("isAuction")) out.push("Auction");
  if (on("isBankOwned")) out.push("Bank owned");
  if (on("isSiteVacant")) out.push("Site vacant");
  if (on("isMailVacant")) out.push("Mail vacant");
  if (on("isDeceased")) out.push("Deceased");
  if (on("inProbateProperty")) out.push("Probate");
  if (on("inDivorce")) out.push("Divorce");
  if (on("inBankruptcy")) out.push("Bankruptcy");
  if (on("inTaxDelinquency")) out.push("Tax delinquent");
  if (on("hasRecentEviction")) out.push("Eviction");
  if (typeof raw.DelinquentAmount === "number" && (raw.DelinquentAmount as number) > 0)
    out.push("Delinquent balance");
  if (on("isListedForSale")) out.push("Listed");
  if (raw.ListingStatus === "Expired" || raw.ListingStatus === "Withdrawn")
    out.push(`Listing ${String(raw.ListingStatus).toLowerCase()}`);
  if (raw.isSameMailingOrExempt === 0) out.push("Absentee");
  if (on("hasOwnerPhone") || raw.PhoneAvailability === "available") out.push("Phone");
  if (on("hasOwnerEmail") || raw.EmailAvailability === "available") out.push("Email");
  return Array.from(new Set(out));
}

export function toDTO(row: Lead): LeadDTO {
  const enriched = JSON.parse(row.enrichedJson);
  const breakdown = JSON.parse(row.breakdownJson) as ScoreBreakdownDTO;
  return {
    radarId: row.radarId,
    screenKey: row.screenKey,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    avm: row.avm,
    equityPercent: row.equityPercent,
    availableEquity: row.availableEquity,
    totalLoanBalance: row.totalLoanBalance,
    foreclosureStage: row.foreclosureStage,
    score: row.score,
    tier: row.tier as Tier,
    reasons: JSON.parse(row.reasonsJson),
    breakdown,
    enriched,
    approvedForOutreach: row.approvedForOutreach === 1,
    signals: deriveSignals(enriched?.raw ?? {}, row.foreclosureStage),
  };
}

// ═══════════════════════════════════════════════════════════════════
// Lead pipeline (seed-backed, process-local)
// ═══════════════════════════════════════════════════════════════════

const leadRows = new Map<string, Lead>();
let seeded = false;

function seed(): void {
  if (seeded) return;
  seeded = true;
  for (const l of SEED_LEADS as ReadonlyArray<Record<string, any>>) {
    if (!l?.radarId) continue;
    leadRows.set(String(l.radarId), {
      radarId: String(l.radarId),
      screenKey: l.screenKey ?? "seed",
      address: l.address ?? null,
      city: l.city ?? null,
      state: l.state ?? null,
      zip: l.zip ?? null,
      avm: l.avm ?? null,
      equityPercent: l.equityPercent ?? null,
      availableEquity: l.availableEquity ?? null,
      totalLoanBalance: l.totalLoanBalance ?? null,
      foreclosureStage: l.foreclosureStage ?? null,
      score: l.score ?? 0,
      tier: l.tier ?? "COLD",
      reasonsJson: JSON.stringify(l.reasons ?? []),
      breakdownJson: JSON.stringify(l.breakdown ?? {}),
      enrichedJson: JSON.stringify(l.enriched ?? {}),
      approvedForOutreach: 0,
    });
  }
}

function normalizeAddress(s: string): string {
  return s.toUpperCase().replace(/[.,#]/g, " ").replace(/\s+/g, " ").trim();
}

export const storage = {
  async listScreenCounts(): Promise<ScreenCount[]> {
    return (SEED_COUNTS as ReadonlyArray<Record<string, unknown>>).map((c) => ({
      screenKey: c.screenKey as string,
      title: c.title as string,
      county: c.county as number,
      totalResultCount: c.totalResultCount as number,
    }));
  },

  async listLeads(): Promise<LeadDTO[]> {
    seed();
    return Array.from(leadRows.values())
      .sort((a, b) => b.score - a.score)
      .map(toDTO);
  },

  async getLead(radarId: string): Promise<LeadDTO | undefined> {
    seed();
    const row = leadRows.get(radarId);
    return row ? toDTO(row) : undefined;
  },

  async findLeadByAddress(address: string): Promise<LeadDTO | undefined> {
    seed();
    const needle = normalizeAddress(address);
    if (needle.length < 4) return undefined;
    for (const row of leadRows.values()) {
      if (row.address && normalizeAddress(row.address).includes(needle)) return toDTO(row);
    }
    return undefined;
  },

  async upsertLeads(rows: Array<Omit<Lead, "approvedForOutreach">>): Promise<LeadDTO[]> {
    seed();
    const out: LeadDTO[] = [];
    for (const r of rows) {
      const existing = leadRows.get(r.radarId);
      const merged: Lead = { ...r, approvedForOutreach: existing?.approvedForOutreach ?? 0 };
      leadRows.set(r.radarId, merged);
      out.push(toDTO(merged));
    }
    return out;
  },

  async setApproval(radarId: string, approved: boolean): Promise<LeadDTO | undefined> {
    seed();
    const row = leadRows.get(radarId);
    if (!row) return undefined;
    row.approvedForOutreach = approved ? 1 : 0;
    return toDTO(row);
  },
};

// ═══════════════════════════════════════════════════════════════════
// PUBLIC CORPUS (RentCast) — in-memory query layer
// ═══════════════════════════════════════════════════════════════════

/** Derived metrics attached to a public property card. All "derived" source. */
export function propertyToDTO(r: Property): PropertyDTO {
  const value = r.rentcastAvm;
  const rent = r.rentcastRent;
  const annualRent = rent ? rent * 12 : null;
  const taxes = r.annualPropertyTax ?? (value ? value * 0.0125 : null);
  const noi =
    annualRent && value
      ? annualRent * 0.95 - (taxes ?? 0) - value * 0.0035 - annualRent * 0.08
      : null;
  const capRate = noi && value ? noi / value : null;
  const grm = value && annualRent ? value / annualRent : null;
  const rentToValue = value && rent ? rent / value : null;
  const pricePerSqft = value && r.squareFootage ? value / r.squareFootage : null;
  const assessedToAvm = value && r.taxAssessedValue ? r.taxAssessedValue / value : null;

  let yieldScore: number | null = null;
  if (capRate !== null && rentToValue !== null) {
    const capPts = Math.max(0, Math.min(50, (capRate / 0.06) * 50));
    const rtvPts = Math.max(0, Math.min(30, (rentToValue / 0.006) * 30));
    const gapPts =
      assessedToAvm !== null ? Math.max(0, Math.min(20, (1 - assessedToAvm) * 40)) : 0;
    yieldScore = Math.round((capPts + rtvPts + gapPts) * 10) / 10;
  }

  return {
    rcId: r.rcId,
    formattedAddress: r.formattedAddress,
    addressLine1: r.addressLine1,
    city: r.city,
    state: r.state,
    zipCode: r.zipCode,
    county: r.county,
    latitude: r.latitude,
    longitude: r.longitude,
    propertyType: r.propertyType,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    squareFootage: r.squareFootage,
    lotSize: r.lotSize,
    yearBuilt: r.yearBuilt,
    assessorID: r.assessorId,
    ownerType: r.ownerType,
    ownerOccupied: r.ownerOccupied === null ? null : r.ownerOccupied === 1,
    outOfStateOwner: r.outOfStateOwner === null ? null : r.outOfStateOwner === 1,
    taxAssessedValue: r.taxAssessedValue,
    taxAssessmentYear: r.taxAssessmentYear,
    annualPropertyTax: r.annualPropertyTax,
    rentcastAvm: r.rentcastAvm,
    rentcastAvmLow: r.rentcastAvmLow,
    rentcastAvmHigh: r.rentcastAvmHigh,
    rentcastRent: r.rentcastRent,
    rentcastRentLow: r.rentcastRentLow,
    rentcastRentHigh: r.rentcastRentHigh,
    capRate,
    grm,
    rentToValue,
    pricePerSqft,
    assessedToAvm,
    yieldScore,
  };
}

export interface MarketFilters {
  cities: string[];
  zips: string[];
  propertyTypes: string[];
  valueMin: number | null;
  valueMax: number | null;
  rentMin: number | null;
  bedsMin: number | null;
  sqftMin: number | null;
  yearBuiltMax: number | null;
  ownerOccupied: "any" | "yes" | "no";
  ownerType: string[];
  outOfStateOwner: boolean;
  valuedOnly: boolean;
  sort: "yield" | "value_desc" | "value_asc" | "rent_desc" | "cap_desc" | "sqft_desc";
  limit: number;
  offset: number;
}

export const DEFAULT_MARKET_FILTERS: MarketFilters = {
  cities: [],
  zips: [],
  propertyTypes: [],
  valueMin: null,
  valueMax: null,
  rentMin: null,
  bedsMin: null,
  sqftMin: null,
  yearBuiltMax: null,
  ownerOccupied: "any",
  ownerType: [],
  outOfStateOwner: false,
  valuedOnly: true,
  sort: "yield",
  limit: 50,
  offset: 0,
};

type CorpusFile = {
  properties: Array<Record<string, any>>;
  trends: Record<string, any>;
};

let corpusRows: Property[] | null = null;
let trendRows: Map<string, MarketTrendDTO> | null = null;

function mapCorpusRow(p: Record<string, any>): Property {
  const assessments = p.taxAssessments ?? {};
  const years = Object.keys(assessments).sort();
  const latest = years.length ? assessments[years[years.length - 1]!] : null;
  const taxes = p.propertyTaxes ?? {};
  const taxYears = Object.keys(taxes).sort();
  const latestTax = taxYears.length ? taxes[taxYears[taxYears.length - 1]!] : null;
  const mailing = p.owner?.mailingAddress ?? null;
  const avm = p.avm ?? null;
  return {
    rcId: p.id,
    formattedAddress: p.formattedAddress,
    addressLine1: p.addressLine1 ?? null,
    city: p.city ?? null,
    state: p.state ?? null,
    zipCode: p.zipCode ?? null,
    county: p.county ?? null,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    propertyType: p.propertyType ?? null,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    squareFootage: p.squareFootage ?? null,
    lotSize: p.lotSize ?? null,
    yearBuilt: p.yearBuilt ?? null,
    assessorId: p.assessorID ?? null,
    legalDescription: p.legalDescription ?? null,
    subdivision: p.subdivision ?? null,
    ownerType: p.owner?.type ?? null,
    ownerOccupied: p.ownerOccupied === undefined ? null : p.ownerOccupied ? 1 : 0,
    ownerMailingCity: mailing?.city ?? null,
    ownerMailingState: mailing?.state ?? null,
    outOfStateOwner:
      mailing?.state && p.state ? (mailing.state !== p.state ? 1 : 0) : null,
    taxAssessmentYear: latest?.year ?? null,
    taxAssessedValue: latest?.value ?? null,
    taxAssessedLand: latest?.land ?? null,
    taxAssessedImprovements: latest?.improvements ?? null,
    annualPropertyTax: latestTax?.total ?? null,
    taxHistoryJson: JSON.stringify({ assessments, taxes }),
    rentcastAvm: avm?.price ?? null,
    rentcastAvmLow: avm?.priceRangeLow ?? null,
    rentcastAvmHigh: avm?.priceRangeHigh ?? null,
    rentcastRent: avm?.rent ?? null,
    rentcastRentLow: avm?.rentRangeLow ?? null,
    rentcastRentHigh: avm?.rentRangeHigh ?? null,
    valuedAt: avm?.valuedAt ?? null,
    featuresJson: p.features ? JSON.stringify(p.features) : null,
  };
}

function pctChange(series: TrendPoint[], key: keyof TrendPoint): number | null {
  const vals = series.map((p) => p[key]).filter((v): v is number => typeof v === "number");
  if (vals.length < 2) return null;
  const first = vals[0]!;
  const last = vals[vals.length - 1]!;
  return first > 0 ? (last - first) / first : null;
}

function corpus(): Property[] {
  if (corpusRows) return corpusRows;
  const file = corpusJson as unknown as CorpusFile;
  corpusRows = (file.properties ?? []).map(mapCorpusRow);
  return corpusRows;
}

function trends(): Map<string, MarketTrendDTO> {
  if (trendRows) return trendRows;
  const file = corpusJson as unknown as CorpusFile;
  trendRows = new Map();
  for (const [zip, t] of Object.entries<any>(file.trends ?? {})) {
    const saleHistory = (t.saleHistory ?? []) as TrendPoint[];
    const rentHistory = (t.rentHistory ?? []) as TrendPoint[];
    trendRows.set(zip, {
      zipCode: zip,
      medianPrice: t.medianPrice ?? null,
      medianRent: t.medianRent ?? null,
      medianPricePerSquareFoot: t.medianPricePerSquareFoot ?? null,
      medianDaysOnMarket: t.medianDaysOnMarket ?? null,
      newListings: t.newListings ?? null,
      totalListings: t.totalListings ?? null,
      saleHistory,
      rentHistory,
      priceChange12moPct: pctChange(saleHistory, "medianPrice"),
      rentChange12moPct: pctChange(rentHistory, "medianRent"),
    });
  }
  return trendRows;
}

function matches(r: Property, f: MarketFilters): boolean {
  const inSet = (vals: string[], v: string | null) => !vals.length || (v !== null && vals.includes(v));
  if (!inSet(f.cities, r.city)) return false;
  if (!inSet(f.zips, r.zipCode)) return false;
  if (!inSet(f.propertyTypes, r.propertyType)) return false;
  if (!inSet(f.ownerType, r.ownerType)) return false;
  if (f.valuedOnly && r.rentcastAvm === null) return false;
  if (f.valueMin !== null && !(r.rentcastAvm !== null && r.rentcastAvm >= f.valueMin)) return false;
  if (f.valueMax !== null && !(r.rentcastAvm !== null && r.rentcastAvm <= f.valueMax)) return false;
  if (f.rentMin !== null && !(r.rentcastRent !== null && r.rentcastRent >= f.rentMin)) return false;
  if (f.bedsMin !== null && !(r.bedrooms !== null && r.bedrooms >= f.bedsMin)) return false;
  if (f.sqftMin !== null && !(r.squareFootage !== null && r.squareFootage >= f.sqftMin)) return false;
  if (f.yearBuiltMax !== null && !(r.yearBuilt !== null && r.yearBuilt <= f.yearBuiltMax))
    return false;
  if (f.ownerOccupied === "yes" && r.ownerOccupied !== 1) return false;
  if (f.ownerOccupied === "no" && r.ownerOccupied !== 0) return false;
  if (f.outOfStateOwner && r.outOfStateOwner !== 1) return false;
  return true;
}

const SORT_KEY: Record<MarketFilters["sort"], (r: Property) => number | null> = {
  yield: (r) => (r.rentcastAvm && r.rentcastRent ? (r.rentcastRent * 12) / r.rentcastAvm : null),
  value_desc: (r) => r.rentcastAvm,
  value_asc: (r) => (r.rentcastAvm === null ? null : -r.rentcastAvm),
  rent_desc: (r) => r.rentcastRent,
  cap_desc: (r) =>
    r.rentcastAvm && r.rentcastRent
      ? (r.rentcastRent * 12 * 0.87 - (r.annualPropertyTax ?? 0)) / r.rentcastAvm
      : null,
  sqft_desc: (r) => r.squareFootage,
};

export function queryMarket(f: MarketFilters) {
  const hits = corpus().filter((r) => matches(r, f));
  const key = SORT_KEY[f.sort] ?? SORT_KEY.yield;
  // NULLS LAST, descending on the sort key.
  const sorted = hits.slice().sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return bv - av;
  });
  return {
    total: hits.length,
    rows: sorted.slice(f.offset, f.offset + f.limit).map(propertyToDTO),
  };
}

export function marketFacets() {
  const facet = (pick: (r: Property) => string | null) => {
    const counts = new Map<string, number>();
    for (const r of corpus()) {
      const v = pick(r);
      if (v === null || v === undefined) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return Array.from(counts, ([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
  };
  return {
    cities: facet((r) => r.city),
    propertyTypes: facet((r) => r.propertyType),
    zips: facet((r) => r.zipCode),
  };
}

export function corpusStats() {
  const rows = corpus();
  let valued = 0;
  let fetched: string | null = null;
  for (const r of rows) {
    if (r.rentcastAvm !== null) valued += 1;
    if (r.valuedAt && (!fetched || r.valuedAt > fetched)) fetched = r.valuedAt;
  }
  return { properties: rows.length, valued, fetchedAt: fetched };
}

export function getProperty(rcId: string): PropertyDTO | undefined {
  const r = corpus().find((p) => p.rcId === rcId);
  return r ? propertyToDTO(r) : undefined;
}

export function findPropertyByAddress(address: string): PropertyDTO | undefined {
  const needle = normalizeAddress(address);
  if (needle.length < 4) return undefined;
  const hit = corpus().find(
    (p) =>
      (p.formattedAddress && normalizeAddress(p.formattedAddress).includes(needle)) ||
      (p.addressLine1 && normalizeAddress(p.addressLine1).includes(needle)),
  );
  return hit ? propertyToDTO(hit) : undefined;
}

export function getTrend(zip: string): MarketTrendDTO | undefined {
  return trends().get(zip);
}

export function listTrendZips(): string[] {
  return Array.from(trends().keys()).sort();
}
