import { FileSearch, Brain, BadgeCheck, Rocket } from "lucide-react"

/**
 * Four-step protocol strip. Numerals are mono; the connector is a hairline
 * rule rather than a decorative gradient. Gotham texture sits behind at 8%.
 */

const steps = [
  {
    step: "01",
    icon: FileSearch,
    title: "Submit the Subject",
    description: "Enter an address or draw a market cohort. The subject resolves against the valuation corpus instantly.",
  },
  {
    step: "02",
    icon: Brain,
    title: "SaintSal™ Analyzes",
    description:
      "Patented HACP™ processing runs dual-AVM reconciliation, debt service, yield and statutory checks in one pass.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    title: "Read the Signal",
    description:
      "A BUY / PASS / RENEGOTIATE verdict and an A–F grade, each with the driving figures and the reasons attached.",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Execute & Fund",
    description: "Match the capital path, generate the lender-ready packet, clear the compliance gate, and close.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant/40 bg-surface-lowest py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="gotham-plate gotham-texture gotham-fade opacity-[0.08]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="kl-label">How It Works</span>
          <h2 className="mt-4 font-display text-[clamp(1.85rem,3.4vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-on-surface">
            From intake to exit in four steps
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px border border-outline-variant/50 bg-outline-variant/40 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="bg-surface p-7 lg:p-8" data-testid={`step-${step.step}`}>
              <div className="flex items-center gap-3">
                <span className="num text-[11px] tracking-[0.14em] text-gold">{step.step}</span>
                <span className="h-px flex-1 bg-outline-variant/60" aria-hidden="true" />
              </div>
              <step.icon className="mt-7 h-6 w-6 text-on-surface-variant" strokeWidth={1.5} />
              <h3 className="mt-6 font-display text-[16px] font-semibold tracking-tight text-on-surface">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-outline">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
