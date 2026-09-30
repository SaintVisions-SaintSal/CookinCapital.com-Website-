import { z } from "zod"

export const CONSENT_VERSION = "cc-intake-2026-09-29"
export const SMS_CONSENT_TEXT =
  "You may text me about this request. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is optional and is not a condition of service."

export const inquirySchema = z.object({
  requestId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(25).default("").refine(
    (value) => !value || /^\+[1-9]\d{7,14}$/.test(value),
    "Use international format, such as +19495550123.",
  ),
  purpose: z.enum(["capital", "research", "account", "general"]),
  message: z.string().trim().min(10).max(2000),
  privacyAccepted: z.literal(true),
  smsConsent: z.boolean().default(false),
  website: z.string().max(0).default(""),
  captchaToken: z.string().min(1).max(2048),
}).strict().superRefine((value, context) => {
  if (value.smsConsent && !value.phone) {
    context.addIssue({ code: "custom", path: ["phone"], message: "A phone number is required for text updates." })
  }
})

export type Inquiry = z.infer<typeof inquirySchema>
export type IntakePayload = {
  fullName: string
  email: string
  phone?: string
  purpose: string
  message?: string
  privacyAccepted: boolean
  smsConsent: boolean
  marketingConsent: false
  consentVersion: string
  consentText?: string
  source: "cookincapital.com"
}

export function inquiryPayload(value: Inquiry): IntakePayload {
  return {
    fullName: value.fullName, email: value.email, phone: value.phone, purpose: value.purpose,
    message: value.message, privacyAccepted: true, smsConsent: value.smsConsent,
    marketingConsent: false, consentVersion: CONSENT_VERSION,
    consentText: value.smsConsent ? SMS_CONSENT_TEXT : undefined, source: "cookincapital.com",
  }
}

export function sameOrigin(request: Request, configuredOrigin?: string): boolean {
  const origin = request.headers.get("origin")
  return Boolean(origin && origin === (configuredOrigin || new URL(request.url).origin))
}

export function workflowURL(value: string | undefined, location: string | undefined): string | null {
  if (!value || !location) return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.hostname !== "services.leadconnectorhq.com" ||
        url.port || url.username || url.password || url.search || url.hash) return null
    const expected = `/hooks/${location}/webhook-trigger/`
    if (!url.pathname.startsWith(expected) || !/^[a-zA-Z0-9-]+$/.test(url.pathname.slice(expected.length))) return null
    return url.href
  } catch { return null }
}

export async function forwardEvent(
  url: string,
  event: { id: string; event_type: string; payload: IntakePayload; created_at: string },
  fetcher: typeof fetch = fetch,
): Promise<{ accepted: boolean; errorCode: string | null }> {
  try {
    const response = await fetcher(url, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/json", "Idempotency-Key": event.id },
      body: JSON.stringify({
        event_id: event.id, event_type: event.event_type, timestamp: event.created_at,
        source: "cookincapital.com", full_name: event.payload.fullName,
        email: event.payload.email, phone: event.payload.phone || "",
        intent: event.payload.purpose, message: event.payload.message || "",
        consent: {
          service_sms: event.payload.smsConsent, marketing: false,
          version: event.payload.consentVersion, text: event.payload.consentText || "",
          captured_at: event.created_at,
        },
        create_lending_opportunity: event.event_type === "inquiry" && event.payload.purpose === "capital",
      }),
    })
    // An HTTP acknowledgement proves transport acceptance, not CRM completion.
    return response.ok
      ? { accepted: true, errorCode: null }
      : { accepted: false, errorCode: `GHL_HTTP_${response.status}` }
  } catch {
    // Ambiguous deliveries require review rather than blindly creating duplicate contacts.
    return { accepted: false, errorCode: "DELIVERY_UNCERTAIN" }
  }
}
