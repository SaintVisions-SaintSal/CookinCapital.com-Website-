/** PUBLIC — 12-month sale + rent series for a ZIP. RentCast-sourced. */
import { NextResponse } from "next/server"
import { getTrend } from "@/lib/intelligence/store"

export async function GET(_req: Request, { params }: { params: Promise<{ zip: string }> }) {
  const { zip } = await params
  const t = getTrend(zip)
  if (!t) {
    return NextResponse.json(
      {
        message: `No 12-month market series on file for ${zip}. Trend coverage is limited to the seeded Orange County zips.`,
      },
      { status: 404 },
    )
  }
  return NextResponse.json(t)
}

