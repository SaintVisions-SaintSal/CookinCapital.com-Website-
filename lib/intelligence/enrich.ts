/**
 * Enrichment layer — merges a PropertyRadar record with RentCast value,
 * rent, and zip-market data into a unified EnrichedLead, computing
 * derived investment metrics (cap rate, GRM, rent-to-value, estimated
 * equity dollars, LTV, ARV-spread estimate).
 */

import type { PropertyRadarRecord } from "./propertyradar";
import type {
  RentCastClient,
  RentCastMarketResponse,
  RentCastRentAvmResponse,
  RentCastValueAvmResponse,
} from "./rentcast";

export interface EnrichedLead {
  radarId: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  // PropertyRadar core fields
  avm: number | null;
  totalLoanBalance: number | null;
  equityPercent: number | null;
  availableEquity: number | null;
  foreclosureStage: string | null;

  // RentCast enrichment (nullable — RentCast lookups are best-effort)
  rentcastAvm: number | null;
  rentcastAvmLow: number | null;
  rentcastAvmHigh: number | null;
  rentcastRent: number | null;
  rentcastRentLow: number | null;
  rentcastRentHigh: number | null;
  zipMedianSalePrice: number | null;
  zipMedianRent: number | null;

  // Derived investment metrics
  capRate: number | null; // (annual rent - taxes - est. insurance) / value
  grossRentMultiplier: number | null; // value / annual rent
  rentToValue: number | null; // monthly rent / value
  estimatedEquityDollars: number | null; // AVM - TotalLoanBalance (fallback to AvailableEquity)
  ltv: number | null; // TotalLoanBalance / AVM
  arvSpreadEstimate: number | null; // (best available value estimate) - TotalLoanBalance, using the more conservative of the two AVMs

  enrichedAt: string;
  raw: PropertyRadarRecord;
}

export interface EnrichOptions {
  /** Estimated annual insurance cost used in cap rate calc when not otherwise known. */
  estAnnualInsurance?: number;
  /** Skip RentCast calls entirely (e.g. for count-only / dry runs). */
  skipRentCast?: boolean;
}

function fullAddress(rec: PropertyRadarRecord): string | null {
  const addr = rec.Address as string | undefined;
  const city = rec.City as string | undefined;
  const state = rec.State as string | undefined;
  const zip = rec.ZipFive as string | undefined;
  if (!addr) return null;
  return [addr, city, state, zip].filter(Boolean).join(", ");
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Enriches a single PropertyRadar record with RentCast data. Any RentCast
 * failure (network error, no match found, etc.) is swallowed and the
 * corresponding fields are left null — enrichment is best-effort and must
 * never fail the overall pipeline for one bad address.
 */
export async function enrichLead(
  rec: PropertyRadarRecord,
  rentcast: RentCastClient,
  opts: EnrichOptions = {}
): Promise<EnrichedLead> {
  const address = fullAddress(rec);
  const avm = num(rec.AVM);
  const totalLoanBalance = num(rec.TotalLoanBalance);
  const equityPercent = num(rec.EquityPercent);
  const availableEquity = num(rec.AvailableEquity);
  const annualTaxes = num(rec.AnnualTaxes);
  const zip = (rec.ZipFive as string | undefined) ?? null;

  let valueAvm: RentCastValueAvmResponse | null = null;
  let rentAvm: RentCastRentAvmResponse | null = null;
  let market: RentCastMarketResponse | null = null;

  if (!opts.skipRentCast && address) {
    [valueAvm, rentAvm] = await Promise.all([
      rentcast.valueAvm(address).catch(() => null),
      rentcast.rentAvm(address).catch(() => null),
    ]);
  }
  if (!opts.skipRentCast && zip) {
    market = await rentcast.market(zip).catch(() => null);
  }

  const rentcastAvm = num(valueAvm?.price);
  const rentcastRent = num(rentAvm?.rent);

  const zipMedianSalePrice = extractZipStat(market, "saleData", [
    "medianPrice",
    "averagePrice",
  ]);
  const zipMedianRent = extractZipStat(market, "rentalData", [
    "medianRent",
    "averageRent",
  ]);

  // Prefer PropertyRadar AVM for value math; fall back to RentCast AVM if
  // PropertyRadar's is missing.
  const bestValue = avm ?? rentcastAvm;
  const bestRent = rentcastRent;

  const estAnnualInsurance = opts.estAnnualInsurance ?? (bestValue ? bestValue * 0.0035 : 0);

  let capRate: number | null = null;
  if (bestValue && bestRent) {
    const annualRent = bestRent * 12;
    const noi = annualRent - (annualTaxes ?? 0) - estAnnualInsurance;
    capRate = bestValue > 0 ? noi / bestValue : null;
  }

  let grossRentMultiplier: number | null = null;
  if (bestValue && bestRent) {
    grossRentMultiplier = bestRent > 0 ? bestValue / (bestRent * 12) : null;
  }

  let rentToValue: number | null = null;
  if (bestValue && bestRent) {
    rentToValue = bestValue > 0 ? bestRent / bestValue : null;
  }

  let estimatedEquityDollars: number | null = null;
  if (bestValue !== null && totalLoanBalance !== null) {
    estimatedEquityDollars = bestValue - totalLoanBalance;
  } else if (availableEquity !== null) {
    estimatedEquityDollars = availableEquity;
  }

  let ltv: number | null = null;
  if (bestValue && totalLoanBalance !== null && bestValue > 0) {
    ltv = totalLoanBalance / bestValue;
  }

  // ARV spread: use the more conservative (lower) of the two independent
  // AVMs as an "as-repaired value" proxy against existing debt. This is a
  // simple heuristic pending true post-rehab comps.
  let arvSpreadEstimate: number | null = null;
  const candidateValues = [avm, rentcastAvm].filter((v): v is number => v !== null);
  if (candidateValues.length > 0 && totalLoanBalance !== null) {
    const conservativeValue = Math.min(...candidateValues);
    arvSpreadEstimate = conservativeValue - totalLoanBalance;
  }

  return {
    radarId: rec.RadarID,
    address: rec.Address ?? null,
    city: rec.City ?? null,
    state: rec.State ?? null,
    zip,
    avm,
    totalLoanBalance,
    equityPercent,
    availableEquity,
    foreclosureStage: (rec.ForeclosureStage as string | undefined) ?? null,
    rentcastAvm,
    rentcastAvmLow: num(valueAvm?.priceRangeLow),
    rentcastAvmHigh: num(valueAvm?.priceRangeHigh),
    rentcastRent,
    rentcastRentLow: num(rentAvm?.rentRangeLow),
    rentcastRentHigh: num(rentAvm?.rentRangeHigh),
    zipMedianSalePrice,
    zipMedianRent,
    capRate,
    grossRentMultiplier,
    rentToValue,
    estimatedEquityDollars,
    ltv,
    arvSpreadEstimate,
    enrichedAt: new Date().toISOString(),
    raw: rec,
  };
}

function extractZipStat(
  market: RentCastMarketResponse | null,
  section: "saleData" | "rentalData",
  keys: string[]
): number | null {
  if (!market) return null;
  const data = market[section] as Record<string, unknown> | undefined;
  if (!data) return null;
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

export async function enrichLeads(
  recs: PropertyRadarRecord[],
  rentcast: RentCastClient,
  opts: EnrichOptions = {}
): Promise<EnrichedLead[]> {
  const out: EnrichedLead[] = [];
  for (const rec of recs) {
    out.push(await enrichLead(rec, rentcast, opts));
  }
  return out;
}
