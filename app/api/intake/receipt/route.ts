import { NextResponse } from "next/server"
import { z } from "zod"
import { intakeDatabase, secretMatches } from "@/lib/intake/server"

const receiptSchema = z.object({
  eventId: z.string().uuid(),
  contactId: z.string().regex(/^[a-zA-Z0-9_-]{8,100}$/),
  opportunityId: z.string().regex(/^[a-zA-Z0-9_-]{8,100}$/).optional(),
}).strict()

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-cc-receipt-secret"), process.env.CC_GHL_RECEIPT_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const parsed = receiptSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: "Invalid receipt." }, { status: 400 })
    const db = intakeDatabase()
    const { data: event, error } = await db.from("cc_intake_outbox").select("event_type,payload,state,ghl_contact_id,ghl_opportunity_id")
      .eq("id", parsed.data.eventId).maybeSingle()
    if (error) throw error
    if (!event) return NextResponse.json({ error: "Unknown event." }, { status: 404 })
    if (event.event_type === "inquiry" && event.payload.purpose === "capital" && !parsed.data.opportunityId) {
      return NextResponse.json({ error: "Capital inquiries require an opportunity receipt." }, { status: 422 })
    }
    if (event.state === "confirmed") {
      const matches = event.ghl_contact_id === parsed.data.contactId &&
        (event.ghl_opportunity_id || null) === (parsed.data.opportunityId || null)
      return NextResponse.json({ confirmed: matches }, { status: matches ? 200 : 409 })
    }
    const { data: updated, error: updateError } = await db.from("cc_intake_outbox").update({
      state: "confirmed", ghl_contact_id: parsed.data.contactId,
      ghl_opportunity_id: parsed.data.opportunityId || null,
      updated_at: new Date().toISOString(), last_error: null, lease_id: null, lease_until: null,
    }).eq("id", parsed.data.eventId).in("state", ["processing", "accepted", "failed"]).select("id")
    if (updateError) throw updateError
    if (!updated?.length) return NextResponse.json({ error: "Event is not ready for confirmation." }, { status: 409 })
    return NextResponse.json({ confirmed: true })
  } catch {
    return NextResponse.json({ error: "Receipt was not recorded." }, { status: 503 })
  }
}
