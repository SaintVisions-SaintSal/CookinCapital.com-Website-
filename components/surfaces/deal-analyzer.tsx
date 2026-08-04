"use client"

/**
 * DEAL ANALYZER — the hero surface. Provenance-split by construction.
 *
 * Layout contract:
 *   • Valuation block + characteristics + market trend  → PUBLIC (RentCast)
 *   • 7-metric investment panel + score + reasoning     → DERIVED (ours)
 *   • Equity / lien / foreclosure / dual-AVM delta      → INTERNAL (PropertyRadar)
 *
 * The internal block is rendered by a separate component that callers must opt
 * into with `showInternal`, so an investor-facing route physically cannot
 * mount it. The public block is additionally wrapped in `PublicSurface`, which
 * throws in development if a PropertyRadar-tagged field name is ever added to
 * its field list.
 *
 * Production target: replaces /app/analyzer and the client of
 * /api/analyzer/valuation; the public block also powers /properties/[radarId].
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AnalyzerResult, InvestmentMetrics } from "@shared/schema";
import {
  Panel,
  PanelHeader,
  SectionLabel,
  Metric,
  ScoreBars,
  ReasoningTrail,
  TierBadge,
  SignalChip,
  SkeletonBlock,
  EmptyState,
  ErrorState,
  GoldButton,
  LiveDot,
} from "@/components/kit";
import { InternalChip, SourceChip } from "@/components/provenance";
import { PublicSurface } from "@/components/provenance";
import { Sparkline } from "@/components/sparkline";
import { usd, pct, ratio, plain } from "@/lib/format";
import { cn } from "@/lib/utils";

const PUBLIC_FIELDS = [
  "formattedAddress",
  "propertyType",
  "bedrooms",
  "bathrooms",
  "squareFootage",
  "lotSize",
  "yearBuilt",
  "ownerType",
  "ownerOccupied",
  "taxAssessedValue",
  "annualPropertyTax",
  "rentcastAvm",
  "rentcastAvmLow",
  "rentcastAvmHigh",
  "rentcastRent",
  "rentcastRentLow",
  "rentcastRentHigh",
  "zipMedianSalePrice",
  "zipMedianRent",
  "capRate",
  "grm",
  "rentToValue",
  "cashOnCash",
  "dcr",
  "equityMultiple",
  "breakEvenOccupancy",
  "irrBase",
  "score",
  "tier",
];

export function DealAnalyzer({
  showInternal = false,
  initialAddress = "",
  className,
}: {
  /** Operator surfaces only. Never pass true on an investor-facing route. */
  showInternal?: boolean;
  initialAddress?: string;
  className?: string;
}) {
  const [address, setAddress] = useState(initialAddress);
  const analyze = useMutation<AnalyzerResult, Error, string>({
    mutationFn: async (addr) => {
      const res = await apiRequest("POST", "/api/analyze", { address: addr });
      return res.json();
    },
  });

  const r = analyze.data;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── Address bar ── */}
      <Panel raised>
        <div className="flex flex-wrap items-end gap-3 px-3 py-3.5 sm:px-4">
          <label className="min-w-[240px] flex-1">
            <SectionLabel>Subject property</SectionLabel>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && address.trim().length > 4) analyze.mutate(address.trim());
              }}
              placeholder="5 Song Sparrow, Irvine, CA 92604"
              className="kl-lit mt-1.5 h-9 w-full border border-outline-variant/60 bg-surface-lowest px-2.5 text-[13px] text-on-surface placeholder:text-outline/70 focus:outline-none"
              data-testid="input-analyze-address"
            />
          </label>
          <GoldButton
            onClick={() => analyze.mutate(address.trim())}
            disabled={analyze.isPending || address.trim().length < 5}
            className="h-9"
            data-testid="button-analyze"
          >
            {analyze.isPending ? "Analyzing…" : "Analyze deal"}
          </GoldButton>
          {r && (
            <div className="flex items-center gap-2.5">
              <SourceChip source="rentcast" />
              {r.source === "live" && <LiveDot label="Live AVM" />}
              <span className="num text-[10px] uppercase tracking-[0.1em] text-outline">
                {r.source === "corpus" ? "Corpus record" : r.source === "pipeline" ? "In pipeline" : "Live fetch"}
              </span>
            </div>
          )}
        </div>
      </Panel>

      {analyze.isPending && <AnalyzerSkeleton />}

      {analyze.isError && (
        <Panel>
          <ErrorState
            title="Valuation unavailable"
            message={analyze.error.message}
            onRetry={() => analyze.mutate(address.trim())}
          />
        </Panel>
      )}

      {!analyze.isPending && !analyze.isError && !r && (
        <Panel>
          <EmptyState
            title="Underwrite any address in Orange County"
            body="Enter a street address to pull an independent RentCast valuation and rent AVM, compute the seven-metric investment panel against stated assumptions, and open the HACP™ reasoning trail."
            testId="status-empty-analyzer"
          />
        </Panel>
      )}

      {r && (
        <>
          <PublicSurface fields={PUBLIC_FIELDS} component="DealAnalyzer.public" audience="public">
            <ValuationBlock result={r} />
          </PublicSurface>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <MetricsPanel metrics={r.metrics} />
            <div className="space-y-3">
              {r.internal?.score && (
                <Panel>
                  <PanelHeader
                    title="Deal Intelligence Score"
                    sub={`Score version ${r.internal.score.scoreVersion}`}
                    right={<TierBadge tier={r.internal.score.tier} />}
                  />
                  <div className="px-3 py-4 text-center sm:px-4">
                    <div
                      className="gold-foil num text-[44px] font-semibold leading-none"
                      data-testid="text-score"
                    >
                      {r.internal.score.total.toFixed(1)}
                    </div>
                    <div className="kl-label mt-2">of 100 · weighted composite</div>
                  </div>
                  <ScoreBars breakdown={r.internal.score} />
                </Panel>
              )}
              {r.public.trend && <TrendPanel trend={r.public.trend} />}
            </div>
          </div>

          {r.internal?.score?.reasons?.length ? (
            <Panel>
              <ReasoningTrail reasons={r.internal.score.reasons} />
            </Panel>
          ) : null}

          {showInternal && r.internal && <InternalUnderwriting internal={r.internal} />}

          {r.notes.length > 0 && (
            <Panel>
              <PanelHeader title="Analyst notes" right={<SourceChip source="derived" />} />
              <ul className="space-y-1.5 px-3 py-3 sm:px-4">
                {r.notes.map((n, i) => (
                  <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-on-surface-variant/85">
                    <span className="num shrink-0 text-outline">{String(i + 1).padStart(2, "0")}</span>
                    {n}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

// ── Public valuation ───────────────────────────────────────────────

function ValuationBlock({ result }: { result: AnalyzerResult }) {
  const p = result.public;
  const c = p.characteristics;
  return (
    <Panel raised>
      <PanelHeader
        title="Independent Valuation"
        sub="RentCast AVM with confidence band · distributable to investors"
        right={<SourceChip source="rentcast" />}
      />
      <div className="gotham-plate px-3 py-4 sm:px-4">
        <h2 className="gold-foil font-display text-xl font-semibold leading-tight tracking-tight" data-testid="text-subject-address">
          {p.property?.formattedAddress ?? p.address}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-on-surface-variant/75">
          <span>{c.propertyType ?? "—"}</span>
          <span className="text-outline/60">/</span>
          <span>{c.beds ?? "—"} bd · {c.baths ?? "—"} ba</span>
          <span className="text-outline/60">/</span>
          <span>{plain(c.sqft)} sq ft</span>
          <span className="text-outline/60">/</span>
          <span>built {c.yearBuilt ?? "—"}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-outline-variant/40 border-t border-outline-variant/40 sm:grid-cols-4 sm:divide-x">
        <Metric
          label="Value AVM"
          value={usd(p.rentcastAvm)}
          tone="gold"
          hint={
            p.rentcastAvmLow && p.rentcastAvmHigh
              ? `${usd(p.rentcastAvmLow, { compact: true })} – ${usd(p.rentcastAvmHigh, { compact: true })}${
                  p.confidenceBandPct !== null ? ` · ±${p.confidenceBandPct.toFixed(1)}%` : ""
                }`
              : undefined
          }
          testId="text-value-avm"
        />
        <Metric
          label="Long-term rent AVM"
          value={usd(p.rentcastRent)}
          hint={
            p.rentcastRentLow && p.rentcastRentHigh
              ? `${usd(p.rentcastRentLow)} – ${usd(p.rentcastRentHigh)} / mo`
              : undefined
          }
          testId="text-rent-avm"
        />
        <Metric
          label="ZIP median sale"
          value={usd(p.zipMedianSalePrice, { compact: true })}
          hint={c.zip ? `ZIP ${c.zip}` : undefined}
          testId="text-zip-median-sale"
        />
        <Metric
          label="ZIP median rent"
          value={usd(p.zipMedianRent)}
          hint={c.zip ? `ZIP ${c.zip}` : undefined}
          testId="text-zip-median-rent"
        />
      </div>
      <div className="grid grid-cols-2 divide-outline-variant/40 border-t border-outline-variant/40 sm:grid-cols-4 sm:divide-x">
        <Metric label="Assessed value" value={usd(c.assessedValue, { compact: true })} tone="muted" testId="text-assessed" />
        <Metric label="Annual taxes" value={usd(c.annualTaxes)} tone="muted" testId="text-taxes" />
        <Metric label="Lot size" value={c.lotSize ? `${plain(c.lotSize)} sf` : "—"} tone="muted" />
        <Metric
          label="Occupancy"
          value={c.ownerOccupied === false ? "Absentee" : c.ownerOccupied ? "Owner-occupied" : "—"}
          tone="muted"
          hint={c.ownerType ?? undefined}
        />
      </div>
    </Panel>
  );
}

// ── Derived metrics ────────────────────────────────────────────────

function MetricsPanel({ metrics }: { metrics: InvestmentMetrics }) {
  const a = metrics.assumptions;
  return (
    <Panel>
      <PanelHeader
        title="Investment Metrics"
        sub={`${Math.round(a.downPaymentPct * 100)}% down · ${(a.interestRate * 100).toFixed(2)}% · ${a.amortYears}yr am · ${a.holdYears}yr hold`}
        right={<SourceChip source="derived" />}
      />
      <div className="grid grid-cols-2 divide-x divide-y divide-outline-variant/40 sm:grid-cols-4">
        <Metric label="Cap rate" value={pct(metrics.capRate, 2)} tone="gold" testId="text-cap-rate" />
        <Metric label="Cash on cash" value={pct(metrics.cashOnCash, 2)} tone="gold" testId="text-coc" />
        <Metric label="DCR" value={ratio(metrics.dcr)} testId="text-dcr" hint={metrics.dcr !== null && metrics.dcr < 1.2 ? "Below lender floor" : undefined} />
        <Metric label="Equity multiple" value={ratio(metrics.equityMultiple)} testId="text-equity-multiple" />
        <Metric label="Break-even occupancy" value={pct(metrics.breakEvenOccupancy, 1)} testId="text-breakeven" />
        <Metric label="GRM" value={ratio(metrics.grm, 1)} testId="text-grm" />
        <Metric label="IRR — base" value={pct(metrics.irrBase, 2)} tone="gold" testId="text-irr-base" />
        <Metric
          label="IRR — bear / bull"
          value={`${pct(metrics.irrBear, 1)} / ${pct(metrics.irrBull, 1)}`}
          tone="muted"
          testId="text-irr-band"
        />
      </div>
      <div className="border-t border-outline-variant/40 bg-surface-lowest/50 px-3 py-2.5 sm:px-4">
        <p className="font-mono text-[10px] leading-relaxed text-outline">
          Assumptions: {(a.vacancyPct * 100).toFixed(0)}% vacancy · {(a.opexPct * 100).toFixed(0)}% opex ·{" "}
          {(a.closingCostPct * 100).toFixed(0)}% closing · {(a.sellingCostPct * 100).toFixed(0)}% selling ·
          appreciation {(a.appreciationBear * 100).toFixed(1)}% / {(a.appreciationBase * 100).toFixed(1)}% /{" "}
          {(a.appreciationBull * 100).toFixed(1)}%. Metrics are CookinCapital work product, not a lender commitment.
        </p>
      </div>
    </Panel>
  );
}

function TrendPanel({ trend }: { trend: NonNullable<AnalyzerResult["public"]["trend"]> }) {
  const sale = trend.saleHistory ?? [];
  const rent = trend.rentHistory ?? [];
  return (
    <Panel>
      <PanelHeader title={`Market — ZIP ${trend.zipCode}`} sub="Trailing 12 months" right={<SourceChip source="rentcast" />} />
      <div className="space-y-3 px-3 py-3 sm:px-4">
        <div>
          <div className="flex items-baseline justify-between">
            <SectionLabel>Median sale price</SectionLabel>
            <span
              className={cn("num text-[11px]", (trend.priceChange12moPct ?? 0) >= 0 ? "text-pulse/85" : "text-gold-light")}
              data-testid="text-price-change"
            >
              {pct(trend.priceChange12moPct, 1, true)}
            </span>
          </div>
          <Sparkline
            values={sale.map((p) => p.medianPrice ?? null)}
            labels={sale.map((p) => p.month)}
            testId="chart-sale-trend"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <SectionLabel>Median rent</SectionLabel>
            <span
              className={cn("num text-[11px]", (trend.rentChange12moPct ?? 0) >= 0 ? "text-pulse/85" : "text-gold-light")}
              data-testid="text-rent-change"
            >
              {pct(trend.rentChange12moPct, 1, true)}
            </span>
          </div>
          <Sparkline
            values={rent.map((p) => p.medianRent ?? null)}
            labels={rent.map((p) => p.month)}
            testId="chart-rent-trend"
          />
        </div>
        <div className="grid grid-cols-2 gap-x-3 border-t border-outline-variant/40 pt-2.5">
          <Metric label="Days on market" value={plain(trend.medianDaysOnMarket)} tone="muted" className="px-0" />
          <Metric label="Active listings" value={plain(trend.totalListings)} tone="muted" className="px-0" />
        </div>
      </div>
    </Panel>
  );
}

// ── Internal underwriting (PropertyRadar) ──────────────────────────

export function InternalUnderwriting({
  internal,
}: {
  internal: NonNullable<AnalyzerResult["internal"]>;
}) {
  return (
    <Panel className="gold-border">
      <PanelHeader
        title="Underwriting — Encumbrance & Distress"
        sub="PropertyRadar-sourced. Not displayable to investors or third parties."
        right={<InternalChip />}
      />
      <div className="grid grid-cols-2 divide-x divide-y divide-outline-variant/40 sm:grid-cols-4">
        <Metric label="PR AVM" value={usd(internal.propertyRadarAvm, { compact: true })} testId="text-pr-avm" />
        <Metric
          label="Dual-AVM delta"
          value={pct(internal.avmDeltaPct, 1, true)}
          tone={internal.avmDeltaWarning ? "warn" : "default"}
          hint={internal.avmDeltaWarning ? "Sources disagree — verify before pricing" : "Within tolerance"}
          testId="text-avm-delta"
        />
        <Metric label="Loan balance" value={usd(internal.totalLoanBalance, { compact: true })} testId="text-loan-balance" />
        <Metric label="LTV" value={pct(internal.ltv, 1, true)} testId="text-ltv" />
        <Metric label="Equity %" value={pct(internal.equityPercent, 0, true)} tone="gold" testId="text-equity-pct" />
        <Metric label="Available equity" value={usd(internal.availableEquity, { compact: true })} tone="gold" testId="text-available-equity" />
        <Metric label="Foreclosure stage" value={internal.foreclosureStage ?? "None"} testId="text-foreclosure-stage" />
        <Metric label="Radar ID" value={internal.radarId ?? "—"} tone="muted" testId="text-radar-id" />
      </div>
      {internal.signals.length > 0 && (
        <div className="border-t border-outline-variant/40 px-3 py-3 sm:px-4">
          <SectionLabel>Distress signals</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {internal.signals.map((s) => (
              <SignalChip key={s} label={s} />
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

function AnalyzerSkeleton() {
  return (
    <div className="space-y-3" data-testid="status-loading-analyzer">
      <Panel>
        <PanelHeader title="Independent Valuation" sub="Fetching AVM…" />
        <div className="space-y-3 px-4 py-4">
          <SkeletonBlock className="h-6 w-2/3" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-outline-variant/40 p-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10" />
          ))}
        </div>
      </Panel>
      <Panel>
        <PanelHeader title="Investment Metrics" sub="Computing…" />
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10" />
          ))}
        </div>
      </Panel>
    </div>
  );
}
