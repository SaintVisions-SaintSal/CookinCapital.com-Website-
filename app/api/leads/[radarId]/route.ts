/** Single scored lead. Operator-only. */
import { NextResponse } from "next/server"
import { requireOperator } from "@/lib/intelligence/api"
import { storage } from "@/lib/intelligence/store"

export async function GET(_req: Request, { params }: { params: Promise<{ radarId: string }> }) {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  const { radarId } = await params
  const lead = await storage.getLead(radarId)
  if (!lead) return NextResponse.json({ message: "Lead not found in the pipeline." }, { status: 404 })
  return NextResponse.json(lead)
}

