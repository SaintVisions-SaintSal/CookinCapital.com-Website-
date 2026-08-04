/** PUBLIC — property card. Every field RentCast-sourced or derived. */
import { NextResponse } from "next/server"
import { getProperty } from "@/lib/intelligence/store"

export async function GET(_req: Request, { params }: { params: Promise<{ rcId: string }> }) {
  const { rcId } = await params
  const p = getProperty(decodeURIComponent(rcId))
  if (!p) return NextResponse.json({ message: "Property not in the corpus." }, { status: 404 })
  return NextResponse.json(p)
}

