import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/capital",
    "/invest",
    "/documents",
    "/prequal",
    "/apply",
    "/research",
    "/auth/login",
    "/auth/sign-up",
    "/auth/callback",
    "/auth/forgot-password",
  ]

  // API routes that should be public
  const publicApiRoutes = [
    "/api/ghl",
    "/api/saintsal/webhook",
    "/api/submit-application",
    "/api/submit-investor",
    "/api/submit-legal",
    "/api/submit-worksheet",
    "/api/research",
    "/api/property-search",
    "/api/voice",
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route))
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)

  // Allow public routes and static assets
  if (isPublicRoute || isPublicApi || isStaticAsset) {
    return NextResponse.next()
  }

  // For protected routes, update session and check auth
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

    // Protect /app routes - redirect to login if not authenticated
    if (!user && pathname.startsWith("/app")) {
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
    // If auth check fails, redirect to login for /app/* routes
    if (pathname.startsWith("/app")) {
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
