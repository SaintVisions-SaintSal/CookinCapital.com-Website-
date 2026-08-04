/**
 * PAID draw — Purchase=1. THE ONLY CREDIT-SPENDING PATH IN THE CODEBASE.
 * Requires an authenticated operator, an explicit `confirmed: true`, and a
 * limit within MAX_DRAW.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import {
  requireOperator,
  criteriaRequestSchema,
  buildCriteria,
  getScreen,
  propertyRadar,
  rentCast,
  noteQuota,
  quotaSnapshot,
  errPayload,
  MAX_DRAW,
} from "@/lib/intelligence/api"
import type { PropertyRadarRecord } from "@/lib/intelligence/propertyradar"
import { enrichLead } from "@/lib/intelligence/enrich"
import { scoreLead } from "@/lib/intelligence/scoring"
import { storage } from "@/lib/intelligence/store"

const schema = criteriaRequestSchema.extend({
  limit: z.number().int().min(1).max(MAX_DRAW),
  confirmed: z.literal(true),
  screenKey: z.string().optional(),
})

export async function POST(req: Request) {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          "A draw must include an explicit confirmation and a record limit within the configured ceiling.",
        kind: "confirmation",
        issues: parsed.error.issues,
      },
      { status: 400 },
    )
  }
  try {
    const crit = parsed.data.screenKey
      ? getScreen(parsed.data.screenKey).build({ county: parsed.data.county })
      : buildCriteria(parsed.data)

    const search = await propertyRadar().search(crit, { limit: parsed.data.limit })
    noteQuota(search.quantityFreeRemaining)

    const records = (search.results ?? []) as PropertyRadarRecord[]
    const rows = []
    for (const rec of records) {
      const enriched = await enrichLead(rec, rentCast())
      const breakdown = scoreLead(rec, enriched, parsed.data.screenKey)
      rows.push({
        radarId: rec.RadarID,
        screenKey: parsed.data.screenKey ?? "custom",
        address: rec.Address ?? null,
        city: rec.City ?? null,
        state: rec.State ?? null,
        zip: rec.ZipFive ?? null,
        avm: enriched.avm,
        equityPercent: enriched.equityPercent,
        availableEquity: enriched.availableEquity,
        totalLoanBalance: enriched.totalLoanBalance,
        foreclosureStage: enriched.foreclosureStage,
        score: breakdown.total,
        tier: breakdown.tier,
        reasonsJson: JSON.stringify(breakdown.reasons),
        breakdownJson: JSON.stringify(breakdown),
        enrichedJson: JSON.stringify(enriched),
      })
    }
    const saved = await storage.upsertLeads(rows)
    return NextResponse.json({
      drawn: saved.length,
      creditsSpent: records.length,
      quantityFreeRemaining: quotaSnapshot().value,
      leads: saved,
    })
  } catch (e) {
    return NextResponse.json(errPayload(e), { status: 502 })
  }
}

