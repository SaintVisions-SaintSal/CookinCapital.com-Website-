/**
 * Deal Analyzer resolution.
 *
 * Resolution order, cheapest first:
 *   1. Public RentCast corpus (already fetched in bulk — zero API calls)
 *   2. Live RentCast lookup (flat-rate subscription — no PropertyRadar credits)
 * The internal PropertyRadar branch is attached only when the address is
 * already in the scored pipeline; it is never fetched on demand, because a
 * PropertyRadar property pull spends export credits.
 */

import type {
  AnalyzerInternal,
  AnalyzerResult,
  InvestmentMetrics,
  LeadDTO,
  MarketTrendDTO,
  PropertyDTO,
} from "@shared/schema";
import { computeMetrics } from "./metrics";
import { RentCastClient } from "./rentcast";
import { findPropertyByAddress, getTrend, propertyToDTO, storage } from "./store";

function bandPct(avm: number | null, lo: number | null, hi: number | null): number | null {
  if (!avm || avm <= 0 || lo === null || hi === null) return null;
  return (hi - lo) / avm;
}

function trendFor(zip: string | null | undefined): MarketTrendDTO | null {
  return zip ? getTrend(zip) ?? null : null;
}

function internalBranch(lead: LeadDTO | null, rentcastAvm: number | null): AnalyzerInternal | null {
  if (!lead) return null;
  const prAvm = lead.avm;
  const delta =
    prAvm && rentcastAvm && prAvm > 0 ? (rentcastAvm - prAvm) / prAvm : null;
  return {
    radarId: lead.radarId,
    propertyRadarAvm: prAvm,
    equityPercent: lead.equityPercent,
    availableEquity: lead.availableEquity,
    totalLoanBalance: lead.totalLoanBalance,
    ltv: lead.enriched?.ltv ?? null,
    foreclosureStage: lead.foreclosureStage,
    signals: lead.signals,
    score: lead.breakdown ?? null,
    lead,
    avmDeltaPct: delta,
    avmDeltaWarning: delta !== null && Math.abs(delta) > 0.15,
  };
}

export async function analyzeAddress(
  address: string,
  rc: () => RentCastClient
): Promise<AnalyzerResult> {
  const notes: string[] = [];

  // The internal pipeline record, if we already own this property.
  const lead = (await storage.findLeadByAddress(address)) ?? null;

  // ── Public branch: corpus first ──
  let property: PropertyDTO | null = findPropertyByAddress(address) ?? null;
  let source: AnalyzerResult["source"] = property ? "corpus" : "live";

  let avm = property?.rentcastAvm ?? null;
  let avmLow = property?.rentcastAvmLow ?? null;
  let avmHigh = property?.rentcastAvmHigh ?? null;
  let rent = property?.rentcastRent ?? null;
  let rentLow = property?.rentcastRentLow ?? null;
  let rentHigh = property?.rentcastRentHigh ?? null;
  let annualTaxes = property?.annualPropertyTax ?? null;
  let resolvedAddress = property?.formattedAddress ?? address;
  let zip = property?.zipCode ?? null;

  if (property) {
    notes.push(
      `Resolved from the RentCast Orange County corpus — ${property.formattedAddress}. Corpus records are bulk-licensed and distributable, so this analysis spent no export credits.`
    );
  }

  // Corpus hit but unvalued, or no corpus hit at all → live RentCast.
  if (!property || avm === null) {
    const client = rc();
    const query = property?.formattedAddress ?? address;
    const [valueAvm, rentAvm, live] = await Promise.all([
      client.valueAvm(query).catch(() => null),
      client.rentAvm(query).catch(() => null),
      property ? Promise.resolve(null) : client.property(query).catch(() => null),
    ]);

    if (!valueAvm && !rentAvm && !live && !property) {
      throw Object.assign(
        new Error(
          "Neither the corpus nor a live RentCast lookup could resolve that address. Use the format: street, city, state."
        ),
        { status: 404, kind: "not_found" }
      );
    }

    avm = valueAvm?.price ?? avm;
    avmLow = valueAvm?.priceRangeLow ?? avmLow;
    avmHigh = valueAvm?.priceRangeHigh ?? avmHigh;
    rent = rentAvm?.rent ?? rent;
    rentLow = rentAvm?.rentRangeLow ?? rentLow;
    rentHigh = rentAvm?.rentRangeHigh ?? rentHigh;

    if (live) {
      resolvedAddress = (live.formattedAddress as string) ?? resolvedAddress;
      zip = (live.zipCode as string) ?? zip;
      annualTaxes = latestTaxTotal(live.propertyTaxes) ?? annualTaxes;
      const assessment = latestAssessment(live.taxAssessments);
      property = propertyToDTO({
        rcId: (live.id as string) ?? `live:${resolvedAddress}`,
        formattedAddress: resolvedAddress,
        addressLine1: (live.addressLine1 as string) ?? null,
        city: (live.city as string) ?? null,
        state: (live.state as string) ?? null,
        zipCode: zip,
        county: (live.county as string) ?? null,
        latitude: (live.latitude as number) ?? null,
        longitude: (live.longitude as number) ?? null,
        propertyType: (live.propertyType as string) ?? null,
        bedrooms: (live.bedrooms as number) ?? null,
        bathrooms: (live.bathrooms as number) ?? null,
        squareFootage: (live.squareFootage as number) ?? null,
        lotSize: (live.lotSize as number) ?? null,
        yearBuilt: (live.yearBuilt as number) ?? null,
        assessorId: (live.assessorID as string) ?? null,
        legalDescription: (live.legalDescription as string) ?? null,
        subdivision: (live.subdivision as string) ?? null,
        ownerType: ((live.owner as Record<string, unknown>)?.type as string) ?? null,
        ownerOccupied:
          live.ownerOccupied === undefined || live.ownerOccupied === null
            ? null
            : live.ownerOccupied
              ? 1
              : 0,
        ownerMailingCity: null,
        ownerMailingState: null,
        outOfStateOwner: null,
        taxAssessmentYear: assessment?.year ?? null,
        taxAssessedValue: assessment?.value ?? null,
        taxAssessedLand: assessment?.land ?? null,
        taxAssessedImprovements: assessment?.improvements ?? null,
        annualPropertyTax: annualTaxes,
        taxHistoryJson: null,
        rentcastAvm: avm,
        rentcastAvmLow: avmLow,
        rentcastAvmHigh: avmHigh,
        rentcastRent: rent,
        rentcastRentLow: rentLow,
        rentcastRentHigh: rentHigh,
        valuedAt: new Date().toISOString(),
        featuresJson: null,
      } as never);
      source = "live";
      notes.push(
        "Live RentCast lookup. RentCast is a flat-rate subscription, so this cost no PropertyRadar export credits."
      );
    } else if (property) {
      property = { ...property, rentcastAvm: avm, rentcastRent: rent };
      notes.push("Corpus record had no stored valuation — value and rent AVMs were fetched live.");
    }
  }

  if (lead) {
    source = "pipeline";
    notes.push(
      "This property is in the internal scored pipeline, so PropertyRadar equity and distress intelligence is available in the operator panel below."
    );
  } else {
    notes.push(
      "Not in the internal pipeline — no PropertyRadar equity, lien or distress data has been purchased for this address. Draw it from the Distress Screener to score it."
    );
  }

  const trend = trendFor(zip);

  const metrics: InvestmentMetrics = computeMetrics({
    // The public metrics panel is computed from the RentCast valuation only,
    // so it can be shown to investors without leaking PropertyRadar values.
    avm: null,
    rentcastAvm: avm,
    rentcastRent: rent,
    annualTaxes,
  });

  return {
    address: resolvedAddress,
    source,
    public: {
      address: resolvedAddress,
      property,
      rentcastAvm: avm,
      rentcastAvmLow: avmLow,
      rentcastAvmHigh: avmHigh,
      rentcastRent: rent,
      rentcastRentLow: rentLow,
      rentcastRentHigh: rentHigh,
      confidenceBandPct: bandPct(avm, avmLow, avmHigh),
      zipMedianSalePrice: trend?.medianPrice ?? null,
      zipMedianRent: trend?.medianRent ?? null,
      trend,
      characteristics: {
        beds: property?.bedrooms ?? null,
        baths: property?.bathrooms ?? null,
        sqft: property?.squareFootage ?? null,
        yearBuilt: property?.yearBuilt ?? null,
        propertyType: property?.propertyType ?? null,
        lotSize: property?.lotSize ?? null,
        annualTaxes,
        assessedValue: property?.taxAssessedValue ?? null,
        ownerType: property?.ownerType ?? null,
        ownerOccupied: property?.ownerOccupied ?? null,
        city: property?.city ?? null,
        state: property?.state ?? null,
        zip,
      },
    },
    metrics,
    internal: internalBranch(lead, avm),
    notes,
  };
}

function latestTaxTotal(propertyTaxes: unknown): number | null {
  const rows = sortedYears(propertyTaxes);
  const t = rows[0]?.total;
  return typeof t === "number" ? t : null;
}

function latestAssessment(
  taxAssessments: unknown
): { year: number; value: number | null; land: number | null; improvements: number | null } | null {
  const rows = sortedYears(taxAssessments);
  const a = rows[0];
  if (!a) return null;
  return {
    year: Number(a.year),
    value: typeof a.value === "number" ? a.value : null,
    land: typeof a.land === "number" ? a.land : null,
    improvements: typeof a.improvements === "number" ? a.improvements : null,
  };
}

function sortedYears(obj: unknown): Array<Record<string, unknown>> {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj as Record<string, Record<string, unknown>>)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([, v]) => v);
}
