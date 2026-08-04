"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MarketScreener } from "@/components/surfaces/market-screener"
import { DealAnalyzer } from "@/components/surfaces/deal-analyzer"
import type { PropertyDTO } from "@shared/schema"

/**
 * Public market surface client. Two modes over one corpus:
 *   • Screener — cohort filtering across the corpus.
 *   • Analyzer — full underwrite of a single subject address.
 * Selecting a row hands the address to the analyzer, so a cohort scan flows
 * straight into an underwrite without a page change.
 */

type Mode = "screener" | "analyzer"

export function MarketSearchClient() {
  const router = useRouter()
  const params = useSearchParams()
  const initialQuery = params.get("q") ?? ""
  const [mode, setMode] = useState<Mode>(initialQuery ? "analyzer" : "screener")
  const [subject, setSubject] = useState(initialQuery)

  const handleSelect = (p: PropertyDTO) => {
    const addr = p.formattedAddress ?? p.addressLine1 ?? ""
    if (!addr) return
    setSubject(addr)
    setMode("analyzer")
    router.replace(`/properties/search?q=${encodeURIComponent(addr)}`, { scroll: false })
  }

  return (
    <div>
      <div className="mb-8 flex w-full border border-outline-variant/60 sm:w-auto sm:self-start" role="tablist">
        <TabButton active={mode === "screener"} onClick={() => setMode("screener")} testId="tab-screener">
          Market Screener
        </TabButton>
        <TabButton active={mode === "analyzer"} onClick={() => setMode("analyzer")} testId="tab-analyzer">
          Deal Analyzer
        </TabButton>
      </div>

      {mode === "screener" ? (
        <MarketScreener onSelect={handleSelect} />
      ) : (
        <DealAnalyzer key={subject} initialAddress={subject} showInternal={false} />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
  testId,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  testId: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      data-testid={testId}
      className={`flex-1 px-6 py-3 text-[12.5px] font-medium tracking-wide transition-colors sm:flex-none ${
        active
          ? "bg-surface-high text-gold"
          : "bg-transparent text-outline hover:bg-surface-low hover:text-on-surface-variant"
      }`}
    >
      {children}
    </button>
  )
}

