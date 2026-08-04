/** PropertyRadar account quota via a free Purchase=0 probe. Never spends credits. */
import { NextResponse } from "next/server"
import {
  requireOperator,
  propertyRadar,
  noteQuota,
  quotaSnapshot,
  QUOTA_TTL_MS,
  errPayload,
  DEFAULT_COUNTY_FIPS,
} from "@/lib/intelligence/api"
import { criteria } from "@/lib/intelligence/propertyradar"

export async function GET() {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response

  const cached = quotaSnapshot()
  if (cached.value !== null && Date.now() - cached.asOf < QUOTA_TTL_MS) {
    return NextResponse.json({
      quantityFreeRemaining: cached.value,
      asOf: new Date(cached.asOf).toISOString(),
      live: true,
      maxAllowedAcrossLists: null,
    })
  }
  try {
    const raw = await propertyRadar().count(
      criteria().eq("County", [DEFAULT_COUNTY_FIPS]).bool("inProbateProperty", 1).build(),
    )
    noteQuota(raw.quantityFreeRemaining)
    return NextResponse.json({
      quantityFreeRemaining: quotaSnapshot().value,
      asOf: new Date().toISOString(),
      live: true,
      maxAllowedAcrossLists: null,
    })
  } catch (e) {
    return NextResponse.json({
      quantityFreeRemaining: quotaSnapshot().value,
      asOf: new Date().toISOString(),
      live: false,
      maxAllowedAcrossLists: null,
      error: errPayload(e).message,
    })
  }
}

