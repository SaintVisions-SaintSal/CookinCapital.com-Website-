/** FREE count — Purchase=0. Zero credits, every time. Operator-only. */
import { NextResponse } from "next/server"
import {
  requireOperator,
  criteriaRequestSchema,
  buildCriteria,
  propertyRadar,
  noteQuota,
  quotaSnapshot,
  errPayload,
} from "@/lib/intelligence/api"

export async function POST(req: Request) {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response

  const parsed = criteriaRequestSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid criteria", issues: parsed.error.issues }, { status: 400 })
  }
  try {
    const crit = buildCriteria(parsed.data)
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

