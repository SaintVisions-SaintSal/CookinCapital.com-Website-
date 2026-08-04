/** Scored pipeline. Carries PropertyRadar fields — operator-only. */
import { NextResponse } from "next/server"
import { requireOperator } from "@/lib/intelligence/api"
import { storage } from "@/lib/intelligence/store"

export async function GET() {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  return NextResponse.json(await storage.listLeads())
}

