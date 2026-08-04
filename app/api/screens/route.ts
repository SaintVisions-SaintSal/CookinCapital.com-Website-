/** 18 preset distress cohorts + cached free counts. Operator-only (PropertyRadar vocabulary). */
import { NextResponse } from "next/server"
import { requireOperator } from "@/lib/intelligence/api"
import { screenMetaList } from "@/lib/intelligence/catalog"
import { storage } from "@/lib/intelligence/store"

export async function GET() {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  const counts = await storage.listScreenCounts()
  const byKey = new Map(counts.map((c) => [c.screenKey, c]))
  return NextResponse.json(
    screenMetaList().map((s) => ({ ...s, totalResultCount: byKey.get(s.key)?.totalResultCount ?? null })),
  )
}

