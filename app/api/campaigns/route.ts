import { type NextRequest, NextResponse } from "next/server"
import { searchPropertiesAdvanced, mapToPropertyResult, type PropertySearchParams } from "@/lib/propertyradar"
import {
  scoreBatch,
  stackAndRescore,
  CAMPAIGN_TEMPLATES,
  ELITE_CAMPAIGNS,
  type CampaignConfig,
  type CampaignResult,
  type CampaignType,
} from "@/lib/saint-lead"

/**
 * Build PropertyRadar search params from a config object
 */
function buildPRParams(searchConfig: Record<string, unknown>): PropertySearchParams {
  return {
    state: (searchConfig.state as string) || "CA",
    city: searchConfig.city as string | undefined,
    zip: searchConfig.zip as string | undefined,
    county: searchConfig.county as string | undefined,
    propertyType: searchConfig.propertyType as string | undefined,
    equityMin: searchConfig.equityMin as number | undefined,
    equityMax: searchConfig.equityMax as number | undefined,
    valueMin: searchConfig.valueMin as number | undefined,
    valueMax: searchConfig.valueMax as number | undefined,
    foreclosure: searchConfig.foreclosure as boolean | undefined,
    foreclosureStage: searchConfig.foreclosureStage as string | undefined,
    taxDelinquent: searchConfig.taxDelinquent as boolean | undefined,
    bankruptcy: searchConfig.bankruptcy as boolean | undefined,
    divorce: searchConfig.divorce as boolean | undefined,
    vacant: searchConfig.vacant as boolean | undefined,
    deceased: searchConfig.deceased as boolean | undefined,
    ownerOccupied: searchConfig.ownerOccupied as boolean | undefined,
    absenteeOwner: searchConfig.absenteeOwner as boolean | undefined,
    listedForSale: searchConfig.listedForSale as boolean | undefined,
    limit: Math.min((searchConfig.limit as number) || 50, 100),
    purchase: 1,
  }
}

/**
 * POST /api/campaigns - Run a campaign (standard or elite)
 * Body: {
 *   type: CampaignType,
 *   state: string,
 *   city?: string,
 *   zip?: string,
 *   overrides?: Partial<CampaignConfig["search"]>,
 *   enableStacking?: boolean  // Enable list stacking re-scoring
 * }
 */
export async function POST(request: NextRequest) {
  const PROPERTYRADAR_API_KEY = process.env.PROPERTYRADAR_API_KEY
  if (!PROPERTYRADAR_API_KEY) {
    return NextResponse.json({ error: "PropertyRadar API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const campaignType = body.type as CampaignType
    const enableStacking = body.enableStacking === true

    // Try standard templates first, then elite campaigns
    const standardTemplate = CAMPAIGN_TEMPLATES[campaignType]
    const eliteTemplate = ELITE_CAMPAIGNS.find((c) => c.type === campaignType)

    if (!standardTemplate && !eliteTemplate) {
      return NextResponse.json({ error: `Unknown campaign type: ${campaignType}` }, { status: 400 })
    }

    const startedAt = new Date().toISOString()

    const templateSearch = standardTemplate ? standardTemplate.defaultSearch : eliteTemplate!.defaultSearch
    const templateScoring = standardTemplate ? standardTemplate.scoring : eliteTemplate!.scoring
    const templateName = standardTemplate ? standardTemplate.name : eliteTemplate!.name

    // Merge template defaults with user overrides
    const searchConfig: Record<string, unknown> = {
      ...templateSearch,
      ...body.overrides,
      state: body.state || body.overrides?.state || "CA",
      city: body.city || body.overrides?.city || undefined,
      zip: body.zip || body.overrides?.zip || undefined,
      county: body.county || body.overrides?.county || undefined,
    }

    const prParams = buildPRParams(searchConfig)

    console.log("[Campaigns] Running:", campaignType, enableStacking ? "(stacking ON)" : "", JSON.stringify(prParams))

    // Execute search
    const { properties, resultCount } = await searchPropertiesAdvanced(prParams)

    // Map to standard format and score
    const mapped = properties.map(mapToPropertyResult)
    const { leads, gradeSummary, topUseCases, avgScore } = scoreBatch(
      mapped as Record<string, unknown>[],
      templateScoring,
    )

    // If stacking enabled, re-score based on criteria overlap
    let finalLeads = leads
    let stackingData = null
    if (enableStacking) {
      const stacked = stackAndRescore(leads)
      finalLeads = stacked.leads
      stackingData = {
        stackDepth: stacked.stackDepth,
        avgStackDepth: stacked.avgStackDepth,
        hotLeadCount: stacked.hotLeads.length,
      }

      // Recalculate grade summary after stacking
      const newGradeSummary: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 }
      for (const lead of finalLeads) {
        newGradeSummary[lead.leadGrade] = (newGradeSummary[lead.leadGrade] || 0) + 1
      }

      const result: CampaignResult & { avgScore: number; stackingData: unknown; tier?: string } = {
        campaignName: templateName,
        campaignType,
        startedAt,
        completedAt: new Date().toISOString(),
        totalFound: resultCount,
        totalScored: finalLeads.length,
        gradeSummary: newGradeSummary,
        topUseCases,
        leads: finalLeads,
        errors: [],
        avgScore: finalLeads.length > 0
          ? Math.round(finalLeads.reduce((s, l) => s + l.leadScore, 0) / finalLeads.length)
          : 0,
        stackingData,
        tier: eliteTemplate?.tier,
      }

      return NextResponse.json(result)
    }

    const result: CampaignResult & { avgScore: number; tier?: string } = {
      campaignName: templateName,
      campaignType,
      startedAt,
      completedAt: new Date().toISOString(),
      totalFound: resultCount,
      totalScored: leads.length,
      gradeSummary,
      topUseCases,
      leads: finalLeads,
      errors: [],
      avgScore,
      tier: eliteTemplate?.tier,
    }

    return NextResponse.json({
      ...result,
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
 * GET /api/campaigns - List available campaign templates (standard + elite)
 */
export async function GET() {
  const standard = Object.entries(CAMPAIGN_TEMPLATES).map(([key, val]) => ({
    type: key,
    name: val.name,
    description: val.description,
    icon: val.icon,
    defaultSearch: val.defaultSearch,
    category: "standard" as const,
  }))

  const elite = ELITE_CAMPAIGNS.map((c) => ({
    type: c.type,
    name: c.name,
    description: c.description,
    icon: c.icon,
    defaultSearch: c.defaultSearch,
    tier: c.tier,
    whyItConverts: c.whyItConverts,
    responseRate: c.responseRate,
    category: "elite" as const,
  }))

  return NextResponse.json({ campaigns: standard, eliteCampaigns: elite })
}
