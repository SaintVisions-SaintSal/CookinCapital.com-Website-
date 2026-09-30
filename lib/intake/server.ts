import { createClient } from "@supabase/supabase-js"
import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { createServerClient } from "@/lib/supabase/server"
import { CONSENT_VERSION, type IntakePayload } from "./contracts"

export function intakeDatabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("INTAKE_NOT_CONFIGURED")
  // Prevent an accidental split between frontend auth and the service-role database.
  if (url !== process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("INTAKE_DATABASE_MISMATCH")
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(10000) }) },
  })
}

export function secretMatches(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected || expected.length < 32) return false
  const a = Buffer.from(actual), b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function enqueueIntake(
  eventKey: string, eventType: "signup" | "inquiry" | "activity",
  payload: IntakePayload, userId: string | null = null,
) {
  const secret = process.env.CC_INTAKE_HASH_SECRET
  if (!secret || secret.length < 32) throw new Error("INTAKE_NOT_CONFIGURED")
  const db = intakeDatabase()
  const { data, error } = await db.rpc("cc_enqueue_intake", {
    p_event_key: eventKey, p_event_type: eventType, p_payload: payload,
    p_user_id: userId,
    p_payload_hash: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    p_rate_key: createHmac("sha256", secret).update(payload.email).digest("hex"),
  })
  if (error) {
    if (error.message.includes("RATE_LIMIT")) throw new Error("RATE_LIMIT")
    if (error.message.includes("IDEMPOTENCY_CONFLICT")) throw new Error("IDEMPOTENCY_CONFLICT")
    throw new Error("INTAKE_STORAGE_UNAVAILABLE")
  }
  return data as { id: string; state: string }
}

export async function queueConfirmedSignup() {
  const auth = await createServerClient()
  const { data: { user }, error } = await auth.auth.getUser()
  if (error || !user?.email || !user.email_confirmed_at) return false
  await enqueueIntake(`signup:${user.id}`, "signup", {
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.slice(0, 100) : "",
    email: user.email.toLowerCase(), purpose: "account",
    privacyAccepted: user.user_metadata?.cc_terms_version === CONSENT_VERSION,
    smsConsent: false, marketingConsent: false, consentVersion: CONSENT_VERSION,
    source: "cookincapital.com",
  }, user.id)
  return true
}

export async function operatorIdentity() {
  try {
    const auth = await createServerClient()
    const { data: { user }, error } = await auth.auth.getUser()
    if (error || !user || !user.email_confirmed_at) return null
    const allowed = (process.env.CC_OPERATOR_USER_IDS || "").split(",").map((id) => id.trim()).filter(Boolean)
    return allowed.includes(user.id) ? user : null
  } catch { return null }
}
