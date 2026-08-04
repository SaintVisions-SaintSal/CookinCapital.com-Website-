/**
 * ═══════════════════════════════════════════════════════════════════
 * TYPED ENVIRONMENT — one canonical name per credential
 * ═══════════════════════════════════════════════════════════════════
 *
 * Before v2 the repo referenced five different PropertyRadar variable names
 * and four PropertyAPI names. This module is the single source of truth.
 * Nothing else in the codebase should read `process.env` for these keys.
 *
 * Rules:
 *   • No secret is ever hardcoded here — placeholders live in `.env.example`.
 *   • Nothing in this file may be imported from a Client Component. Only
 *     `publicEnv` is safe on the client (NEXT_PUBLIC_* only).
 *   • `requireEnv` fails loudly at the point of use rather than silently
 *     returning undefined and producing a confusing upstream 401.
 *   • `assertBootEnv()` runs once on the server and logs a single grouped
 *     warning listing everything missing, so a misconfigured deploy is
 *     obvious in the Vercel logs instead of showing up as broken pages.
 */

export const SERVER_ENV_KEYS = [
  // ── Property intelligence ──
  "PROPERTY_RADAR_API",
  "RENTCAST_API",
  "GOOGLE_MAPS_API",
  // ── Markets ──
  "ALPACA_API_KEY_ID",
  "ALPACA_SECRET_KEY",
  "ALPACA_BASE_URL",
  // ── Data plane ──
  "SUPABASE_SERVICE_ROLE_KEY",
  // ── CRM / comms ──
  "GHL_API_KEY",
  "GHL_LOCATION_ID",
  "RESEND_API_KEY",
  // ── AI ──
  "ANTHROPIC_API_KEY",
  "ELEVENLABS_API_KEY",
] as const

export const PUBLIC_ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const

/** Keys the app cannot boot usefully without. */
const REQUIRED_AT_BOOT = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const

/** Keys that gate a specific feature. Missing ⇒ that surface degrades, app still boots. */
export const FEATURE_ENV: Record<string, readonly string[]> = {
  "Deal Analyzer / market data (RentCast)": ["RENTCAST_API"],
  "Distress Screener (PropertyRadar)": ["PROPERTY_RADAR_API"],
  "Markets advisor (Alpaca)": ["ALPACA_API_KEY_ID", "ALPACA_SECRET_KEY"],
  "Address autocomplete + maps": ["GOOGLE_MAPS_API"],
  "CRM handoff (GoHighLevel)": ["GHL_API_KEY", "GHL_LOCATION_ID"],
  "Voice agent (ElevenLabs)": ["ELEVENLABS_API_KEY"],
  "Transactional email (Resend)": ["RESEND_API_KEY"],
  "Server-side Supabase writes": ["SUPABASE_SERVICE_ROLE_KEY"],
}

export type ServerEnvKey = (typeof SERVER_ENV_KEYS)[number]
export type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number]

/**
 * Legacy aliases still present in older code paths and in the Vercel project.
 * Read the canonical name first, then fall back, so an in-flight rename cannot
 * take production down. Remove the fallbacks once Vercel is cleaned up —
 * tracked in MIGRATION-NOTES.md.
 */
const LEGACY_ALIASES: Partial<Record<ServerEnvKey, string[]>> = {
  PROPERTY_RADAR_API: [
    "PROPERTYRADAR_API_KEY",
    "PROPERTY_RADAR_API_KEY",
    "PROPERTYRADAR_API",
    "NEXT_PUBLIC_PROPERTY_RADAR_API",
  ],
  RENTCAST_API: ["RENTCAST_API_KEY"],
  GOOGLE_MAPS_API: ["GOOGLE_MAPS_API_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
  ALPACA_API_KEY_ID: ["ALPACA_KEY_ID"],
  ALPACA_SECRET_KEY: ["ALPACA_API_SECRET_KEY"],
  GHL_API_KEY: ["GOHIGHLEVEL_API_KEY", "HIGHLEVEL_API_KEY"],
  GHL_LOCATION_ID: ["GOHIGHLEVEL_LOCATION_ID"],
  ELEVENLABS_API_KEY: ["ELEVEN_LABS_API_KEY"],
}

/**
 * `PROPERTY_API` (`papi_…`) is deliberately NOT in the canonical set.
 * It returns 401 against every vendor probed (see
 * research/VERIFIED_API_FINDINGS.md). Left unwired on purpose.
 */
export const UNWIRED_KEYS = ["PROPERTY_API"] as const

function read(key: string): string | undefined {
  const direct = process.env[key]
  if (direct && direct.trim()) return direct.trim()
  for (const alias of LEGACY_ALIASES[key as ServerEnvKey] ?? []) {
    const v = process.env[alias]
    if (v && v.trim()) return v.trim()
  }
  return undefined
}

/** Optional read — returns undefined when unset. */
export function getEnv(key: ServerEnvKey | PublicEnvKey): string | undefined {
  return read(key)
}

/** Required read — throws a message that names the variable and the feature. */
export function requireEnv(key: ServerEnvKey | PublicEnvKey, feature?: string): string {
  const v = read(key)
  if (!v) {
    throw new Error(
      `Missing environment variable ${key}${feature ? ` — required for ${feature}` : ""}. ` +
        `Set it in the Vercel project (and .env.local for local development). See .env.example.`,
    )
  }
  return v
}

export function hasEnv(...keys: Array<ServerEnvKey | PublicEnvKey>): boolean {
  return keys.every((k) => Boolean(read(k)))
}

export interface EnvReport {
  missingRequired: string[]
  degradedFeatures: Array<{ feature: string; missing: string[] }>
  ok: boolean
}

export function envReport(): EnvReport {
  const missingRequired = REQUIRED_AT_BOOT.filter((k) => !read(k))
  const degradedFeatures = Object.entries(FEATURE_ENV)
    .map(([feature, keys]) => ({ feature, missing: keys.filter((k) => !read(k)) }))
    .filter((f) => f.missing.length > 0)
  return { missingRequired, degradedFeatures, ok: missingRequired.length === 0 }
}

let asserted = false

/** Call once from server code. Fails loudly on required keys, warns on the rest. */
export function assertBootEnv(): EnvReport {
  const report = envReport()
  if (!asserted) {
    asserted = true
    if (report.missingRequired.length) {
      console.error(
        `[env] FATAL — missing required variables: ${report.missingRequired.join(", ")}. See .env.example.`,
      )
    }
    for (const f of report.degradedFeatures) {
      console.warn(`[env] degraded — "${f.feature}" disabled, missing: ${f.missing.join(", ")}`)
    }
  }
  if (report.missingRequired.length && process.env.NODE_ENV === "production") {
    // Do not throw: a missing Supabase key must not take the marketing site
    // down. The surfaces that need it fail individually via requireEnv.
  }
  return report
}
