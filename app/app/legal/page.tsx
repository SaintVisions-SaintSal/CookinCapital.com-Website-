import { RescueLane } from "@/components/app/rescue/rescue-lane"
import { OperatorComplianceDesk } from "@/components/app/operator-compliance-desk"

/**
 * OPERATOR compliance desk. The gate here is the only sanctioned route to
 * marking a lead approved for outreach, and the server re-evaluates every
 * check on approval, so a lead cannot be approved by manipulating the UI.
 */
export default function LegalPage() {
  return (
    <div className="space-y-14">
      <OperatorComplianceDesk />
      <section className="border-t border-outline-variant/50 pt-14">
        <div className="mb-6">
          <span className="kl-label">Rescue Lane</span>
          <h2 className="mt-3 font-display text-[20px] font-semibold tracking-tight text-on-surface">
            Homeowner legal workflows
          </h2>
        </div>
        <RescueLane />
      </section>
    </div>
  )
}

