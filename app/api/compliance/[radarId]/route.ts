/** Compliance gate evaluation — four statutory checks with citations. Operator-only. */
import { NextResponse } from "next/server"
import { requireOperator } from "@/lib/intelligence/api"
import { evaluateCompliance } from "@/lib/intelligence/compliance"
import { storage } from "@/lib/intelligence/store"

export async function GET(_req: Request, { params }: { params: Promise<{ radarId: string }> }) {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  const { radarId } = await params
  const lead = await storage.getLead(radarId)
  if (!lead) return NextResponse.json({ message: "Lead not found in the pipeline." }, { status: 404 })
  const raw = (lead.enriched?.raw ?? {}) as Record<string, unknown>
  return NextResponse.json(
    evaluateCompliance({
      radarId: lead.radarId,
      address: [lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(", "),
      state: lead.state,
      hasOwnerPhone: raw.hasOwnerPhone === 1 || raw.PhoneAvailability === "available",
      hasOwnerMobilePhone: raw.hasOwnerMobilePhone === 1,
      approvedForOutreach: lead.approvedForOutreach,
    }),
  )
}

