/** PUBLIC — corpus facets with counts. RentCast-sourced. */
import { NextResponse } from "next/server"
import { corpusStats, listTrendZips, marketFacets } from "@/lib/intelligence/store"

export async function GET() {
  return NextResponse.json({ ...marketFacets(), corpus: corpusStats(), trendZips: listTrendZips() })
}

