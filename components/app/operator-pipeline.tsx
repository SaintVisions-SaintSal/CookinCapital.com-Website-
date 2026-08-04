"use client"

import { useState } from "react"
import { DistressScreener } from "@/components/surfaces/distress-screener"
import { LeadBrief } from "@/components/surfaces/lead-brief"
import { ComplianceGate } from "@/components/surfaces/compliance-gate"
import type { LeadDTO } from "@shared/schema"

/**
 * The operator loop, in the order it is actually run:
 *   count (free) → draw (confirmed, credit-spending) → score → compliance gate
 *   → approve for outreach. The gate is the only path to approval, and the
 *   server re-evaluates it on approve, so the UI cannot be talked past.
 */
export function OperatorPipeline() {
  const [gateLead, setGateLead] = useState<LeadDTO | null>(null)

  return (
    <div className="space-y-14">
      <section>
        <div className="mb-6">
          <span className="kl-label">Internal — CookinCapital operators only</span>
          <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-on-surface">
            Distress Screener
          </h1>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-outline">
            Counts are free and unlimited. Only a confirmed draw spends export credits, and every draw is capped.
          </p>
        </div>
        <DistressScreener />
      </section>

      <section className="border-t border-outline-variant/50 pt-14">
        <div className="mb-6">
          <span className="kl-label">Scored Pipeline</span>
          <h2 className="mt-3 font-display text-[20px] font-semibold tracking-tight text-on-surface">Lead Brief</h2>
        </div>
        <LeadBrief onOpenCompliance={setGateLead} />
      </section>

      <section className="border-t border-outline-variant/50 pt-14">
        <div className="mb-6">
          <span className="kl-label">Pre-Contact Control</span>
          <h2 className="mt-3 font-display text-[20px] font-semibold tracking-tight text-on-surface">
            Compliance Gate
          </h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-outline">
            {gateLead
              ? `Evaluating ${gateLead.address ?? gateLead.radarId}.`
              : "Select a lead in the brief above to evaluate it before outreach."}
          </p>
        </div>
        <ComplianceGate radarId={gateLead?.radarId ?? null} />
      </section>
    </div>
  )
}

