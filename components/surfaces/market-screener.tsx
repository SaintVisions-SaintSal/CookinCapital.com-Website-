"use client"

/**
 * MARKET SCREENER — PUBLIC / INVESTOR-FACING surface.
 *
 * Renders the bulk RentCast Orange County corpus only. Every column here is
 * RentCast-sourced or CookinCapital-derived, so it is distributable under
 * RentCast's licence. No foreclosure stage, lien, probate or vacancy field
 * may ever appear on this surface — `PublicSurface` enforces that at render.
 *
 * Production target: replaces the results grid on /properties/search and the
 * inventory table inside /app/properties and /app/opportunities.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MarketQueryResult, PropertyDTO } from "@shared/schema";
import { Panel, PanelHeader, SectionLabel, Metric, SkeletonRows, EmptyState, ErrorState, GhostButton, GoldButton } from "@/components/kit";
import { PublicSurface, SourceChip } from "@/components/provenance";
import { usd, pct, plain, nf } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface MarketFilterState {
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
  outOfStateOwner: boolean;
  valuedOnly: boolean;
  sort: "yield" | "value_desc" | "value_asc" | "rent_desc" | "cap_desc" | "sqft_desc";
  limit: number;
  offset: number;
}

export const INITIAL_MARKET_FILTERS: MarketFilterState = {
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
  outOfStateOwner: false,
  valuedOnly: true,
  sort: "yield",
  limit: 50,
  offset: 0,
};

/** Field names this surface renders — validated against the provenance registry. */
const RENDERED_FIELDS = [
  "formattedAddress",
  "city",
  "zipCode",
  "propertyType",
  "bedrooms",
  "bathrooms",
  "squareFootage",
  "yearBuilt",
  "ownerType",
  "ownerOccupied",
  "taxAssessedValue",
  "annualPropertyTax",
  "rentcastAvm",
  "rentcastRent",
  "capRate",
  "grm",
  "rentToValue",
];

const SORTS: Array<{ value: MarketFilterState["sort"]; label: string }> = [
  { value: "yield", label: "Gross yield" },
  { value: "cap_desc", label: "Cap rate" },
  { value: "value_asc", label: "Value ↑" },
  { value: "value_desc", label: "Value ↓" },
  { value: "rent_desc", label: "Rent ↓" },
  { value: "sqft_desc", label: "Size ↓" },
];

export function MarketScreener({
  onSelect,
  className,
}: {
  onSelect?: (p: PropertyDTO) => void;
  className?: string;
}) {
  const [filters, setFilters] = useState<MarketFilterState>(INITIAL_MARKET_FILTERS);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<MarketQueryResult>({
    queryKey: ["/api/market/query", filters],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/market/query", filters);
      return res.json();
    },
  });

  const set = <K extends keyof MarketFilterState>(k: K, v: MarketFilterState[K]) =>
    setFilters((f) => ({ ...f, [k]: v, offset: k === "offset" ? (v as number) : 0 }));

  const toggleIn = (k: "cities" | "propertyTypes" | "zips", v: string) =>
    setFilters((f) => ({
      ...f,
      offset: 0,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));

  const facets = data?.facets;
  const page = Math.floor(filters.offset / filters.limit) + 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / filters.limit)) : 1;

  const summary = useMemo(() => {
    const rows = data?.rows ?? [];
    const valued = rows.filter((r) => r.rentcastAvm);
    const medianOf = (xs: number[]) =>
      xs.length ? xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)]! : null;
    return {
      medianValue: medianOf(valued.map((r) => r.rentcastAvm!).filter(Boolean)),
      medianRent: medianOf(rows.map((r) => r.rentcastRent).filter((v): v is number => !!v)),
      // Flagged rows are excluded from the median so one AVM artefact cannot
      // move a headline figure. Flags are set in lib/intelligence/store.ts.
      medianCap: medianOf(
        rows
          .filter((r) => !r.dataFlags?.includes("cap_rate_implausible"))
          .map((r) => r.capRate)
          .filter((v): v is number => v !== null),
      ),
      medianPpsf: medianOf(rows.map((r) => r.pricePerSqft).filter((v): v is number => v !== null)),
    };
  }, [data]);

  return (
    <PublicSurface fields={RENDERED_FIELDS} component="MarketScreener" audience="public">
      <div className={cn("grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]", className)}>
        {/* ── Criteria rail ── */}
        <Panel className="h-fit lg:sticky lg:top-3">
          <PanelHeader title="Criteria" right={<SourceChip source="rentcast" />} />
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-3 py-3.5 sm:px-4">
            <FacetGroup
              label="City"
              options={facets?.cities ?? []}
              selected={filters.cities}
              onToggle={(v) => toggleIn("cities", v)}
              testPrefix="city"
            />
            <FacetGroup
              label="Property type"
              options={facets?.propertyTypes ?? []}
              selected={filters.propertyTypes}
              onToggle={(v) => toggleIn("propertyTypes", v)}
              testPrefix="ptype"
            />

            <div>
              <SectionLabel>Value range</SectionLabel>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <NumInput
                  placeholder="Min"
                  value={filters.valueMin}
                  onChange={(v) => set("valueMin", v)}
                  testId="input-value-min"
                />
                <NumInput
                  placeholder="Max"
                  value={filters.valueMax}
                  onChange={(v) => set("valueMax", v)}
                  testId="input-value-max"
                />
              </div>
            </div>

            <div>
              <SectionLabel>Minimum monthly rent</SectionLabel>
              <RangeSlider
                min={0}
                max={12000}
                step={250}
                value={filters.rentMin ?? 0}
                onChange={(v) => set("rentMin", v || null)}
                format={(v) => (v ? usd(v) : "Any")}
                testId="slider-rent-min"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <SectionLabel>Beds min</SectionLabel>
                <NumInput
                  placeholder="Any"
                  value={filters.bedsMin}
                  onChange={(v) => set("bedsMin", v)}
                  testId="input-beds-min"
                />
              </div>
              <div>
                <SectionLabel>Sq ft min</SectionLabel>
                <NumInput
                  placeholder="Any"
                  value={filters.sqftMin}
                  onChange={(v) => set("sqftMin", v)}
                  testId="input-sqft-min"
                />
              </div>
            </div>

            <div>
              <SectionLabel>Built before</SectionLabel>
              <NumInput
                placeholder="Any year"
                value={filters.yearBuiltMax}
                onChange={(v) => set("yearBuiltMax", v)}
                testId="input-year-max"
              />
            </div>

            <div>
              <SectionLabel>Occupancy</SectionLabel>
              <div className="mt-2 flex">
                {(["any", "no", "yes"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => set("ownerOccupied", v)}
                    className={cn(
                      "kl-lit h-7 flex-1 border font-mono text-[9px] uppercase tracking-[0.1em]",
                      filters.ownerOccupied === v
                        ? "border-gold/55 bg-gold/[0.09] text-gold-light"
                        : "border-outline-variant/60 text-on-surface-variant"
                    )}
                    data-testid={`button-occupancy-${v}`}
                  >
                    {v === "any" ? "Any" : v === "no" ? "Absentee" : "Owner"}
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              label="Out-of-state owner"
              hint="Owner's mailing address is outside California"
              checked={filters.outOfStateOwner}
              onChange={(v) => set("outOfStateOwner", v)}
              testId="toggle-out-of-state"
            />
            <Toggle
              label="Valued records only"
              hint="Restrict to records carrying a live RentCast value + rent AVM"
              checked={filters.valuedOnly}
              onChange={(v) => set("valuedOnly", v)}
              testId="toggle-valued-only"
            />

            <GhostButton
              className="w-full"
              onClick={() => setFilters(INITIAL_MARKET_FILTERS)}
              data-testid="button-reset-filters"
            >
              Reset criteria
            </GhostButton>
          </div>
        </Panel>

        {/* ── Results ── */}
        <div className="min-w-0 space-y-3">
          <Panel>
            <PanelHeader
              title="Market Inventory"
              sub={
                data
                  ? `${nf(data.total)} matching records of ${nf(data.corpus.properties)} in corpus · ${nf(data.corpus.valued)} independently valued`
                  : "Loading corpus…"
              }
              right={
                <>
                  <SourceChip source="rentcast" />
                  <select
                    value={filters.sort}
                    onChange={(e) => set("sort", e.target.value as MarketFilterState["sort"])}
                    className="kl-lit h-7 border border-outline-variant/60 bg-surface-lowest px-2 font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant"
                    data-testid="select-sort"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </>
              }
            />
            <div className="grid grid-cols-2 divide-outline-variant/40 sm:grid-cols-4 sm:divide-x">
              <Metric label="Median value" value={usd(summary.medianValue, { compact: true })} testId="text-median-value" />
              <Metric label="Median rent" value={usd(summary.medianRent)} testId="text-median-rent" />
              <Metric label="Median cap rate" value={pct(summary.medianCap, 2)} tone="gold" testId="text-median-cap" />
              <Metric label="Median $/sq ft" value={summary.medianPpsf ? `$${nf(summary.medianPpsf)}` : "—"} testId="text-median-ppsf" />
            </div>
          </Panel>

          <Panel>
            {isLoading ? (
              <SkeletonRows rows={10} cols={7} />
            ) : isError ? (
              <ErrorState
                message={(error as Error)?.message ?? "The market query failed."}
                onRetry={() => refetch()}
              />
            ) : !data || data.rows.length === 0 ? (
              <EmptyState
                title="No inventory matches these criteria"
                body="Widen the value band, clear a city filter, or turn off “valued records only” to include records without a live AVM."
                action={
                  <GoldButton onClick={() => setFilters(INITIAL_MARKET_FILTERS)} data-testid="button-clear-empty">
                    Reset criteria
                  </GoldButton>
                }
                testId="status-empty-market"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-outline-variant/60">
                        {[
                          ["Address", "left"],
                          ["Type", "left"],
                          ["Bd/Ba", "right"],
                          ["Sq ft", "right"],
                          ["Built", "right"],
                          ["Value AVM", "right"],
                          ["Rent AVM", "right"],
                          ["Cap", "right"],
                          ["$/sf", "right"],
                          ["Owner", "left"],
                        ].map(([h, align]) => (
                          <th
                            key={h}
                            className={cn(
                              "kl-label whitespace-nowrap px-3 py-2 font-normal",
                              align === "right" ? "text-right" : "text-left"
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((r) => (
                        <tr
                          key={r.rcId}
                          onClick={() => onSelect?.(r)}
                          className={cn(
                            "border-b border-outline-variant/25 transition-colors",
                            onSelect && "cursor-pointer hover:bg-surface-mid/60"
                          )}
                          data-testid={`row-property-${r.rcId}`}
                        >
                          <td className="max-w-[260px] truncate px-3 py-2.5 text-on-surface">
                            {r.addressLine1 ?? r.formattedAddress}
                            <span className="ml-2 font-mono text-[10px] text-outline">
                              {r.city} {r.zipCode}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-on-surface-variant">
                            {r.propertyType ?? "—"}
                          </td>
                          <td className="num px-3 py-2.5 text-right text-on-surface-variant">
                            {r.bedrooms ?? "—"}/{r.bathrooms ?? "—"}
                          </td>
                          <td className="num px-3 py-2.5 text-right text-on-surface-variant">
                            {plain(r.squareFootage)}
                          </td>
                          <td className="num px-3 py-2.5 text-right text-on-surface-variant">
                            {r.yearBuilt ?? "—"}
                          </td>
                          <td className="num px-3 py-2.5 text-right text-on-surface">
                            {usd(r.rentcastAvm, { compact: true })}
                          </td>
                          <td className="num px-3 py-2.5 text-right text-on-surface">
                            {usd(r.rentcastRent)}
                          </td>
                          <td
                            className={cn(
                              "num px-3 py-2.5 text-right",
                              r.dataFlags?.includes("cap_rate_implausible") ? "text-outline" : "text-gold",
                            )}
                            title={
                              r.dataFlags?.length
                                ? `Derived figure flagged: ${r.dataFlags.join(", ").replace(/_/g, " ")}`
                                : undefined
                            }
                          >
                            {pct(r.capRate, 2)}
                            {r.dataFlags?.includes("cap_rate_implausible") ? (
                              <span className="ml-1 align-super text-[9px] text-outline">!</span>
                            ) : null}
                          </td>
                          <td className="num px-3 py-2.5 text-right text-on-surface-variant">
                            {r.pricePerSqft ? nf(r.pricePerSqft) : "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-outline">
                            {r.ownerOccupied === false ? "Absentee" : r.ownerOccupied ? "Occupied" : "—"}
                            {r.outOfStateOwner ? " · OOS" : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-outline-variant/40 px-3 py-2 text-[10.5px] leading-relaxed text-outline/80 sm:px-4">
                  Value and rent are RentCast AVM estimates; cap rate, $/sq ft and yield are derived by CookinCapital
                  from them and are not appraisals. A <span className="text-outline">!</span> marks a derived figure the
                  model distrusts — usually an AVM that excludes land value — and those rows are excluded from the
                  medians above.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/50 px-3 py-2.5 sm:px-4">
                  <span className="num text-[10.5px] text-outline">
                    Page {page} of {nf(pages)} · showing {data.returned} of {nf(data.total)}
                    {isFetching ? " · updating…" : ""}
                  </span>
                  <div className="flex gap-2">
                    <GhostButton
                      disabled={filters.offset === 0}
                      onClick={() => set("offset", Math.max(0, filters.offset - filters.limit))}
                      data-testid="button-prev-page"
                    >
                      Prev
                    </GhostButton>
                    <GhostButton
                      disabled={filters.offset + filters.limit >= data.total}
                      onClick={() => set("offset", filters.offset + filters.limit)}
                      data-testid="button-next-page"
                    >
                      Next
                    </GhostButton>
                  </div>
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </PublicSurface>
  );
}

// ── Small controls ─────────────────────────────────────────────────

function FacetGroup({
  label,
  options,
  selected,
  onToggle,
  testPrefix,
  max = 8,
}: {
  label: string;
  options: Array<{ value: string; count: number }>;
  selected: string[];
  onToggle: (v: string) => void;
  testPrefix: string;
  max?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? options : options.slice(0, max);
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2 space-y-1">
        {options.length === 0 && <div className="kl-skeleton h-5" />}
        {shown.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() => onToggle(o.value)}
              className={cn(
                "kl-lit flex w-full items-center justify-between gap-2 border px-2 py-1.5 text-left",
                on
                  ? "border-gold/50 bg-gold/[0.07]"
                  : "border-outline-variant/50 hover:border-outline/60"
              )}
              data-testid={`button-${testPrefix}-${o.value}`}
            >
              <span className={cn("truncate text-[11.5px]", on ? "text-gold-light" : "text-on-surface-variant")}>
                {o.value}
              </span>
              <span className="num shrink-0 text-[10px] text-outline">{nf(o.count)}</span>
            </button>
          );
        })}
        {options.length > max && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="kl-label pt-1 hover:text-on-surface-variant"
            data-testid={`button-${testPrefix}-more`}
          >
            {expanded ? "Show less" : `+${options.length - max} more`}
          </button>
        )}
      </div>
    </div>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
  testId,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <input
      inputMode="numeric"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d]/g, "");
        onChange(raw ? Number(raw) : null);
      }}
      className="kl-lit num h-8 w-full border border-outline-variant/60 bg-surface-lowest px-2 text-[11.5px] text-on-surface placeholder:font-sans placeholder:text-outline/70 focus:outline-none"
      data-testid={testId}
    />
  );
}

function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  format,
  testId,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  testId?: string;
}) {
  return (
    <div className="mt-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        data-testid={testId}
      />
      <div className="num mt-1 text-[10.5px] text-on-surface-variant">{format(value)}</div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  testId,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="kl-lit flex w-full items-start gap-2.5 border border-outline-variant/50 px-2 py-2 text-left"
      data-testid={testId}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border",
          checked ? "border-gold/70 bg-gold/20" : "border-outline/60"
        )}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <path d="M1 4.2L3 6.2L7 1.8" stroke="hsl(var(--gold-light))" strokeWidth="1.5" fill="none" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className={cn("block text-[11.5px]", checked ? "text-gold-light" : "text-on-surface-variant")}>
          {label}
        </span>
        {hint && <span className="mt-0.5 block text-[10px] leading-snug text-outline">{hint}</span>}
      </span>
    </button>
  );
}
