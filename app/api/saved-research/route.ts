import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Get user's saved research items
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch from saintsal_analytics where user saved items
  const { data, error } = await supabase
    .from("saintsal_analytics")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_type", "saved_research")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

// Save a research item (lead or property)
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Allow saving without auth using localStorage fallback on client
  const body = await request.json()

  // Validate required fields
  if (!body.item_type || !body.data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // If user is authenticated, save to database
  if (user) {
    const { data, error } = await supabase
      .from("saintsal_analytics")
      .insert({
        user_id: user.id,
        event_type: "saved_research",
        event_source: "research_hub",
        intent: body.item_type, // 'lead' or 'property'
        query: body.query || "",
        contact_name: body.data.name || body.data.ownerName || "",
        contact_email: body.data.email || body.data.ownerEmail || "",
        contact_phone: body.data.phone || body.data.ownerPhone || "",
        property_address: body.data.address || "",
        metadata: body.data,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data, saved: true }, { status: 201 })
  }

  // Return success for localStorage fallback
  return NextResponse.json({ saved: true, local: true }, { status: 201 })
}

// Delete a saved research item
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
  const itemId = searchParams.get("id")

  if (!itemId) {
    return NextResponse.json({ error: "Item ID required" }, { status: 400 })
  }

  const { error } = await supabase.from("saintsal_analytics").delete().eq("id", itemId).eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
