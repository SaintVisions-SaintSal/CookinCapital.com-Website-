// Email service using Resend API
// Environment variables needed: RESEND_API_KEY

interface SendEmailParams {
  to: string | string[]
  cc?: string | string[]
  subject: string
  text: string
  html?: string
}

function sanitizeForHeader(str: string | undefined | null): string {
  if (!str) return ""
  // Remove all non-ASCII characters
  return str.replace(/[^\x20-\x7E]/g, "").trim()
}

export async function sendEmail({ to, cc, subject, text, html }: SendEmailParams) {
  console.log("[v0] sendEmail called")

  const apiKey = process.env.RESEND_API_KEY

  // If no Resend API key, log and return
  if (!apiKey) {
    console.log("[v0] No RESEND_API_KEY found")
    console.log("=".repeat(80))
    console.log("EMAIL NOT SENT - Add RESEND_API_KEY to environment variables")
    console.log("=".repeat(80))
    console.log("To:", Array.isArray(to) ? to.join(", ") : to)
    if (cc) console.log("CC:", Array.isArray(cc) ? cc.join(", ") : cc)
    console.log("Subject:", subject)
    console.log("-".repeat(80))
    console.log(text)
    console.log("=".repeat(80))
    return { success: false, method: "no_api_key" }
  }

  console.log("[v0] RESEND_API_KEY exists, length:", apiKey.length)

  try {
    const fromAddress = "CookinCap Applications <noreply@applications.cookincap.com>"
    const safeSubject = sanitizeForHeader(subject) || "New Submission"

    console.log("[v0] From:", fromAddress)
    console.log("[v0] Subject:", safeSubject)
    console.log("[v0] To:", to)

    const emailPayload: Record<string, unknown> = {
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject: safeSubject,
      text,
    }

    if (cc) {
      emailPayload.cc = Array.isArray(cc) ? cc : [cc]
    }

    if (html) {
      emailPayload.html = html
    }

    console.log("[v0] Making fetch request to Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    })

    console.log("[v0] Resend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Resend API error response:", errorText)
      return { success: false, method: "resend_error", error: errorText }
    }

    const data = await response.json()
    console.log("[v0] Email sent successfully via Resend:", data.id)
    return { success: true, method: "resend", id: data.id }
  } catch (error) {
    console.error("[v0] Email send error:", error)
    return { success: false, method: "failed", error: String(error) }
  }
}

interface SyncToGHLParams {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  tags?: string[]
  customFields?: Record<string, string>
}

// GHL sync is handled via webhooks - this just logs for reference
export async function syncToGHL(params: SyncToGHLParams) {
  console.log("GHL contact captured:", {
    name: `${params.firstName} ${params.lastName}`,
    email: params.email,
    phone: params.phone,
    tags: params.tags,
  })
  return { success: true, reason: "logged_for_webhook" }
}
