import Link from "next/link"
import { Calculator, Landmark, Scale, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const pillars = [
  {
    icon: Calculator,
    title: "Deal Analyzer",
    description:
      "Comprehensive deal analysis with lender-ready packets. Get BUY/PASS/RENEGOTIATE signals backed by SaintSal™ + HACP™ decision technology.",
    cta: "Analyze a Deal",
    href: "/app/analyzer",
  },
  {
    icon: Landmark,
    title: "Lending & Capital",
    description:
      "Access the right capital path for every deal. Bridge loans, hard money, commercial lending, and investor matching—all in one command center.",
    cta: "Apply for Capital",
    href: "/prequal",
  },
  {
    icon: TrendingUp,
    title: "Investment Fund",
    description:
      "Earn 9-12% fixed returns with CookinCapital Fund I. Institutional-grade real estate lending powered by SaintSal™ AI underwriting.",
    cta: "Invest Now",
    href: "/invest",
  },
  {
    icon: Scale,
    title: "Legal Help & Protection",
    description:
      "Foreclosure prevention, bankruptcy workout, arrears stabilization. FlipEffective's legal framework integrated directly into your deal flow.",
    cta: "Get Legal Help",
    href: "/app/legal",
  },
]

export function Pillars() {
  return (
    <section id="pillars" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Four pillars. One command center.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to move real estate deals from acquisition to exit.
          </p>
        </div>

        {/* Pillars Grid - Updated to 4 columns on large screens */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
            >
              {/* Icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <pillar.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{pillar.description}</p>

              <Link href={pillar.href}>
                <Button variant="ghost" className="mt-6 -ml-4 text-primary hover:text-primary hover:bg-primary/10">
                  {pillar.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
