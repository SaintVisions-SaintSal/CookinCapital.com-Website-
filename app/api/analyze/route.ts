/**
 * Deal Analyzer. Returns a provenance-split payload: `public` (RentCast +
 * derived, displayable to investors), `metrics` (derived) and `internal`
 * (PropertyRadar). The internal branch is stripped unless the caller is an
 * authenticated operator. Corpus first, live RentCast fallback — never
 * fetches PropertyRadar, so an analyzer lookup can never spend credits.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { errPayload, rentCast, requireOperator } from "@/lib/intelligence/api"
import { analyzeAddress } from "@/lib/intelligence/analyzer"

const schema = z.object({ address: z.string().min(4).max(200) })

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter a street address, city, state." }, { status: 400 })
  }
  try {
    const result = await analyzeAddress(parsed.data.address.trim(), rentCast)
    const auth = await requireOperator()
    if (!auth.ok && result.internal) {
      // PROVENANCE: PropertyRadar encumbrance data never leaves the building.
      return NextResponse.json({ ...result, internal: null })
    }
    return NextResponse.json(result)
  } catch (e) {
    const status = (e as { status?: number }).status ?? 502
    return NextResponse.json(errPayload(e), { status })
  }
}

