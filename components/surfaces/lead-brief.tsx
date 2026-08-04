"use client"

/**
 * LEAD BRIEF — INTERNAL OPERATOR surface.
 *
 * The scored pipeline: tier bands, score composition, reasoning trail, and CSV
 * export. Leads carry PropertyRadar-sourced equity and distress fields, so this
 * whole surface is operator-only and marked as such.
 *
 * Production target: replaces /app/opportunities (pipeline list), /app/deals/[id]
 * (detail drawer) and the client of /api/deals + /api/user-deals.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeadDTO, Tier } from "@shared/schema";
import {
  Panel,
  PanelHeader,
  SectionLabel,
  Metric,
  TierBadge,
  SignalChip,
  ScoreBars,
  ReasoningTrail,
  SkeletonRows,
  EmptyState,
  ErrorState,
  GhostButton,
} from "@/components/kit";
import { InternalChip } from "@/components/provenance";
import { usd, pct, nf } from "@/lib/format";
import { cn } from "@/lib/utils";

const TIERS: Tier[] = ["HOT", "WARM", "NURTURE", "COLD"];

const TIER_THESIS: Record<Tier, string> = {
  HOT: "Call today. High equity, active distress, contactable owner.",
  WARM: "Work this week. Real equity or a live event, one input short of HOT.",
  NURTURE: "Long-cycle. Add to sequence; re-score monthly as stage advances.",
  COLD: "Hold. Insufficient equity or no actionable event at this time.",
};

export function LeadBrief({
  onOpenCompliance,
  className,
}: {
  onOpenCompliance?: (lead: LeadDTO) => void;
  className?: string;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery<LeadDTO[]>({
    queryKey: ["/api/leads"],
  });
  const [tier, setTier] = useState<Tier | "ALL">("ALL");
  const [selected, setSelected] = useState<string | null>(null);

  const leads = data ?? [];
  const filtered = useMemo(
    () =>
      (tier === "ALL" ? leads : leads.filter((l) => l.tier === tier)).slice().sort((a, b) => b.score - a.score),
    [leads, tier]
  );
  const counts = useMemo(() => {
    const m = { HOT: 0, WARM: 0, NURTURE: 0, COLD: 0 } as Record<Tier, number>;
    for (const l of leads) m[l.tier]++;
    return m;
  }, [leads]);

  const totals = useMemo(() => {
    const eq = leads.map((l) => l.availableEquity ?? 0).reduce((a, b) => a + b, 0);
    const avm = leads.map((l) => l.avm ?? 0).reduce((a, b) => a + b, 0);
    const scored = leads.length ? leads.reduce((a, l) => a + l.score, 0) / leads.length : null;
    return { eq, avm, scored, approved: leads.filter((l) => l.approvedForOutreach).length };
  }, [leads]);

  const active = filtered.find((l) => l.radarId === selected) ?? null;

  return (
    <div className={cn("space-y-3", className)}>
      <Panel>
        <PanelHeader
          title="Lead Brief"
          sub="Scored pipeline · equity, distress, spread, timing, contactability"
          right={
            <>
              <InternalChip />
              <a
                href="/api/leads.csv"
                download
                className="kl-lit inline-flex h-7 items-center border border-gold/45 bg-gold/[0.07] px-2.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-gold-light"
                data-testid="link-export-csv"
              >
                Export CSV
              </a>
            </>
          }
        />
        <div className="grid grid-cols-2 divide-outline-variant/40 sm:grid-cols-4 sm:divide-x">
          <Metric label="Leads in pipeline" value={nf(leads.length)} testId="text-total-leads" />
          <Metric label="Aggregate AVM" value={usd(totals.avm, { compact: true })} testId="text-total-avm" />
          <Metric label="Available equity" value={usd(totals.eq, { compact: true })} tone="gold" testId="text-total-equity" />
          <Metric
            label="Mean score"
            value={totals.scored === null ? "—" : totals.scored.toFixed(1)}
            hint={`${totals.approved} approved for outreach`}
            testId="text-mean-score"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-outline-variant/40 px-3 py-2.5 sm:px-4">
          <TierFilter label="All" count={leads.length} on={tier === "ALL"} onClick={() => setTier("ALL")} testId="button-tier-all" />
          {TIERS.map((t) => (
            <TierFilter
              key={t}
              label={t}
              count={counts[t]}
              on={tier === t}
              onClick={() => setTier(t)}
              testId={`button-tier-${t.toLowerCase()}`}
            />
          ))}
          {tier !== "ALL" && (
            <span className="ml-auto max-w-md self-center text-[11px] leading-snug text-on-surface-variant/75">
              {TIER_THESIS[tier]}
            </span>
          )}
        </div>
      </Panel>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          {isLoading ? (
            <SkeletonRows rows={8} cols={6} />
          ) : isError ? (
            <ErrorState message={(error as Error)?.message ?? "Could not load the pipeline."} onRetry={() => refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={tier === "ALL" ? "The pipeline is empty" : `No ${tier} leads right now`}
              body="Leads enter the pipeline from the Distress Screener. Count a cohort for free, tighten it, then draw records — each drawn record is enriched with a RentCast valuation and scored on arrival."
              testId="status-empty-brief"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-outline-variant/60">
                    {["Address", "Screen", "AVM", "Equity", "Score", "Tier", ""].map((h, i) => (
                      <th
                        key={h + i}
                        className={cn("kl-label px-3 py-2 font-normal", i >= 2 && i <= 4 ? "text-right" : "text-left")}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr
                      key={l.radarId}
                      onClick={() => setSelected(l.radarId)}
                      className={cn(
                        "cursor-pointer border-b border-outline-variant/25 transition-colors hover:bg-surface-mid/60",
                        selected === l.radarId && "bg-gold/[0.05]"
                      )}
                      data-testid={`row-brief-${l.radarId}`}
                    >
                      <td className="max-w-[230px] truncate px-3 py-2.5 text-on-surface">
                        {l.address ?? "—"}
                        <span className="ml-2 font-mono text-[10px] text-outline">
                          {l.city} {l.zip}
                        </span>
                      </td>
                      <td className="max-w-[150px] truncate px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-on-surface-variant">
                        {l.screenKey}
                      </td>
                      <td className="num px-3 py-2.5 text-right text-on-surface">{usd(l.avm, { compact: true })}</td>
                      <td className="num px-3 py-2.5 text-right text-on-surface-variant">
                        {pct(l.equityPercent, 0, true)}
                      </td>
                      <td className="num px-3 py-2.5 text-right text-gold">{l.score.toFixed(1)}</td>
                      <td className="px-3 py-2.5">
                        <TierBadge tier={l.tier} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {l.approvedForOutreach && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-pulse/85">
                            Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* ── Detail ── */}
        <div className="space-y-3">
          {active ? (
            <>
              <Panel raised>
                <PanelHeader
                  title="Lead detail"
                  sub={active.screenKey}
                  right={<TierBadge tier={active.tier} />}
                />
                <div className="px-3 py-3.5 sm:px-4">
                  <div className="text-[14px] font-semibold leading-snug tracking-tight text-on-surface" data-testid="text-detail-address">
                    {active.address}
                  </div>
                  <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-outline">
                    {active.city}, {active.state} {active.zip} · {active.radarId}
                  </div>
                  <div className="gold-foil num mt-3 text-[34px] font-semibold leading-none" data-testid="text-detail-score">
                    {active.score.toFixed(1)}
                  </div>
                  <div className="kl-label mt-1.5">Deal Intelligence Score · {active.breakdown.scoreVersion}</div>
                </div>
                <ScoreBars breakdown={active.breakdown} />
                <div className="grid grid-cols-2 divide-x divide-outline-variant/40 border-t border-outline-variant/40">
                  <Metric label="AVM" value={usd(active.avm, { compact: true })} />
                  <Metric label="Equity" value={pct(active.equityPercent, 0, true)} tone="gold" />
                  <Metric label="Loan balance" value={usd(active.totalLoanBalance, { compact: true })} />
                  <Metric label="Available equity" value={usd(active.availableEquity, { compact: true })} tone="gold" />
                </div>
                {active.signals.length > 0 && (
                  <div className="border-t border-outline-variant/40 px-3 py-3 sm:px-4">
                    <SectionLabel>Signals</SectionLabel>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {active.signals.map((s) => (
                        <SignalChip key={s} label={s} />
                      ))}
                    </div>
                  </div>
                )}
                {onOpenCompliance && (
                  <div className="border-t border-outline-variant/40 px-3 py-3 sm:px-4">
                    <GhostButton
                      className="w-full"
                      onClick={() => onOpenCompliance(active)}
                      data-testid="button-open-compliance"
                    >
                      {active.approvedForOutreach ? "Review compliance record" : "Open compliance gate"}
                    </GhostButton>
                  </div>
                )}
              </Panel>
              <Panel>
                <ReasoningTrail reasons={active.reasons} />
              </Panel>
            </>
          ) : (
            <Panel className="hidden xl:block">
              <PanelHeader title="Lead detail" sub="Select a row" right={<InternalChip />} />
              <div className="px-4 py-10 text-center text-[11.5px] leading-relaxed text-on-surface-variant/70">
                Every lead carries its own score composition and a written reasoning trail. Select a
                row to open it, then clear the compliance gate before any outreach.
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function TierFilter({
  label,
  count,
  on,
  onClick,
  testId,
}: {
  label: string;
  count: number;
  on: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "kl-lit inline-flex h-7 items-center gap-2 border px-2.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
        on ? "border-gold/55 bg-gold/[0.09] text-gold-light" : "border-outline-variant/55 text-on-surface-variant"
      )}
      data-testid={testId}
    >
      {label}
      <span className="num text-[10px] text-outline">{nf(count)}</span>
    </button>
  );
}
