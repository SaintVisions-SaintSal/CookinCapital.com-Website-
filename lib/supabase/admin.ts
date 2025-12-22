import { cookies } from "next/headers"

// Admin client with service role - bypasses RLS for admin operations
export async function createAdminClient() {
  try {
    const { createServerClient } = require("@supabase/ssr")

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
      {
        cookies: {
          async getAll() {
            return (await cookies()).getAll()
          },
          async setAll(cookiesToSet) {
            try {
              const cookieStore = await cookies()
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Server component - can't set cookies
            }
          },
        },
      },
    )
  } catch (error) {
    console.error("[v0] Failed to create admin Supabase client:", error)
    return null
  }
}

// Check if current user is admin or manager
export async function isUserAdmin(userId: string) {
  const supabase = await createAdminClient()
  if (!supabase) return false

  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return data?.role === "admin" || data?.role === "manager"
}
