"use client"

/**
 * DISTRESS SCREENER — INTERNAL OPERATOR surface.
 *
 * Renders PropertyRadar cohort counts, foreclosure stages, and distress
 * signals. PropertyRadar's User Agreement forbids display of this data to
 * third parties, so this component must only ever be mounted behind operator
 * auth and always carries the internal marker in its header.
 *
 * COST MODEL, enforced server-side and surfaced here:
 *   • "Run count" → Purchase=0. Free, every time. Returns totalResultCount only.
 *   • "Draw records" → Purchase=1. Spends export credits, requires an explicit
 *     confirmation showing the exact cost before it will fire.
 *
 * Production target: replaces /app/opportunities (operator cohort view) and
 * becomes the internal half of /properties/search.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CountResult, DrawResult, ScreenMeta } from "@shared/schema";
import {
  Panel,
  PanelHeader,
  SectionLabel,
  Metric,
  TierBadge,
  SignalChip,
  SkeletonRows,
  EmptyState,
  ErrorState,
  GhostButton,
  GoldButton,
  LiveDot,
} from "@/components/kit";
import { InternalChip, SourceChip } from "@/components/provenance";
import { usd, pct, nf } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CatalogPayload {
  counties: Array<{ key: string; state: string; county: string; fips: number }>;
  stateOrder: string[];
  foreclosureStages: Array<{ value: string; label: string; severity: number }>;
  propertyTypes: Array<{ value: string; label: string }>;
  distressToggles: Array<{ name: string; label: string; hint: string }>;
  contactToggles: Array<{ name: string; label: string; hint: string }>;
  occupancyOptions: Array<{ value: string; label: string }>;
  defaultCounty: number;
  maxDraw: number;
}

interface CriteriaState {
  county: number;
  foreclosureStages: string[];
  equityMin: number | null;
  equityMax: number | null;
  valueMin: number | null;
  valueMax: number | null;
  propertyTypes: string[];
  distress: string[];
  contact: string[];
  occupancy: "any" | "absentee" | "owner";
}

const CATEGORY_ORDER = ["Foreclosure", "Life Event", "Equity", "Listing", "Investment"] as const;

export function DistressScreener({ className }: { className?: string }) {
  const { data: catalog } = useQuery<CatalogPayload>({ queryKey: ["/api/catalog"] });
  const { data: screens, isLoading: screensLoading } = useQuery<ScreenMeta[]>({
    queryKey: ["/api/screens"],
  });

  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<CriteriaState>({
    county: 6059,
    foreclosureStages: [],
    equityMin: 40,
    equityMax: null,
    valueMin: null,
    valueMax: null,
    propertyTypes: [],
    distress: [],
    contact: [],
    occupancy: "any",
  });
  const [count, setCount] = useState<CountResult | null>(null);
  const [drawConfirm, setDrawConfirm] = useState<number | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);

  const countMutation = useMutation({
    mutationFn: async (): Promise<CountResult> => {
      const res = await apiRequest(
        "POST",
        activeScreen ? "/api/screener/count-screen" : "/api/screener/count",
        activeScreen ? { screenKey: activeScreen, county: criteria.county } : criteria
      );
      return res.json();
    },
    onSuccess: (data) => {
      setCount(data);
      queryClient.invalidateQueries({ queryKey: ["/api/quota"] });
    },
  });

  const drawMutation = useMutation({
    mutationFn: async (limit: number): Promise<DrawResult> => {
      const res = await apiRequest("POST", "/api/screener/draw", {
        ...criteria,
        screenKey: activeScreen ?? undefined,
        limit,
        confirmed: true,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setDrawResult(data);
      setDrawConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quota"] });
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, ScreenMeta[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const s of screens ?? []) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries()).filter(([, v]) => v.length > 0);
  }, [screens]);

  const set = <K extends keyof CriteriaState>(k: K, v: CriteriaState[K]) => {
    setCriteria((c) => ({ ...c, [k]: v }));
    setCount(null);
  };
  const toggleArr = (k: "foreclosureStages" | "propertyTypes" | "distress" | "contact", v: string) => {
    setCriteria((c) => ({
      ...c,
      [k]: c[k].includes(v) ? c[k].filter((x) => x !== v) : [...c[k], v],
    }));
    setCount(null);
  };

  const countedScreen = screens?.find((s) => s.key === activeScreen);
  const rows = drawResult?.leads ?? [];

  return (
    <div className={cn("grid gap-3 xl:grid-cols-[300px_minmax(0,1fr)]", className)}>
      {/* ── Cohort rail ── */}
      <Panel className="h-fit xl:sticky xl:top-3">
        <PanelHeader
          title="Distress Cohorts"
          sub="18 verified screens · Orange County, CA"
          right={<SourceChip source="propertyradar" />}
        />
        <div className="max-h-[72vh] overflow-y-auto">
          {screensLoading ? (
            <SkeletonRows rows={8} cols={2} />
          ) : (
            grouped.map(([category, list]) => (
              <div key={category}>
                <div className="sticky top-0 z-10 border-b border-outline-variant/40 bg-surface-lowest/95 px-3 py-1.5 backdrop-blur sm:px-4">
                  <SectionLabel>{category}</SectionLabel>
                </div>
                {list.map((s) => {
                  const on = activeScreen === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => {
                        setActiveScreen(on ? null : s.key);
                        setCount(null);
                      }}
                      title={s.thesis}
                      className={cn(
                        "kl-lit flex w-full items-start justify-between gap-2 border-b border-outline-variant/25 px-3 py-2.5 text-left sm:px-4",
                        on && "bg-gold/[0.06]"
                      )}
                      data-testid={`button-screen-${s.key}`}
                    >
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block truncate text-[11.5px] leading-snug",
                            on ? "text-gold-light" : "text-on-surface-variant"
                          )}
                        >
                          {s.title}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-outline">
                          {s.loanProduct}
                        </span>
                      </span>
                      <span className="num shrink-0 pt-0.5 text-[11px] text-on-surface">
                        {s.totalResultCount === null ? "—" : nf(s.totalResultCount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="border-t border-outline-variant/50 px-3 py-2.5 sm:px-4">
          <p className="text-[10px] leading-relaxed text-outline">
            Counts are cached results of free <span className="num">Purchase=0</span> calls. Selecting
            a cohort counts it against its own verified criteria, not the builder below.
          </p>
        </div>
      </Panel>

      {/* ── Builder + results ── */}
      <div className="min-w-0 space-y-3">
        <Panel>
          <PanelHeader
            title={countedScreen ? `Cohort — ${countedScreen.title}` : "Criteria Builder"}
            sub={
              countedScreen
                ? countedScreen.thesis
                : "Composed over the live-verified PropertyRadar criteria catalog"
            }
            right={<InternalChip />}
          />

          {!countedScreen && catalog && (
            <div className="grid gap-x-5 gap-y-4 px-3 py-3.5 sm:grid-cols-2 sm:px-4">
              <div>
                <SectionLabel>County</SectionLabel>
                <select
                  value={criteria.county}
                  onChange={(e) => set("county", Number(e.target.value))}
                  className="kl-lit num mt-2 h-8 w-full border border-outline-variant/60 bg-surface-lowest px-2 text-[11.5px] text-on-surface focus:outline-none"
                  data-testid="select-county"
                >
                  {catalog.stateOrder.map((st) => (
                    <optgroup key={st} label={st}>
                      {catalog.counties
                        .filter((c) => c.state === st)
                        .map((c) => (
                          <option key={c.key} value={c.fips}>
                            {c.county} — {c.fips}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <SectionLabel>Occupancy</SectionLabel>
                <div className="mt-2 flex">
                  {catalog.occupancyOptions.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => set("occupancy", o.value as CriteriaState["occupancy"])}
                      className={cn(
                        "kl-lit h-8 flex-1 border font-mono text-[9px] uppercase tracking-[0.1em]",
                        criteria.occupancy === o.value
                          ? "border-gold/55 bg-gold/[0.09] text-gold-light"
                          : "border-outline-variant/60 text-on-surface-variant"
                      )}
                      data-testid={`button-pr-occupancy-${o.value}`}
                    >
                      {o.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-baseline justify-between">
                  <SectionLabel>Equity band</SectionLabel>
                  <span className="num text-[10.5px] text-on-surface-variant">
                    {criteria.equityMin ?? 0}% – {criteria.equityMax ?? 100}%
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={criteria.equityMin ?? 0}
                    onChange={(e) => set("equityMin", Number(e.target.value) || null)}
                    data-testid="slider-equity-min"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={criteria.equityMax ?? 100}
                    onChange={(e) =>
                      set("equityMax", Number(e.target.value) === 100 ? null : Number(e.target.value))
                    }
                    data-testid="slider-equity-max"
                  />
                </div>
              </div>

              <div>
                <SectionLabel>Value range</SectionLabel>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <PrNumInput value={criteria.valueMin} onChange={(v) => set("valueMin", v)} placeholder="Min" testId="input-pr-value-min" />
                  <PrNumInput value={criteria.valueMax} onChange={(v) => set("valueMax", v)} placeholder="Max" testId="input-pr-value-max" />
                </div>
              </div>

              <div>
                <SectionLabel>Property type</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-1">
                  {catalog.propertyTypes.map((p) => (
                    <ChipToggle
                      key={p.value}
                      label={p.value}
                      title={p.label}
                      on={criteria.propertyTypes.includes(p.value)}
                      onClick={() => toggleArr("propertyTypes", p.value)}
                      testId={`button-ptype-${p.value}`}
                    />
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <SectionLabel>Foreclosure stage</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-1">
                  {catalog.foreclosureStages.map((s) => (
                    <ChipToggle
                      key={s.value}
                      label={s.label}
                      title={`Severity ${s.severity}/9`}
                      on={criteria.foreclosureStages.includes(s.value)}
                      onClick={() => toggleArr("foreclosureStages", s.value)}
                      testId={`button-stage-${s.value}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Distress signals</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-1">
                  {catalog.distressToggles.map((d) => (
                    <ChipToggle
                      key={d.name}
                      label={d.label}
                      title={d.hint}
                      on={criteria.distress.includes(d.name)}
                      onClick={() => toggleArr("distress", d.name)}
                      testId={`button-distress-${d.name}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Contactability</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-1">
                  {catalog.contactToggles.map((d) => (
                    <ChipToggle
                      key={d.name}
                      label={d.label}
                      title={d.hint}
                      on={criteria.contact.includes(d.name)}
                      onClick={() => toggleArr("contact", d.name)}
                      testId={`button-contact-${d.name}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Count strip ── */}
          <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant/50 bg-surface-lowest/50 px-3 py-3 sm:px-4">
            <GoldButton
              onClick={() => countMutation.mutate()}
              disabled={countMutation.isPending}
              data-testid="button-run-count"
            >
              {countMutation.isPending ? "Counting…" : "Run count"}
            </GoldButton>
            <span className="inline-flex items-center gap-1.5 border border-pulse/25 bg-pulse/[0.04] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-pulse/80">
              0 credits spent
            </span>
            {count && (
              <>
                <span className="num text-[20px] leading-none text-gold" data-testid="text-count-result">
                  {nf(count.totalResultCount)}
                </span>
                <span className="kl-label">matching records</span>
                {count.quantityFreeRemaining !== null && (
                  <span className="num text-[10.5px] text-outline">
                    quota remaining {nf(count.quantityFreeRemaining)}
                  </span>
                )}
                <LiveDot label="Purchase=0" />
              </>
            )}
            {countMutation.isError && (
              <span className="text-[11px] text-gold-light" data-testid="text-count-error">
                {(countMutation.error as Error).message}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <GhostButton
                disabled={!count || count.totalResultCount === 0}
                onClick={() => setDrawConfirm(Math.min(catalog?.maxDraw ?? 25, count?.totalResultCount ?? 0))}
                data-testid="button-open-draw"
              >
                Draw records…
              </GhostButton>
            </div>
          </div>

          {/* ── Paid draw confirmation ── */}
          {drawConfirm !== null && (
            <div className="border-t border-gold/30 bg-gold-dark/[0.08] px-3 py-3.5 sm:px-4" data-testid="panel-draw-confirm">
              <SectionLabel className="text-gold/90">Confirm credit spend</SectionLabel>
              <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-on-surface-variant">
                Drawing records issues a <span className="num">Purchase=1</span> call. This is the only
                action in the product that spends PropertyRadar export credits — one credit per record
                returned, decremented immediately and non-refundable.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="block">
                  <SectionLabel>Records</SectionLabel>
                  <input
                    inputMode="numeric"
                    value={drawConfirm}
                    onChange={(e) =>
                      setDrawConfirm(
                        Math.max(
                          1,
                          Math.min(catalog?.maxDraw ?? 25, Number(e.target.value.replace(/\D/g, "")) || 1)
                        )
                      )
                    }
                    className="kl-lit num mt-1.5 h-8 w-24 border border-gold/40 bg-surface-lowest px-2 text-[12px] text-on-surface focus:outline-none"
                    data-testid="input-draw-limit"
                  />
                </label>
                <Metric
                  label="Credits to spend"
                  value={nf(drawConfirm)}
                  tone="gold"
                  className="px-0"
                  testId="text-credit-cost"
                />
                <Metric
                  label="Ceiling"
                  value={nf(catalog?.maxDraw ?? 25)}
                  tone="muted"
                  className="px-0"
                  hint="MAX_DRAW, server-enforced"
                />
                <div className="ml-auto flex gap-2">
                  <GhostButton onClick={() => setDrawConfirm(null)} data-testid="button-cancel-draw">
                    Cancel
                  </GhostButton>
                  <GoldButton
                    onClick={() => drawMutation.mutate(drawConfirm)}
                    disabled={drawMutation.isPending}
                    data-testid="button-confirm-draw"
                  >
                    {drawMutation.isPending
                      ? "Drawing…"
                      : `Spend ${nf(drawConfirm)} credit${drawConfirm === 1 ? "" : "s"}`}
                  </GoldButton>
                </div>
              </div>
              {drawMutation.isError && (
                <p className="mt-2 text-[11px] text-gold-light" data-testid="text-draw-error">
                  {(drawMutation.error as Error).message}
                </p>
              )}
            </div>
          )}
        </Panel>

        {/* ── Drawn results ── */}
        <Panel>
          <PanelHeader
            title="Drawn Records"
            sub={
              drawResult
                ? `${drawResult.drawn} records enriched and scored · ${drawResult.creditsSpent} credits spent`
                : "Scored on arrival — equity, distress, spread, timing, contactability"
            }
            right={<InternalChip />}
          />
          {drawMutation.isPending ? (
            <SkeletonRows rows={5} cols={6} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No records drawn in this session"
              body="Counting is free and unlimited. Drawing is the only action that spends credits — count first, tighten the criteria until the cohort is small and precise, then draw."
              testId="status-empty-draw"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-outline-variant/60">
                    {["Address", "AVM", "Equity", "Signals", "Score", "Tier"].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "kl-label px-3 py-2 font-normal",
                          i === 1 || i === 2 || i === 4 ? "text-right" : "text-left"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr
                      key={l.radarId}
                      className="border-b border-outline-variant/25"
                      data-testid={`row-lead-${l.radarId}`}
                    >
                      <td className="max-w-[240px] truncate px-3 py-2.5 text-on-surface">
                        {l.address}
                        <span className="ml-2 font-mono text-[10px] text-outline">
                          {l.city} {l.state}
                        </span>
                      </td>
                      <td className="num px-3 py-2.5 text-right text-on-surface">
                        {usd(l.avm, { compact: true })}
                      </td>
                      <td className="num px-3 py-2.5 text-right text-on-surface-variant">
                        {pct(l.equityPercent, 0, true)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex max-w-[280px] flex-wrap gap-1">
                          {l.signals.slice(0, 4).map((s) => (
                            <SignalChip key={s} label={s} />
                          ))}
                        </div>
                      </td>
                      <td className="num px-3 py-2.5 text-right text-gold">{l.score.toFixed(1)}</td>
                      <td className="px-3 py-2.5">
                        <TierBadge tier={l.tier} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function ChipToggle({
  label,
  title,
  on,
  onClick,
  testId,
}: {
  label: string;
  title?: string;
  on: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={on}
      className={cn(
        "kl-lit h-6 border px-2 font-mono text-[9.5px] uppercase tracking-[0.08em]",
        on
          ? "border-gold/55 bg-gold/[0.09] text-gold-light"
          : "border-outline-variant/55 text-on-surface-variant/80 hover:border-outline/60"
      )}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

function PrNumInput({
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
