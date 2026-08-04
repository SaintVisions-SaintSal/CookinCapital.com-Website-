/**
 * ═══════════════════════════════════════════════════════════════════
 * INTELLIGENCE API LAYER — server only
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ported from cookincapital-app/server/routes.ts. Express handlers became
 * App Router route handlers; this module holds everything they share.
 *
 * HARD COST RULE
 * ──────────────
 * Every counting path sends Purchase=0, which PropertyRadar serves free and
 * which returns only `totalResultCount` plus `quantityFreeRemaining`. The
 * ONLY path that sends Purchase=1 — and therefore spends export credits — is
 * POST /api/screener/draw, which requires `confirmed: true` and a bounded
 * limit, and is additionally gated behind an authenticated operator.
 *
 * API keys are read via lib/env.ts on the server only. They are never
 * serialized into a response and never reach the client bundle.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import {
  PropertyRadarClient,
  CriteriaValidationError,
  criteria,
  type CriteriaEntry,
} from "./propertyradar"
import { RentCastClient } from "./rentcast"
import { getScreen, DEFAULT_COUNTY_FIPS } from "./screens"
import {
  FORECLOSURE_STAGES,
  PROPERTY_TYPES,
  DISTRESS_TOGGLES,
  CONTACT_TOGGLES,
} from "./catalog"

export const MAX_DRAW = Number(process.env.MAX_DRAW ?? "25")

let prClient: PropertyRadarClient | null = null
let rcClient: RentCastClient | null = null

export function propertyRadar(): PropertyRadarClient {
  if (!prClient) prClient = new PropertyRadarClient()
  return prClient
}

export function rentCast(): RentCastClient {
  if (!rcClient) rcClient = new RentCastClient()
  return rcClient
}

/** Cached live quota so the header can show it without hammering the API. */
let quotaCache: { value: number | null; asOf: number } = { value: null, asOf: 0 }
export const QUOTA_TTL_MS = 60_000

export function quotaSnapshot() {
  return quotaCache
}

export function noteQuota(v: unknown): void {
  if (typeof v === "number") quotaCache = { value: v, asOf: Date.now() }
}

// ───────────────────────────────────────────────────────────────────
// AUTH — internal surfaces are operator-only, enforced server side
// ───────────────────────────────────────────────────────────────────

export interface Operator {
  id: string
  email: string | null
}

/**
 * PropertyRadar-sourced data may only be served to an authenticated
 * CookinCapital operator. The `InternalChip` in the UI is a label; this is
 * the permission. Every route that can emit a PropertyRadar field calls it.
 */
export async function requireOperator(): Promise<
  { ok: true; operator: Operator } | { ok: false; response: NextResponse }
> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            message:
              "Operator authentication required. This surface serves PropertyRadar-licensed data, which may not be displayed to third parties.",
            kind: "auth",
          },
          { status: 401 },
        ),
      }
    }
    return { ok: true, operator: { id: user.id, email: user.email ?? null } }
  } catch (e) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Authentication backend unavailable.", kind: "auth" },
        { status: 503 },
      ),
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// Criteria builder — validated request shape → verified criteria
// ───────────────────────────────────────────────────────────────────

export const criteriaRequestSchema = z.object({
  county: z.number().int().positive().default(DEFAULT_COUNTY_FIPS),
  foreclosureStages: z.array(z.string()).max(20).default([]),
  equityMin: z.number().min(0).max(100).nullable().default(null),
  equityMax: z.number().min(0).max(100).nullable().default(null),
  valueMin: z.number().min(0).nullable().default(null),
  valueMax: z.number().min(0).nullable().default(null),
  propertyTypes: z.array(z.string()).max(12).default([]),
  distress: z.array(z.string()).max(12).default([]),
  contact: z.array(z.string()).max(6).default([]),
  occupancy: z.enum(["any", "absentee", "owner"]).default("any"),
})

export type CriteriaRequest = z.infer<typeof criteriaRequestSchema>

const ALLOWED_DISTRESS = new Set(DISTRESS_TOGGLES.map((d) => d.name))
const ALLOWED_CONTACT = new Set(CONTACT_TOGGLES.map((d) => d.name))
const ALLOWED_STAGES = new Set(FORECLOSURE_STAGES.map((s) => s.value))
const ALLOWED_PTYPES = new Set(PROPERTY_TYPES.map((p) => p.value))

export function buildCriteria(req: CriteriaRequest): CriteriaEntry[] {
  const b = criteria().eq("County", [req.county])

  const stages = req.foreclosureStages.filter((s) => ALLOWED_STAGES.has(s))
  if (stages.length) b.eq("ForeclosureStage", stages)

  if (req.equityMin !== null || req.equityMax !== null) {
    b.range("EquityPercent", req.equityMin, req.equityMax)
  }
  if (req.valueMin !== null || req.valueMax !== null) {
    b.range("AVM", req.valueMin, req.valueMax)
  }

  const ptypes = req.propertyTypes.filter((p) => ALLOWED_PTYPES.has(p))
  if (ptypes.length) b.propertyType(...ptypes)

  for (const name of req.distress) if (ALLOWED_DISTRESS.has(name)) b.bool(name, 1)
  for (const name of req.contact) if (ALLOWED_CONTACT.has(name)) b.bool(name, 1)

  if (req.occupancy === "absentee") b.bool("isSameMailingOrExempt", 0)
  if (req.occupancy === "owner") b.bool("isSameMailingOrExempt", 1)

  return b.build()
}

export { getScreen, DEFAULT_COUNTY_FIPS }

export function errPayload(e: unknown): { message: string; kind: string } {
  if (e instanceof CriteriaValidationError) return { message: e.message, kind: "criteria" }
  const msg = e instanceof Error ? e.message : String(e)
  if (/Missing (PropertyRadar|RentCast) API key/i.test(msg)) {
    return {
      message:
        "Upstream data credentials are not configured on this server. Set PROPERTY_RADAR_API and RENTCAST_API in the server environment.",
      kind: "credentials",
    }
  }
  return { message: msg, kind: "upstream" }
}

export const marketFilterSchema = z.object({
  cities: z.array(z.string()).max(20).default([]),
  zips: z.array(z.string()).max(40).default([]),
  propertyTypes: z.array(z.string()).max(12).default([]),
  valueMin: z.number().nullable().default(null),
  valueMax: z.number().nullable().default(null),
  rentMin: z.number().nullable().default(null),
  bedsMin: z.number().nullable().default(null),
  sqftMin: z.number().nullable().default(null),
  yearBuiltMax: z.number().nullable().default(null),
  ownerOccupied: z.enum(["any", "yes", "no"]).default("any"),
  ownerType: z.array(z.string()).max(10).default([]),
  outOfStateOwner: z.boolean().default(false),
  valuedOnly: z.boolean().default(true),
  sort: z
    .enum(["yield", "value_desc", "value_asc", "rent_desc", "cap_desc", "sqft_desc"])
    .default("yield"),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
})
