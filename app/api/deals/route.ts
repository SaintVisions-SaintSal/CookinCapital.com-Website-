import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Get all deals (respects RLS)
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // RLS policies automatically filter based on user role
  const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deals: data })
}

// Create new deal (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "manager") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  const body = await request.json()

  // Use admin client to bypass RLS for creation
  const adminClient = await createAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }

  const { data, error } = await adminClient
    .from("deals")
    .insert({
      ...body,
      assigned_to: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deal: data }, { status: 201 })
}
