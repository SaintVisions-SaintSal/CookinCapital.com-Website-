"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ComplianceGate } from "@/components/surfaces/compliance-gate"
import { Panel, PanelHeader, SectionLabel } from "@/components/kit"
import type { LeadDTO } from "@shared/schema"

/**
 * Pre-contact control desk. Pick a lead, read the four statutory checks, and
 * clear it — or don't. Nothing downstream can contact a consumer whose gate has
 * not cleared: lib/compliance/outbound-gate.ts blocks the attempt server side
 * with no override flag.
 */
export function OperatorComplianceDesk() {
  const [radarId, setRadarId] = useState<string | null>(null)
  const { data: leads } = useQuery<LeadDTO[]>({ queryKey: ["/api/leads"] })

  return (
    <div>
      <div className="mb-6">
        <span className="kl-label">Internal — CookinCapital operators only</span>
        <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-on-surface">
          Compliance Gate
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-outline">
          Every check must pass before a lead may be contacted. Approval is re-verified on the server, and a blocked
          gate returns 409 regardless of what the interface shows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <Panel>
          <PanelHeader title="Pipeline" />
          <div className="max-h-[520px] overflow-y-auto custom-scrollbar">
            {(leads ?? []).length === 0 ? (
              <p className="p-4 text-[12.5px] text-outline">
                No leads in the pipeline yet. Draw a cohort from the Distress Screener first.
              </p>
            ) : (
              (leads ?? []).map((l) => (
                <button
                  key={l.radarId}
                  type="button"
                  onClick={() => setRadarId(l.radarId)}
                  data-testid={`button-lead-${l.radarId}`}
                  className={`flex w-full items-center justify-between gap-3 border-b border-outline-variant/30 px-4 py-3 text-left transition-colors last:border-0 ${
                    radarId === l.radarId ? "bg-surface-high" : "hover:bg-surface-low"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-on-surface">{l.address ?? l.radarId}</span>
                    <span className="kl-label">{l.tier}</span>
                  </span>
                  <span className="num shrink-0 text-[13px] font-semibold text-on-surface-variant">{l.score}</span>
                </button>
              ))
            )}
          </div>
        </Panel>

        <div>
          {!radarId && (
            <div className="kl-well p-6">
              <SectionLabel>Select a lead</SectionLabel>
              <p className="mt-2 text-[13px] text-outline">
                Choose a lead from the pipeline to evaluate the four statutory checks: suppression and DNC status,
                consent on file, recording-consent posture for the consumer's state, and prohibited-language screening.
              </p>
            </div>
          )}
          <ComplianceGate radarId={radarId} />
        </div>
      </div>
    </div>
  )
}

