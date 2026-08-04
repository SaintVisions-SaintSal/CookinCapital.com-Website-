/** The verified PropertyRadar criteria vocabulary the builder may use. Operator-only. */
import { NextResponse } from "next/server"
import { requireOperator, MAX_DRAW, DEFAULT_COUNTY_FIPS } from "@/lib/intelligence/api"
import {
  COUNTY_OPTIONS,
  STATE_ORDER,
  FORECLOSURE_STAGES,
  PROPERTY_TYPES,
  DISTRESS_TOGGLES,
  CONTACT_TOGGLES,
  OCCUPANCY_OPTIONS,
} from "@/lib/intelligence/catalog"
import { ASSUMPTIONS } from "@/lib/intelligence/metrics"

export async function GET() {
  const auth = await requireOperator()
  if (!auth.ok) return auth.response
  return NextResponse.json({
    counties: COUNTY_OPTIONS,
    stateOrder: STATE_ORDER,
    foreclosureStages: FORECLOSURE_STAGES,
    propertyTypes: PROPERTY_TYPES,
    distressToggles: DISTRESS_TOGGLES,
    contactToggles: CONTACT_TOGGLES,
    occupancyOptions: OCCUPANCY_OPTIONS,
    defaultCounty: DEFAULT_COUNTY_FIPS,
    maxDraw: MAX_DRAW,
    assumptions: ASSUMPTIONS,
  })
}

