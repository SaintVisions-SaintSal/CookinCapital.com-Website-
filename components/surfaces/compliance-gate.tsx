"use client"

/**
 * COMPLIANCE GATE — INTERNAL OPERATOR surface.
 *
 * Four statutory checks, each carrying its citation and a link to the primary
 * source: National + state DNC, internal suppression ledger, state foreclosure-
 * consultant licensing, and AI-voice / recording disclosure. "Approve for
 * outreach" stays disabled until every check clears; the server independently
 * refuses approval with 409 if it is called anyway, so the gate is not merely
 * a UI affordance.
 *
 * Production target: replaces /app/legal and gates /api/submit-legal plus the
 * campaign launch path in /app/campaigns.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ComplianceCheck, ComplianceGateResult } from "@shared/schema";
import {
  Panel,
  PanelHeader,
  SectionLabel,
  SkeletonRows,
  EmptyState,
  ErrorState,
  GoldButton,
  GhostButton,
} from "@/components/kit";
import { InternalChip, SourceChip } from "@/components/provenance";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  ComplianceCheck["status"],
  { label: string; dot: string; text: string; border: string }
> = {
  pass: {
    label: "Clear",
    dot: "bg-pulse",
    text: "text-pulse/90",
    border: "border-pulse/25",
  },
  review: {
    label: "Review",
    dot: "bg-gold",
    text: "text-gold",
    border: "border-gold/35",
  },
  fail: {
    label: "Blocking",
    dot: "bg-gold-light",
    text: "text-gold-light",
    border: "border-gold-light/40",
  },
};

export function ComplianceGate({
  radarId,
  onApproved,
  className,
}: {
  radarId: string | null;
  onApproved?: (result: ComplianceGateResult) => void;
  className?: string;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery<ComplianceGateResult>({
    queryKey: ["/api/compliance", radarId],
    enabled: !!radarId,
  });

  const approve = useMutation<ComplianceGateResult, Error, boolean>({
    mutationFn: async (approved) => {
      const res = await apiRequest("POST", `/api/compliance/${radarId}/approve`, { approved });
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance", radarId] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      onApproved?.(result);
    },
  });

  if (!radarId) {
    return (
      <Panel className={className}>
        <PanelHeader title="Compliance Gate" sub="No lead selected" right={<InternalChip />} />
        <EmptyState
          title="Select a lead to run the gate"
          body="Every lead must clear the National and state Do-Not-Call registries, the internal suppression ledger, state foreclosure-consultant licensing, and AI-voice disclosure requirements before any outbound contact is permitted."
          testId="status-empty-compliance"
        />
      </Panel>
    );
  }

  const failing = (data?.checks ?? []).filter((c) => c.status !== "pass");

  return (
    <Panel className={cn(data?.clearedForOutreach ? "" : "gold-border", className)}>
      <PanelHeader
        title="Compliance Gate"
        sub={data ? `${data.address ?? radarId} · ${data.state ?? "—"}` : "Evaluating…"}
        right={
          <>
            <SourceChip source="derived" />
            <InternalChip />
          </>
        }
      />

      {isLoading ? (
        <SkeletonRows rows={4} cols={3} />
      ) : isError ? (
        <ErrorState
          title="Gate evaluation failed"
          message={(error as Error)?.message ?? "Could not evaluate compliance for this lead."}
          onRetry={() => refetch()}
        />
      ) : !data ? null : (
        <>
          {/* ── Status strip ── */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 border-b px-3 py-3 sm:px-4",
              data.clearedForOutreach
                ? "border-pulse/20 bg-pulse/[0.035]"
                : "border-gold/25 bg-gold-dark/[0.07]"
            )}
            data-testid="status-gate"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                data.clearedForOutreach ? "pulse-dot bg-pulse" : "bg-gold"
              )}
            />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-protocol",
                data.clearedForOutreach ? "text-pulse/90" : "text-gold"
              )}
            >
              {data.clearedForOutreach ? "All checks clear" : `${failing.length} check${failing.length === 1 ? "" : "s"} outstanding`}
            </span>
            <span className="num text-[10px] text-outline">
              evaluated {new Date(data.evaluatedAt).toLocaleString()}
            </span>
            {data.approvedForOutreach && (
              <span className="ml-auto border border-pulse/30 bg-pulse/[0.06] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-pulse/90">
                Approved for outreach
              </span>
            )}
          </div>

          {/* ── Checks ── */}
          <ul className="divide-y divide-outline-variant/35">
            {data.checks.map((c) => {
              const m = STATUS_META[c.status];
              return (
                <li key={c.id} className="px-3 py-3 sm:px-4" data-testid={`check-${c.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", m.dot)} />
                      <span className="truncate text-[12.5px] text-on-surface">{c.label}</span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                        m.border,
                        m.text
                      )}
                      data-testid={`status-${c.id}`}
                    >
                      {m.label}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-4 text-[11.5px] leading-relaxed text-on-surface-variant/85">
                    {c.detail}
                  </p>
                  <a
                    href={c.citationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="kl-lit mt-1.5 inline-block pl-4 font-mono text-[9.5px] uppercase tracking-[0.08em] text-outline underline decoration-outline/40 underline-offset-2 hover:text-gold/90"
                    data-testid={`link-citation-${c.id}`}
                  >
                    {c.citation}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* ── Approval ── */}
          <div className="border-t border-outline-variant/50 bg-surface-lowest/50 px-3 py-3.5 sm:px-4">
            <SectionLabel>Outreach authorization</SectionLabel>
            <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-on-surface-variant/80">
              Approval is recorded against this lead and required by every outbound channel — dialer,
              SMS, and AI voice. The server re-evaluates the gate on approval and rejects the request
              if any check is still failing, so this control cannot be bypassed from the client.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <GoldButton
                disabled={!data.clearedForOutreach || approve.isPending || data.approvedForOutreach}
                onClick={() => approve.mutate(true)}
                data-testid="button-approve-outreach"
              >
                {data.approvedForOutreach
                  ? "Approved"
                  : approve.isPending
                    ? "Recording…"
                    : "Approve for outreach"}
              </GoldButton>
              {data.approvedForOutreach && (
                <GhostButton
                  onClick={() => approve.mutate(false)}
                  disabled={approve.isPending}
                  data-testid="button-revoke-outreach"
                >
                  Revoke approval
                </GhostButton>
              )}
              {!data.clearedForOutreach && (
                <span className="text-[11px] text-gold/90" data-testid="text-blocked-reason">
                  Blocked by: {failing.map((c) => c.label).join(", ")}
                </span>
              )}
              {approve.isError && (
                <span className="text-[11px] text-gold-light" data-testid="text-approve-error">
                  {approve.error.message}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
