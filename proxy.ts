import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedRoutes = [
    "/app/dashboard", // Personal dashboard
    "/app/library", // Saved deals (personal)
    "/app/settings", // Personal settings
    "/app/portfolio", // Personal portfolio
    "/app/rescue", // Personal rescue cases
    "/app/affiliate", // Personal affiliate dashboard
    // ── Licensed-data surfaces (v2) ───────────────────────────────────
    // These render PropertyRadar-derived fields — foreclosure stage, NOD
    // dates, probate/divorce/bankruptcy flags, liens, auction economics and
    // predictive scores — which are licensed for internal use only and may
    // never appear on a public surface. The API routes behind them already
    // enforce requireOperator(), so this is defence in depth, not the only
    // control. The public equivalent is /properties/search (RentCast only).
    "/app/properties", // PropertyRadar search
    "/app/opportunities", // Distress Screener + Lead Brief + Compliance Gate
    "/app/legal", // Compliance desk: consent, DNC, suppression
    "/app/campaigns", // Purchases records; spends PropertyRadar credits
    "/app/markets", // Alpaca advisor (scaffold)
  ]

  const publicAppRoutes = [
    "/app", // Main app landing
    "/app/analyzer", // Deal analyzer — public tier hides internal underwriting
    "/app/deals", // Browse deals
    "/app/research", // Research hub
    "/app/capital", // Capital/lending info
    "/app/invest", // Investment info
  ]

  // Public marketing/info routes
  const publicRoutes = [
    "/",
    "/about",
    "/capital",
    "/invest",
    "/documents",
    "/prequal",
    "/apply",
    "/research",
    "/properties",
    "/auth/login",
    "/auth/sign-up",
    "/auth/callback",
    "/auth/forgot-password",
  ]

  // API routes - all public except user-specific ones
  const protectedApiRoutes = [
    "/api/user-deals", // Personal saved deals
    "/api/user-profile", // Personal profile
  ]

  // Check route type
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isPublicAppRoute = publicAppRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route))
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)

  // Allow static assets immediately
  if (isStaticAsset) {
    return NextResponse.next()
  }

  // Allow public routes without any auth check
  if (isPublicRoute || isPublicAppRoute) {
    // Still update session if user is logged in (for showing their state)
    let response = NextResponse.next({ request })

    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
            },
          },
        },
      )
      // Just refresh session, don't block
      await supabase.auth.getUser()
    } catch {
      // Ignore errors for public routes
    }

    return response
  }

  // For protected routes, require authentication
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only protect specific routes and APIs that need personal data
    if (!user && (isProtectedRoute || isProtectedApi)) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Redirect logged-in users away from auth pages (except callback)
    if (user && pathname.startsWith("/auth") && !pathname.includes("callback")) {
      const url = request.nextUrl.clone()
      url.pathname = "/app"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    // If auth check fails, only redirect for protected routes
    if (isProtectedRoute || isProtectedApi) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

export { proxy as middleware }
