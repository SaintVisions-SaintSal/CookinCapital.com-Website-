import Link from "next/link"
import { Calculator, Landmark, Scale, TrendingUp, ArrowRight } from "lucide-react"

/**
 * Four pillars, rendered as a gapless plate grid — hairline rules do the
 * dividing, not whitespace. Gold is used only for the icon and the link
 * arrow; no coloured fills, no rounded cards.
 */

const pillars = [
  {
    icon: Calculator,
    index: "01",
    title: "Deal Analyzer",
    description:
      "Dual-AVM valuation, DSCR, cap rate, IRR and a lender-ready packet. BUY / PASS / RENEGOTIATE with the arithmetic shown, not asserted.",
    cta: "Analyze a Deal",
    href: "/app/analyzer",
  },
  {
    icon: Landmark,
    index: "02",
    title: "Lending & Capital",
    description:
      "The right capital path for every deal — bridge, hard money, commercial, investor match. One intake, 50+ lender network, $2B+ deployed.",
    cta: "Apply for Capital",
    href: "/prequal",
  },
  {
    icon: TrendingUp,
    index: "03",
    title: "Investment Fund",
    description:
      "CookinCapital Fund I targets 9–12% fixed returns on institutional-grade real estate lending underwritten by SaintSal™.",
    cta: "Review the Offering",
    href: "/invest",
  },
  {
    icon: Scale,
    index: "04",
    title: "Legal Help & Protection",
    description:
      "Foreclosure prevention, bankruptcy workout, arrears stabilization — the CookinCap legal framework wired directly into deal flow.",
    cta: "Get Legal Help",
    href: "/app/legal",
  },
]

export function Pillars() {
  return (
    <section id="pillars" className="relative border-b border-outline-variant/40 py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="kl-label">The Platform</span>
          <h2 className="mt-4 font-display text-[clamp(1.85rem,3.4vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-on-surface">
            Four pillars. One command center.
          </h2>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-on-surface-variant/80">
            Everything required to move a real estate deal from acquisition to exit, with the reasoning legible at every
            step.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px border border-outline-variant/50 bg-outline-variant/40 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="kl-lit group flex flex-col bg-surface p-7 lg:p-8"
              data-testid={`card-pillar-${pillar.index}`}
            >
              <div className="flex items-start justify-between">
                <pillar.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <span className="num text-[11px] tracking-[0.14em] text-outline/70">{pillar.index}</span>
              </div>
              <h3 className="mt-8 font-display text-[17px] font-semibold tracking-tight text-on-surface">
                {pillar.title}
              </h3>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-outline">{pillar.description}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-[12.5px] font-medium text-on-surface-variant transition-colors group-hover:text-gold">
                {pillar.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-[11.5px] leading-relaxed text-outline/80">
          Fund I return targets are objectives, not guarantees, and are subject to the offering documents. Nothing on
          this page is an offer to sell securities. See the offering disclosures on the Invest page.
        </p>
      </div>
    </section>
  )
}
