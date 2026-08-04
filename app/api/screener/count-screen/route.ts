/** FREE count for a named preset screen — Purchase=0. Operator-only. */
import { NextResponse } from "next/server"
import { z } from "zod"
import {
  requireOperator,
  getScreen,
  propertyRadar,
  noteQuota,
  quotaSnapshot,
  errPayload,
  DEFAULT_COUNTY_FIPS,
} from "@/lib/intelligence/api"

const schema = z.object({
  screenKey: z.string(),
  county: z.number().int().positive().default(DEFAULT_COUNTY_FIPS),
  contactable: z.boolean().default(false),
})

export async function POST(req: Request) {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  try {
    const screen = getScreen(parsed.data.screenKey)
    const crit = screen.build({ county: parsed.data.county, contactable: parsed.data.contactable })
    const raw = await propertyRadar().count(crit)
    noteQuota(raw.quantityFreeRemaining)
    return NextResponse.json({
      totalResultCount: Number(raw.totalResultCount ?? 0),
      quantityFreeRemaining: quotaSnapshot().value,
      creditsSpent: 0,
      criteria: crit,
      countedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(errPayload(e), { status: 502 })
  }
}

