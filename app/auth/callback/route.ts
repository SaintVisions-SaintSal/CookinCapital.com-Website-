import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/auth-flow"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = process.env.CC_SITE_ORIGIN || url.origin
  const code = url.searchParams.get("code")
  const hash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type")
  const recovery = url.searchParams.get("flow") === "recovery" || type === "recovery"
  const fail = () => NextResponse.redirect(new URL("/auth/error?error=This%20confirmation%20link%20is%20invalid%20or%20expired.%20Please%20request%20a%20new%20link.", origin))

  if (url.searchParams.has("error") || (!code && !hash)) return fail()
  try {
    const supabase = await createServerClient()
    let result
    if (code) result = await supabase.auth.exchangeCodeForSession(code)
    else if (hash && (type === "signup" || type === "email" || type === "recovery")) {
      result = await supabase.auth.verifyOtp({ token_hash: hash, type })
    } else return fail()
    if (result.error || !result.data.session) return fail()
    const destination = recovery
      ? "/auth/reset-password"
      : `/auth/complete?next=${encodeURIComponent(safeNext(url.searchParams.get("next")))}`
    return NextResponse.redirect(new URL(destination, origin))
  } catch { return fail() }
}
