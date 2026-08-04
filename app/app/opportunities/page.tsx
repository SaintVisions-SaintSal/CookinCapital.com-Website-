import { Suspense } from "react"
import LegacyOpportunities from "@/components/app/opportunities/opportunities-page"
import { OperatorPipeline } from "@/components/app/operator-pipeline"

/**
 * OPERATOR pipeline. Distress Screener (free counts, confirmed paid draws),
 * the scored Lead Brief, and the compliance gate that must clear before any
 * outbound contact.
 */
export default function Opportunities() {
  return (
    <div className="space-y-14">
      <Suspense fallback={<div className="kl-skeleton h-96 w-full" />}>
        <OperatorPipeline />
      </Suspense>
      <section className="border-t border-outline-variant/50 pt-14">
        <div className="mb-6">
          <span className="kl-label">Marketplace</span>
          <h2 className="mt-3 font-display text-[20px] font-semibold tracking-tight text-on-surface">
            Funding opportunities
          </h2>
        </div>
        <LegacyOpportunities />
      </section>
    </div>
  )
}

