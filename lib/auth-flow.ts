export const DEFAULT_AFTER_LOGIN = "/research"

/** Only same-site app destinations; reject protocol-relative and encoded escapes. */
export function safeNext(value: string | null | undefined, fallback = DEFAULT_AFTER_LOGIN): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback
  if (/[\\\u0000-\u0020]/.test(value) || /%[0-9a-f]{2}/i.test(value)) return fallback
  const path = value.split(/[?#]/, 1)[0]
  if (path.startsWith("/auth") || path.startsWith("/api") || path.startsWith("/operations")) return fallback
  return value
}

export function authMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ""
  if (/fetch|network|timeout|aborted|supabase|URL and API key/i.test(message)) {
    return "Account service is temporarily unavailable. Please try again later. You can still explore Research."
  }
  if (/invalid login/i.test(message)) return "The email or password is incorrect."
  if (/email not confirmed/i.test(message)) return "Please confirm your email before signing in."
  if (/rate|too many/i.test(message)) return "Too many attempts. Please wait a few minutes and try again."
  if (/password/i.test(message)) return "Please use a stronger password and try again."
  return "We couldn't complete this account request. Please try again."
}

export async function accountFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(12000) })
}
