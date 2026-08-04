/**
 * Outreach approval. Re-evaluates the gate server side and returns 409 if any
 * check is failing — the UI button being enabled is not the control.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireOperator } from "@/lib/intelligence/api"
import { evaluateCompliance } from "@/lib/intelligence/compliance"
import { storage } from "@/lib/intelligence/store"

export async function POST(req: Request, { params }: { params: Promise<{ radarId: string }> }) {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  const { radarId } = await params
  const lead = await storage.getLead(radarId)
  if (!lead) return NextResponse.json({ message: "Lead not found in the pipeline." }, { status: 404 })

  const raw = (lead.enriched?.raw ?? {}) as Record<string, unknown>
  const gate = evaluateCompliance({
    radarId: lead.radarId,
    address: lead.address,
    state: lead.state,
    hasOwnerPhone: raw.hasOwnerPhone === 1 || raw.PhoneAvailability === "available",
    hasOwnerMobilePhone: raw.hasOwnerMobilePhone === 1,
    approvedForOutreach: lead.approvedForOutreach,
  })
  if (!gate.clearedForOutreach) {
    return NextResponse.json(
      {
        message:
          "Outreach approval is blocked: one or more compliance checks are failing. Resolve them before approving.",
        kind: "blocked",
        gate,
      },
      { status: 409 },
    )
  }
  const body = z.object({ approved: z.boolean().default(true) }).parse(await req.json().catch(() => ({})))
  const updated = await storage.setApproval(lead.radarId, body.approved)
  return NextResponse.json({ ...gate, approvedForOutreach: updated?.approvedForOutreach ?? false })
}

