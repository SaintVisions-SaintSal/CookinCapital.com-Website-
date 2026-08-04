/** PUBLIC — licence + field-count manifest behind the governance panel. */
import { NextResponse } from "next/server"
import { FIELD_SOURCE, LICENCE_NOTE } from "@/lib/provenance"
import { corpusStats } from "@/lib/intelligence/store"

export async function GET() {
  const buckets: Record<string, string[]> = { rentcast: [], propertyradar: [], derived: [] }
  for (const [field, source] of Object.entries(FIELD_SOURCE)) buckets[source]?.push(field)
  return NextResponse.json({
    licences: LICENCE_NOTE,
    fields: buckets,
    counts: {
      rentcast: buckets.rentcast!.length,
      propertyradar: buckets.propertyradar!.length,
      derived: buckets.derived!.length,
    },
    corpus: corpusStats(),
    enforcement:
      "Provenance is enforced at render time by assertPublicSafe() in lib/provenance.ts — a PropertyRadar-tagged field reaching a component declared public throws in development and is redacted in production. Server side, every route that can emit a PropertyRadar field calls requireOperator().",
  })
}

