/**
 * ═══════════════════════════════════════════════════════════════════
 * OUTBOUND GATE — the only sanctioned path to contacting a consumer
 * ═══════════════════════════════════════════════════════════════════
 *
 * Server-only. Every outbound channel (voice, SMS, ringless voicemail, email,
 * CRM-triggered sequence) must call `assertOutboundAllowed()` and must abort
 * on a `blocked` result. There is deliberately no bypass flag, and the gate
 * fails CLOSED: if a suppression source is unavailable, contact is blocked.
 *
 * Statutory basis — see research/legal_compliance_intel.md:
 *   • TCPA + FCC Declaratory Ruling FCC-24-17 (Feb 2024): an AI-generated or
 *     cloned voice is an "artificial voice" under the TCPA. Prior express
 *     WRITTEN consent, caller identification and an opt-out are required.
 *     Exposure is $500–$1,500 per call or text.
 *     https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf
 *   • Cal. Penal Code §632 (all-party consent to record; also FL Stat.
 *     §934.03, and NV for wire calls).
 *     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632
 *   • Cal. Civ. Code §2944.7(a)(1) and §2945.4(a), and the FTC MARS Rule
 *     (12 CFR 1015): no advance fee, and no "we will save your home" claims,
 *     in any foreclosure-related communication.
 *     https://www.ftc.gov/business-guidance/resources/mortgage-assistance-relief-services-rule-compliance-guide-business
 *   • National DNC registry + state DNC lists: scrub before dial.
 *
 * KNOWN GAP (must be closed before live outbound — see MIGRATION-NOTES.md):
 * `loadSuppression()` currently reads an in-process set plus, when configured,
 * a Supabase `outbound_suppression` table. No live DNC-registry provider is
 * wired. Until `DNC_PROVIDER_API` is set, `assertOutboundAllowed` blocks every
 * phone channel outright rather than assuming a number is callable.
 */

export type OutboundChannel = "voice_ai" | "voice_human" | "sms" | "rvm" | "email" | "mail"

export interface OutboundRequest {
  channel: OutboundChannel
  /** E.164 where applicable. */
  phone?: string | null
  email?: string | null
  /** Two-letter state of the consumer, used for recording-consent rules. */
  state?: string | null
  /** PropertyRadar identifier, for the audit record. */
  radarId?: string | null
  /** Proof of prior express written consent on file for this contact. */
  writtenConsent?: {
    capturedAt: string
    method: "web_form" | "e_signature" | "inbound_request"
    reference: string
  } | null
  /** Set only when the operator has cleared the lead through the compliance gate. */
  complianceGateCleared?: boolean
  /** True when the call script contains the AI-voice disclosure and opt-out. */
  disclosureInScript?: boolean
  /** True when the recording-consent line will be read before recording begins. */
  recordingConsentInScript?: boolean
  /** The script or message body, checked for prohibited advance-fee claims. */
  body?: string | null
}

export interface OutboundDecision {
  allowed: boolean
  blockers: Array<{ code: string; reason: string; authority: string }>
  warnings: string[]
  /** Text that MUST be read or sent verbatim ahead of the message body. */
  requiredPreamble: string[]
  evaluatedAt: string
}

/** States requiring all-party consent before a call may be recorded. */
const ALL_PARTY_CONSENT_STATES = new Set(["CA", "FL", "NV", "WA", "IL", "MD", "MA", "MT", "NH", "PA", "CT", "MI", "OR", "DE"])

const PHONE_CHANNELS = new Set<OutboundChannel>(["voice_ai", "voice_human", "sms", "rvm"])

/** Language that is prohibited outright in a foreclosure-adjacent message. */
const PROHIBITED_PATTERNS: Array<{ re: RegExp; code: string; reason: string; authority: string }> = [
  {
    re: /\b(save|saving|stop|stopping|prevent(?:ing)?)\s+(your\s+)?(home|house|foreclosure)\b/i,
    code: "mars_outcome_claim",
    reason:
      'Outcome claims such as "save your home" or "stop your foreclosure" are foreclosure-consultant conduct and are prohibited without registration, bonding and substantiation.',
    authority: "Cal. Civ. Code §2945.1(a); FTC MARS Rule, 12 CFR 1015.3",
  },
  {
    re: /\b(upfront|up-front|advance|retainer|deposit|application)\s+(fee|payment|charge)\b/i,
    code: "advance_fee",
    reason: "No fee of any kind may be requested or collected before every promised service is fully performed.",
    authority: "Cal. Civ. Code §2944.7(a)(1), §2945.4(a); 12 CFR 1015.5",
  },
  {
    re: /\bguarantee(d|s)?\b/i,
    code: "guarantee",
    reason: "Guarantees of approval, savings or outcome are deceptive absent substantiation.",
    authority: "FTC Act §5; 12 CFR 1015.3",
  },
]

/** Process-local suppression set. Replace with the Supabase table — see below. */
const localSuppression = new Set<string>()

export function suppressLocally(value: string): void {
  localSuppression.add(normalize(value))
}

function normalize(v: string): string {
  return v.replace(/[^0-9a-z@.+]/gi, "").toLowerCase()
}

async function isSuppressed(value: string): Promise<boolean> {
  const key = normalize(value)
  if (localSuppression.has(key)) return true

  // Supabase-backed suppression table. Absent credentials the gate fails closed
  // at the caller level (see `dnc_provider_unwired` below), so a missing table
  // can never be read as "callable".
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key2 = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key2) return false
    const res = await fetch(
      `${url}/rest/v1/outbound_suppression?select=value&value=eq.${encodeURIComponent(key)}&limit=1`,
      { headers: { apikey: key2, Authorization: `Bearer ${key2}` }, cache: "no-store" },
    )
    if (!res.ok) return false
    const rows = (await res.json()) as unknown[]
    return Array.isArray(rows) && rows.length > 0
  } catch {
    return false
  }
}

export async function assertOutboundAllowed(req: OutboundRequest): Promise<OutboundDecision> {
  const blockers: OutboundDecision["blockers"] = []
  const warnings: string[] = []
  const requiredPreamble: string[] = []

  const isPhone = PHONE_CHANNELS.has(req.channel)

  // ── 1. Compliance gate must have cleared this lead ──
  if (!req.complianceGateCleared) {
    blockers.push({
      code: "gate_not_cleared",
      reason:
        "This contact has not been cleared through the compliance gate. Evaluate the lead in /app/legal before any outbound attempt.",
      authority: "CookinCapital internal control",
    })
  }

  // ── 2. DNC / suppression scrub ──
  if (isPhone) {
    if (!process.env.DNC_PROVIDER_API) {
      blockers.push({
        code: "dnc_provider_unwired",
        reason:
          "No live DNC-registry scrub is configured, so no number can be treated as callable. Set DNC_PROVIDER_API and re-run.",
        authority: "47 CFR 64.1200(c)(2); state DNC statutes",
      })
    }
    if (!req.phone) {
      blockers.push({
        code: "no_number",
        reason: "No phone number on file for this contact.",
        authority: "CookinCapital internal control",
      })
    } else if (await isSuppressed(req.phone)) {
      blockers.push({
        code: "suppressed",
        reason: "This number is on the CookinCapital suppression list. It must never be contacted again.",
        authority: "47 CFR 64.1200(d); TCPA",
      })
    }
  }

  if (req.channel === "email") {
    if (!req.email) {
      blockers.push({
        code: "no_email",
        reason: "No email address on file for this contact.",
        authority: "CookinCapital internal control",
      })
    } else if (await isSuppressed(req.email)) {
      blockers.push({
        code: "suppressed",
        reason: "This address has unsubscribed and is suppressed permanently.",
        authority: "CAN-SPAM, 15 U.S.C. §7704(a)(4)",
      })
    }
    requiredPreamble.push(
      "This message includes a working unsubscribe link and CookinCapital's physical mailing address.",
    )
  }

  // ── 3. AI voice: prior express WRITTEN consent, identification, opt-out ──
  if (req.channel === "voice_ai" || req.channel === "rvm" || req.channel === "sms") {
    if (!req.writtenConsent) {
      blockers.push({
        code: "no_written_consent",
        reason:
          "Prior express written consent is not on file. An AI or synthetic voice, a ringless voicemail and an SMS each require it.",
        authority: "TCPA; FCC Declaratory Ruling FCC-24-17 (Feb. 8, 2024)",
      })
    }
  }

  if (req.channel === "voice_ai") {
    if (!req.disclosureInScript) {
      blockers.push({
        code: "no_ai_disclosure",
        reason:
          "The script must open by identifying CookinCapital, stating that the caller is an artificial voice, and offering an immediate opt-out.",
        authority: "FCC-24-17; 47 CFR 64.1200(b)",
      })
    }
    requiredPreamble.push(
      "This is an automated call from CookinCapital, a real estate capital company. You are speaking with an artificial voice, not a person. Say “stop” at any time and we will not call you again.",
    )
  }

  // ── 4. Recording consent ──
  const st = (req.state ?? "").toUpperCase()
  if (isPhone && ALL_PARTY_CONSENT_STATES.has(st)) {
    if (!req.recordingConsentInScript) {
      blockers.push({
        code: "no_recording_consent",
        reason: `${st} requires the consent of all parties before a call may be recorded. Add the consent line, or disable recording for this call.`,
        authority: st === "CA" ? "Cal. Penal Code §632" : "State all-party consent statute",
      })
    }
    requiredPreamble.push("This call may be recorded. Do you consent to being recorded?")
  } else if (isPhone && !st) {
    warnings.push("Consumer state unknown — the call was treated as all-party-consent to stay on the safe side.")
    if (!req.recordingConsentInScript) {
      blockers.push({
        code: "no_recording_consent",
        reason:
          "The consumer's state is unknown, so all-party consent is assumed. Add the recording-consent line before dialing.",
        authority: "Cal. Penal Code §632 (applied conservatively)",
      })
    }
  }

  // ── 5. Prohibited language ──
  if (req.body) {
    for (const p of PROHIBITED_PATTERNS) {
      if (p.re.test(req.body)) {
        blockers.push({ code: p.code, reason: p.reason, authority: p.authority })
      }
    }
  }

  return {
    allowed: blockers.length === 0,
    blockers,
    warnings,
    requiredPreamble,
    evaluatedAt: new Date().toISOString(),
  }
}

/** Throwing wrapper for call sites that should abort rather than branch. */
export async function requireOutboundAllowed(req: OutboundRequest): Promise<OutboundDecision> {
  const decision = await assertOutboundAllowed(req)
  if (!decision.allowed) {
    const err = new Error(
      `Outbound blocked: ${decision.blockers.map((b) => `${b.code} (${b.authority})`).join("; ")}`,
    ) as Error & { status?: number; decision?: OutboundDecision }
    err.status = 451
    err.decision = decision
    throw err
  }
  return decision
}
