import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Get user's saved deals
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // RLS policy ensures user only sees their own deals
  const { data, error } = await supabase.from("user_deals").select("*").order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deals: data })
}

// Save a deal to user's library
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  // Validate required fields
  if (!body.deal_name || !body.property_address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // RLS policy ensures deal is associated with current user
  const { data, error } = await supabase
    .from("user_deals")
    .insert({
      ...body,
      user_id: user.id, // Ensure user_id is set server-side
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deal: data }, { status: 201 })
}

// Delete a user's deal
export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dealId = searchParams.get("id")

  if (!dealId) {
    return NextResponse.json({ error: "Deal ID required" }, { status: 400 })
  }

  // RLS policy ensures user can only delete their own deals
  const { error } = await supabase.from("user_deals").delete().eq("id", dealId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
