import { Suspense } from "react"
import { DealAnalyzer as IntelligenceAnalyzer } from "@/components/surfaces/deal-analyzer"
import { DealAnalyzer as ManualAnalyzer } from "@/components/app/deal-analyzer/deal-analyzer"

/**
 * OPERATOR analyzer. Two layers, deliberately stacked:
 *   1. Instant underwrite — address in, dual-AVM reconciliation out, with the
 *      PropertyRadar internal block visible because this route is authed.
 *   2. Manual underwrite — the existing full pricing / financing / exit model,
 *      preserved intact for deals that need hand-set assumptions.
 */
export default function AnalyzerPage() {
  return (
    <div className="space-y-14">
      <section>
        <div className="mb-6">
          <span className="kl-label">Instant Underwrite</span>
          <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-on-surface">
            Deal Analyzer
          </h1>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-outline">
            Enter a subject address. The engine reconciles both valuation sources, runs debt service and yield, and
            returns BUY / PASS / RENEGOTIATE with the driving figures attached.
          </p>
        </div>
        <Suspense fallback={<div className="kl-skeleton h-64 w-full" />}>
          <IntelligenceAnalyzer showInternal />
        </Suspense>
      </section>

      <section className="border-t border-outline-variant/50 pt-14">
        <div className="mb-6">
          <span className="kl-label">Manual Underwrite</span>
          <h2 className="mt-3 font-display text-[20px] font-semibold tracking-tight text-on-surface">
            Full model — pricing, financing, holding and exit
          </h2>
        </div>
        <Suspense fallback={<div className="kl-skeleton h-64 w-full" />}>
          <ManualAnalyzer />
        </Suspense>
      </section>
    </div>
  )
}

