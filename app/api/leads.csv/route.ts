/** 25-column CSV export of the scored pipeline. Operator-only. */
import { NextResponse } from "next/server"
import { requireOperator } from "@/lib/intelligence/api"
import { storage } from "@/lib/intelligence/store"

const HEADER = [
  "radar_id","score","tier","address","city","state","zip","propertyradar_avm","rentcast_avm",
  "rentcast_rent","equity_percent","available_equity","total_loan_balance","cap_rate","ltv",
  "foreclosure_stage","signals","screen","equity_pts","distress_pts","spread_pts","timing_pts",
  "contact_pts","approved_for_outreach","reasons",
]

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET() {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  const rows = await storage.listLeads()
  const lines = [HEADER.join(",")]
  for (const l of rows) {
    lines.push(
      [
        l.radarId, l.score, l.tier, l.address, l.city, l.state, l.zip, l.avm,
        l.enriched?.rentcastAvm ?? "", l.enriched?.rentcastRent ?? "", l.equityPercent,
        l.availableEquity, l.totalLoanBalance,
        l.enriched?.capRate != null ? (l.enriched.capRate * 100).toFixed(2) : "",
        l.enriched?.ltv != null ? (l.enriched.ltv * 100).toFixed(1) : "",
        l.foreclosureStage, l.signals.join(" | "), l.screenKey,
        l.breakdown?.equity ?? "", l.breakdown?.distress ?? "", l.breakdown?.dealSpread ?? "",
        l.breakdown?.timing ?? "", l.breakdown?.contactability ?? "",
        l.approvedForOutreach ? "yes" : "no", l.reasons.join(" | "),
      ]
        .map(esc)
        .join(","),
    )
  }
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cookincapital-pipeline-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  })
}

