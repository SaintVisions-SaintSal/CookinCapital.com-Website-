/**
 * PUBLIC — RentCast-sourced + derived only. RentCast's licence permits
 * display, resale and distribution to third parties. No PropertyRadar field
 * may be joined into this payload.
 */
import { NextResponse } from "next/server"
import { marketFilterSchema } from "@/lib/intelligence/api"
import {
  DEFAULT_MARKET_FILTERS,
  corpusStats,
  marketFacets,
  queryMarket,
  type MarketFilters,
} from "@/lib/intelligence/store"

export async function POST(req: Request) {
  const parsed = marketFilterSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid market filters", issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const filters: MarketFilters = { ...DEFAULT_MARKET_FILTERS, ...parsed.data }
  const { total, rows } = queryMarket(filters)
  return NextResponse.json({
    total,
    returned: rows.length,
    rows,
    facets: marketFacets(),
    corpus: corpusStats(),
  })
}

