import { type NextRequest, NextResponse } from "next/server"
import { searchPropertiesAdvanced, mapToPropertyResult, type PropertySearchParams } from "@/lib/propertyradar"
import { scoreBatch, CAMPAIGN_TEMPLATES, type CampaignConfig, type CampaignResult, type CampaignType } from "@/lib/saint-lead"

/**
 * POST /api/campaigns - Run a campaign
 * Body: { type: CampaignType, state: string, city?: string, zip?: string, overrides?: Partial<CampaignConfig["search"]> }
 */
export async function POST(request: NextRequest) {
  const PROPERTYRADAR_API_KEY = process.env.PROPERTYRADAR_API_KEY
  if (!PROPERTYRADAR_API_KEY) {
    return NextResponse.json({ error: "PropertyRadar API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const campaignType = body.type as CampaignType
    const template = CAMPAIGN_TEMPLATES[campaignType]

    if (!template) {
      return NextResponse.json({ error: `Unknown campaign type: ${campaignType}` }, { status: 400 })
    }

    const startedAt = new Date().toISOString()

    // Merge template defaults with user overrides
    const searchConfig = {
      ...template.defaultSearch,
      ...body.overrides,
      state: body.state || body.overrides?.state || "CA",
      city: body.city || body.overrides?.city || undefined,
      zip: body.zip || body.overrides?.zip || undefined,
      county: body.county || body.overrides?.county || undefined,
    }

    // Build PropertyRadar search params
    const prParams: PropertySearchParams = {
      state: searchConfig.state,
      city: searchConfig.city,
      zip: searchConfig.zip,
      county: searchConfig.county,
      propertyType: searchConfig.propertyType,
      equityMin: searchConfig.equityMin,
      equityMax: searchConfig.equityMax,
      valueMin: searchConfig.valueMin,
      valueMax: searchConfig.valueMax,
      foreclosure: searchConfig.foreclosure,
      foreclosureStage: searchConfig.foreclosureStage,
      taxDelinquent: searchConfig.taxDelinquent,
      bankruptcy: searchConfig.bankruptcy,
      divorce: searchConfig.divorce,
      vacant: searchConfig.vacant,
      deceased: searchConfig.deceased,
      ownerOccupied: searchConfig.ownerOccupied,
      absenteeOwner: searchConfig.absenteeOwner,
      listedForSale: searchConfig.listedForSale,
      limit: Math.min(searchConfig.limit || 50, 100),
      purchase: 1,
    }

    console.log("[v0] Campaign search:", campaignType, JSON.stringify(prParams))

    // Execute search
    const { properties, resultCount } = await searchPropertiesAdvanced(prParams)

    // Map to standard format and score
    const mapped = properties.map(mapToPropertyResult)
    const { leads, gradeSummary, topUseCases, avgScore } = scoreBatch(
      mapped as Record<string, unknown>[],
      template.scoring,
    )

    const result: CampaignResult = {
      campaignName: template.name,
      campaignType,
      startedAt,
      completedAt: new Date().toISOString(),
      totalFound: resultCount,
      totalScored: leads.length,
      gradeSummary,
      topUseCases,
      leads,
      errors: [],
    }

    return NextResponse.json({
      ...result,
      avgScore,
      searchConfig,
    })
  } catch (error) {
    console.error("Campaign execution error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Campaign failed" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/campaigns - List available campaign templates
 */
export async function GET() {
  const templates = Object.entries(CAMPAIGN_TEMPLATES).map(([key, val]) => ({
    type: key,
    name: val.name,
    description: val.description,
    icon: val.icon,
    defaultSearch: val.defaultSearch,
  }))

  return NextResponse.json({ campaigns: templates })
}
