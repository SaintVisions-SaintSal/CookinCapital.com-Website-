import { createHash } from "node:crypto"
import { createServerClient } from "@/lib/supabase/server"
import { enqueueIntake } from "@/lib/intake/server"
import { CONSENT_VERSION } from "@/lib/intake/contracts"

export const activityTypes = new Set([
  "lead.captured", "deal.analyzed", "loan.inquiry", "investment.inquiry",
  "property.saved", "conversation.started", "application.started", "research.query",
])

/** Server-side adapter: no relative fetch, no caller-supplied contact identity. */
export async function trackServerEvent(eventType: string, data: Record<string, unknown>) {
  if (!activityTypes.has(eventType)) throw new Error("UNSUPPORTED_EVENT")
  const auth = await createServerClient()
  const { data: { user }, error } = await auth.auth.getUser()
  if (error || !user?.email || !user.email_confirmed_at) return null
  const query = typeof data.query === "string" ? data.query.slice(0, 2000) : ""
  const fingerprint = createHash("sha256")
    .update(JSON.stringify({ eventType, userId: user.id, query, sessionId: data.sessionId || data.conversationId || "" }))
    .digest("hex")
  return enqueueIntake(`activity:${fingerprint}`, "activity", {
    fullName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.slice(0, 100) : "",
    email: user.email.toLowerCase(), purpose: eventType, message: query,
    privacyAccepted: user.user_metadata?.cc_terms_version === CONSENT_VERSION,
    smsConsent: false, marketingConsent: false, consentVersion: CONSENT_VERSION,
    source: "cookincapital.com",
  }, user.id)
}
