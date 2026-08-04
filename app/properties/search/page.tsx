import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { MarketSearchClient } from "@/components/property/market-search-client"
import { corpusStats } from "@/lib/intelligence/store"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Market Screener | CookinCapital",
  description:
    "Screen the Orange County investment corpus on value, rent, yield, cap rate and ownership. RentCast-sourced valuation data with every field attributed.",
}

/**
 * PUBLIC market surface.
 *
 * Every figure rendered here is RentCast-sourced or CookinCapital-derived and
 * therefore distributable. The PropertyRadar-backed address search that used
 * to live on this route now sits behind /app/properties, because foreclosure,
 * lien and probate fields are licensed for operator use only.
 */
export default function PropertySearchPage() {
  const corpus = corpusStats()
  const asOf = corpus.fetchedAt
    ? new Date(corpus.fetchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—"

  return (
    <main className="min-h-screen bg-obsidian">
      <Header />

      <section className="relative overflow-hidden border-b border-outline-variant/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="gotham-plate gotham-strip gotham-fade-up opacity-[0.10]" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-6 py-14 lg:px-10 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="kl-label">Market Intelligence</span>
              <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-on-surface">
                Screen the market on the numbers that decide the deal
              </h1>
              <p className="mt-4 text-[15.5px] leading-relaxed text-on-surface-variant/80">
                Value, rent, gross yield, cap rate, size and ownership across the Orange County corpus — filtered live,
                sorted by yield, with the source of every column stated on the surface.
              </p>
            </div>
            <dl className="grid shrink-0 grid-cols-3 gap-px border border-outline-variant/50 bg-outline-variant/40">
              <Stat label="On file" value={corpus.properties.toLocaleString("en-US")} />
              <Stat label="Valued" value={corpus.valued.toLocaleString("en-US")} />
              <Stat label="As of" value={asOf} />
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-14">
        <Suspense fallback={<div className="kl-skeleton h-96 w-full" />}>
          <MarketSearchClient />
        </Suspense>

        <div className="kl-panel mt-12 p-6 lg:p-8">
          <span className="kl-label">Operator Surfaces</span>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-outline">
            Foreclosure stage, notice-of-default dates, probate, divorce, bankruptcy, lien positions and predictive
            scores are licensed to CookinCapital for internal use and are not published here. Operators can reach them
            through the{" "}
            <Link href="/app/opportunities" className="text-gold underline decoration-gold/30 underline-offset-4">
              Distress Screener
            </Link>{" "}
            after signing in.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-lowest px-5 py-4">
      <dt className="kl-label">{label}</dt>
      <dd className="num mt-2 text-[17px] font-semibold text-on-surface">{value}</dd>
    </div>
  )
}

