import { NextResponse } from "next/server"
import { forwardEvent, workflowURL } from "@/lib/intake/contracts"
import { intakeDatabase, secretMatches } from "@/lib/intake/server"

export const maxDuration = 60

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!secretMatches(authorization?.startsWith("Bearer ") ? authorization.slice(7) : null, process.env.CC_INTAKE_DISPATCH_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const url = workflowURL(process.env.CC_GHL_INTAKE_WEBHOOK_URL, process.env.GHL_LOCATION_ID)
  if (process.env.CC_CRM_DELIVERY_ENABLED !== "true" || !url) {
    return NextResponse.json({ error: "CRM dispatch is not enabled or routing is unverified." }, { status: 503 })
  }
  try {
    const db = intakeDatabase()
    const { data: events, error } = await db.rpc("cc_claim_intake")
    if (error) throw error
    let accepted = 0, failed = 0
    for (const event of events || []) {
      const result = await forwardEvent(url, event)
      const { error: writeError } = await db.from("cc_intake_outbox").update({
        state: result.accepted ? "accepted" : "failed",
        last_error: result.errorCode, updated_at: new Date().toISOString(),
        lease_id: null, lease_until: null,
      }).eq("id", event.id).eq("state", "processing").eq("lease_id", event.lease_id)
      if (writeError) throw writeError
      if (result.accepted) accepted++; else failed++
    }
    return NextResponse.json({ acceptedByWorkflow: accepted, failed, crmCompletion: "Requires signed workflow receipt." })
  } catch {
    return NextResponse.json({ error: "Dispatch could not be confirmed. Review the intake exception queue." }, { status: 503 })
  }
}
