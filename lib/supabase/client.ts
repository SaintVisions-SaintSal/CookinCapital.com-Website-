let supabaseClient: any = null
let supabaseError: Error | null = null

// Try to create client only once
const initClient = () => {
  if (supabaseClient || supabaseError) return

  try {
    // Dynamic import workaround for v0 preview
    const { createBrowserClient } = require("@supabase/ssr")
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  } catch (e) {
    supabaseError = e as Error
    console.warn("[v0] Supabase module failed to load - using mock client")
  }
}

// Mock auth object for when Supabase fails to load
const mockAuth = {
  getUser: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({ error: null }),
  signInWithPassword: async () => ({ data: { user: null }, error: { message: "Auth not available in preview" } }),
  signUp: async () => ({ data: { user: null }, error: { message: "Auth not available in preview" } }),
  updateUser: async () => ({ data: { user: null }, error: null }),
}

// Mock client for when Supabase fails to load
const mockClient = {
  auth: mockAuth,
  from: () => ({
    select: () => ({ data: [], error: null, order: () => ({ data: [], error: null }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    delete: () => ({ error: null, eq: () => ({ error: null }) }),
    eq: () => ({ data: [], error: null }),
  }),
}

export function createClient() {
  if (typeof window === "undefined") {
    // Server-side - return mock
    return mockClient as any
  }

  initClient()
  return supabaseClient || mockClient
}

export function isSupabaseAvailable() {
  initClient()
  return supabaseClient !== null
}
