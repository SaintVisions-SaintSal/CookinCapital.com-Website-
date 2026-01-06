let supabaseClient: any = null
let supabaseError: Error | null = null
let initialized = false

// Use global window storage for true singleton across all imports
const GLOBAL_KEY = "__SUPABASE_CLIENT__"

const initClient = () => {
  // Check global first
  if (typeof window !== "undefined" && (window as any)[GLOBAL_KEY]) {
    supabaseClient = (window as any)[GLOBAL_KEY]
    return
  }

  if (initialized) return
  initialized = true

  try {
    const { createBrowserClient } = require("@supabase/ssr")
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: "sb-cookincap-auth",
        },
      },
    )
    // Store globally
    if (typeof window !== "undefined") {
      ;(window as any)[GLOBAL_KEY] = supabaseClient
    }
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
