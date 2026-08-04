import Link from "next/link"
import { ArrowRight, Brain, Database, ScrollText, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HomePropertySearch } from "@/components/landing/home-property-search"

/**
 * Kinetic Luxury hero.
 *
 * Rules honoured here:
 *   • `.gold-foil` appears exactly once — on the primary headline.
 *   • Gotham plate sits at 14% opacity, masked upward, never behind a number.
 *   • Every numeral is JetBrains Mono via `.num`.
 *   • Square corners; one hairline rule per panel edge.
 *   • The pulse dot marks a genuinely live figure — the corpus timestamp.
 */

interface HeroProps {
  corpus?: { properties: number; valued: number; fetchedAt: string | null }
}

const CAPABILITIES = [
  { icon: Brain, title: "HACP™ Engine", note: "Human-AI Collaborative Processing · US Patent #10,290,222" },
  { icon: Database, title: "Dual-AVM Valuation", note: "RentCast + PropertyRadar cross-checked on every subject" },
  { icon: ScrollText, title: "Covenant-Governed", note: "Every field carries its source. Explainable, auditable." },
  { icon: Network, title: "50+ Lender Network", note: "$2B+ capital deployed across the platform" },
]

export function Hero({ corpus }: HeroProps) {
  const asOf = corpus?.fetchedAt
    ? new Date(corpus.fetchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null

  return (
    <section className="relative overflow-hidden border-b border-outline-variant/40 pb-20 pt-14 lg:pb-28 lg:pt-20">
      {/* ── Atmosphere ─────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="gotham-plate gotham-hero gotham-fade-up opacity-[0.14]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
        <div className="absolute left-1/2 top-[-10%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.07),transparent_65%)]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          {/* Protocol chip */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 border border-outline-variant/70 bg-surface-lowest/80 px-3.5 py-2 backdrop-blur-sm">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-pulse" aria-hidden="true" />
              <span className="kl-label !text-on-surface-variant">Autonomous Capital Intelligence</span>
            </div>
          </div>

          <h1 className="mt-8 text-center font-display text-[clamp(2.5rem,6.2vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            <span className="gold-foil">Institutional Capital</span>
            <br />
            <span className="text-on-surface">Infrastructure</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-center text-[17px] leading-relaxed text-on-surface-variant/85 lg:text-lg">
            The first autonomous capital platform where institutional lending, legal strategy and AI-driven decision
            intelligence converge. Every deal analyzed, graded and executed with precision — powered by{" "}
            <span className="font-medium text-gold">SaintSal™</span>, our proprietary decision engine.
          </p>

          <div className="mt-10">
            <HomePropertySearch />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/properties/search" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-13 w-full rounded-none bg-gold px-8 text-[14px] font-semibold tracking-wide text-[#291f00] hover:bg-gold-light sm:w-auto"
                data-testid="button-hero-primary"
              >
                Screen the Market
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/prequal" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="kl-lit h-13 w-full rounded-none border-outline-variant bg-transparent px-8 text-[14px] font-medium text-on-surface-variant sm:w-auto"
                data-testid="button-hero-secondary"
              >
                Apply for Capital
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Capability plates ────────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-1 gap-px border border-outline-variant/50 bg-outline-variant/40 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(({ icon: Icon, title, note }) => (
            <div key={title} className="kl-lit group bg-surface p-6" data-testid={`card-capability-${title.toLowerCase().split(" ")[0]}`}>
              <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <p className="mt-5 font-display text-[15px] font-semibold tracking-tight text-on-surface">{title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-outline">{note}</p>
            </div>
          ))}
        </div>

        {/* ── Verified figures. Corpus counts are live; capital figures are platform totals. ── */}
        <div className="mt-14 grid grid-cols-2 gap-px border border-outline-variant/50 bg-outline-variant/40 lg:grid-cols-4">
          <Figure label="Capital Deployed" value="$2B+" />
          <Figure label="Distressed Assets Resolved" value="$3B+" />
          <Figure
            label="Properties On File"
            value={corpus ? corpus.properties.toLocaleString("en-US") : "—"}
            note={corpus ? `${corpus.valued.toLocaleString("en-US")} independently valued` : undefined}
            live
          />
          <Figure label="Data As Of" value={asOf ?? "—"} note="RentCast · Orange County, CA" />
        </div>

        <p className="mt-6 text-center text-[11.5px] leading-relaxed text-outline/80">
          Property and valuation figures on public surfaces are RentCast-sourced or derived from RentCast data.
          Foreclosure, lien and predictive-score data is licensed for CookinCapital operator use only and is not
          displayed publicly.
        </p>
      </div>
    </section>
  )
}

function Figure({
  label,
  value,
  note,
  live = false,
}: {
  label: string
  value: string
  note?: string
  live?: boolean
}) {
  return (
    <div className="bg-surface-lowest px-6 py-7" data-testid={`figure-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-2">
        {live && <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-pulse" aria-hidden="true" />}
        <span className="kl-label">{label}</span>
      </div>
      <p className="num mt-3 text-[26px] font-semibold leading-none tracking-tight text-on-surface lg:text-[30px]">
        {value}
      </p>
      {note && <p className="mt-2 text-[11.5px] text-outline">{note}</p>}
    </div>
  )
}
