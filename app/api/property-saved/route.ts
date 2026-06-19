import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { PropertyResult, SavedPropertyItem } from "@/lib/property/types"

function mapRow(row: Record<string, unknown>): SavedPropertyItem {
  const metadata = (row.metadata as Record<string, unknown>) || {}
  return {
    id: String(row.id),
    radarId: String(metadata.radarId || row.id),
    address: String(metadata.address || row.property_address || ""),
    city: String(metadata.city || ""),
    state: String(metadata.state || ""),
    zip: String(metadata.zip || ""),
    value: metadata.value as number | undefined,
    imageUrl: metadata.imageUrl as string | undefined,
    savedAt: String(row.created_at || new Date().toISOString()),
  }
}

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ favorites: [], authenticated: false })
  }

  const { data, error } = await supabase
    .from("saintsal_analytics")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_type", "property_favorite")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    authenticated: true,
    favorites: (data || []).map(mapRow),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const property = body.property as PropertyResult | undefined

  if (!property?.radarId) {
    return NextResponse.json({ error: "Property with radarId is required" }, { status: 400 })
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ saved: false, local: true })
  }

  const { data: existing } = await supabase
    .from("saintsal_analytics")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_type", "property_favorite")
    .contains("metadata", { radarId: property.radarId })
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ saved: true, item: existing })
  }

  const { data, error } = await supabase
    .from("saintsal_analytics")
    .insert({
      user_id: user.id,
      event_type: "property_favorite",
      event_source: "property_search",
      property_address: property.address,
      metadata: {
        radarId: property.radarId,
        address: property.address,
        city: property.city,
        state: property.state,
        zip: property.zip,
        value: property.value,
        imageUrl: property.imageUrl,
      },
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ saved: true, item: mapRow(data) }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const radarId = request.nextUrl.searchParams.get("radarId")
  if (!radarId) {
    return NextResponse.json({ error: "radarId is required" }, { status: 400 })
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ deleted: false, local: true })
  }

  const { error } = await supabase
    .from("saintsal_analytics")
    .delete()
    .eq("user_id", user.id)
    .eq("event_type", "property_favorite")
    .contains("metadata", { radarId })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
