/**
 * SAINT LEAD ENGINE
 * Lead scoring, campaign templates, and enrichment pipeline
 * Integrates PropertyRadar data with AI-powered lead grading
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeadProperty {
  radarId?: string
  address: string
  city: string
  state: string
  zip: string
  county?: string
  apn?: string
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
  lotSize?: number
  yearBuilt?: number
  units?: number
}

export interface LeadFinancial {
  estimatedValue?: number
  equityPercent?: number
  equityAmount?: number
  loanBalance?: number
  loanRate?: number
  loanRateType?: string
  loanType?: string
  loanTerm?: string
  cltv?: number
  mortgageLender?: string
  assessedValue?: number
  annualTaxes?: number
  listPrice?: number
  lastSalePrice?: number
  lastSaleDate?: string
}

export interface LeadOwner {
  name?: string
  ownerType?: string
  yearsOwned?: number
  ownerOccupied?: boolean
  mailAddress?: string
  mailCity?: string
  mailState?: string
  mailZip?: string
  numberOfProperties?: number
  deceased?: boolean
  age?: number
}

export interface LeadDistress {
  foreclosure?: boolean
  foreclosureStage?: string
  auctionDate?: string
  openingBid?: number
  defaultAmount?: number
  nod?: boolean
  taxDelinquent?: boolean
  taxDelinquentYears?: number
  taxDelinquentAmount?: number
  bankruptcy?: boolean
  bankruptcyChapter?: string
  bankruptcyStatus?: string
  divorce?: boolean
  divorceDate?: string
  vacant?: boolean
  lien?: boolean
  lienAmount?: number
}

export interface LeadContact {
  phone?: string
  email?: string
  linkedinUrl?: string
  jobTitle?: string
  company?: string
}

export interface EnrichedLead {
  radarId: string
  property: LeadProperty
  financial: LeadFinancial
  owner: LeadOwner
  distress: LeadDistress
  contact?: LeadContact
  // Scoring
  leadScore: number         // 0-100
  leadGrade: "A" | "B" | "C" | "D" | "F"
  motivationScore: number   // 1-10
  primaryUseCase: string
  bestProductFit: string
  outreachScript?: string
  // Meta
  source: string
  scoredAt: string
}

export type CampaignType =
  | "distressed_equity"
  | "arm_refi"
  | "investor_portfolio"
  | "fix_and_flip"
  | "senior_homeowners"
  | "pre_foreclosure"
  | "commercial_lending"
  | "free_and_clear"
  | "custom"
  // Elite Tier Campaigns
  | "elite_pre_foreclosure"
  | "elite_tax_delinquent"
  | "elite_probate"
  | "elite_absentee_longhold"
  | "elite_senior_free_clear"
  | "elite_divorce"
  | "elite_cash_buyers"
  | "elite_rent_burdened"

export type EliteTier = "tier1" | "tier2" | "tier3"

export interface StackedListResult {
  leads: EnrichedLead[]
  stackDepth: Record<number, number> // how many leads at each stack depth (1,2,3,4,5+)
  totalFound: number
  avgStackDepth: number
  hotLeads: EnrichedLead[]  // leads with 3+ stacked criteria
}

export interface CampaignConfig {
  name: string
  type: CampaignType
  description: string
  icon: string // lucide icon name
  // PropertyRadar search params
  search: {
    state?: string
    city?: string
    zip?: string
    county?: string
    // Property
    propertyType?: string
    // Financial
    equityMin?: number
    equityMax?: number
    valueMin?: number
    valueMax?: number
    // Distress
    foreclosure?: boolean
    foreclosureStage?: string
    taxDelinquent?: boolean
    bankruptcy?: boolean
    divorce?: boolean
    vacant?: boolean
    deceased?: boolean
    // Owner
    ownerOccupied?: boolean
    absenteeOwner?: boolean
    // Listing
    listedForSale?: boolean
    // Limits
    limit?: number
  }
  // Lead scoring weights
  scoring?: Partial<ScoringWeights>
}

export interface CampaignResult {
  campaignName: string
  campaignType: CampaignType
  startedAt: string
  completedAt: string
  totalFound: number
  totalScored: number
  gradeSummary: Record<string, number>
  topUseCases: string[]
  leads: EnrichedLead[]
  errors: string[]
}

// ---------------------------------------------------------------------------
// Scoring Engine
// ---------------------------------------------------------------------------

export interface ScoringWeights {
  equity: number       // Weight for equity % (0-25)
  distress: number     // Weight for distress signals (0-30)
  motivation: number   // Weight for motivation signals (0-20)
  property: number     // Weight for property characteristics (0-15)
  timing: number       // Weight for market timing (0-10)
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  equity: 25,
  distress: 30,
  motivation: 20,
  property: 15,
  timing: 10,
}

/**
 * Score a single property record into an EnrichedLead
 */
export function scoreProperty(
  raw: Record<string, unknown>,
  weights: Partial<ScoringWeights> = {},
): EnrichedLead {
  const w = { ...DEFAULT_WEIGHTS, ...weights }

  // Extract property data
  const property: LeadProperty = {
    radarId: str(raw.radarId),
    address: str(raw.address) || "Unknown",
    city: str(raw.city) || "",
    state: str(raw.state) || "",
    zip: str(raw.zip) || "",
    county: str(raw.county),
    apn: str(raw.apn),
    propertyType: str(raw.propertyType),
    beds: num(raw.beds),
    baths: num(raw.baths),
    sqft: num(raw.sqft),
    lotSize: num(raw.lotSize),
    yearBuilt: num(raw.yearBuilt),
    units: num(raw.units),
  }

  const financial: LeadFinancial = {
    estimatedValue: num(raw.value),
    equityPercent: num(raw.equityPercent),
    equityAmount: num(raw.equity) || num(raw.availableEquity),
    loanBalance: num(raw.loanBalance),
    loanRate: num(raw.loanRate),
    loanType: str(raw.loanType),
    cltv: num(raw.cltv),
    assessedValue: num(raw.assessedValue),
    annualTaxes: num(raw.annualTaxes),
    listPrice: num(raw.listPrice),
    lastSalePrice: num(raw.lastSalePrice),
    lastSaleDate: str(raw.lastSaleDate),
  }

  const owner: LeadOwner = {
    name: str(raw.ownerName),
    yearsOwned: num(raw.yearsOwned),
    ownerOccupied: raw.ownerOccupied !== undefined ? raw.ownerOccupied === true || raw.ownerOccupied === "Yes" : undefined,
    mailAddress: str(raw.ownerAddress),
    mailCity: str(raw.ownerCity),
    mailState: str(raw.ownerState),
    mailZip: str(raw.ownerZip),
    deceased: raw.isDeceased === true,
  }

  const distress: LeadDistress = {
    foreclosure: !!raw.foreclosureStatus,
    foreclosureStage: str(raw.foreclosureStatus),
    auctionDate: str(raw.foreclosureAuctionDate),
    openingBid: num(raw.foreclosureOpeningBid),
    defaultAmount: num(raw.defaultAmount),
    taxDelinquent: (num(raw.taxDefaultYears) || 0) > 0,
    taxDelinquentYears: num(raw.taxDefaultYears),
    taxDelinquentAmount: num(raw.taxDefaultAmount),
    bankruptcy: raw.inBankruptcy === true,
    bankruptcyChapter: str(raw.bankruptcyChapter),
    bankruptcyStatus: str(raw.bankruptcyStatus),
    divorce: raw.inDivorce === true,
    divorceDate: str(raw.divorceRecordingDate),
    vacant: raw.isVacant === true,
    lien: raw.hasLiens === true,
    lienAmount: num(raw.lienAmount),
  }

  // --- Calculate scores ---
  let equityScore = 0
  const ep = financial.equityPercent || 0
  if (ep >= 70) equityScore = w.equity
  else if (ep >= 50) equityScore = w.equity * 0.8
  else if (ep >= 30) equityScore = w.equity * 0.6
  else if (ep >= 20) equityScore = w.equity * 0.4
  else if (ep >= 10) equityScore = w.equity * 0.2

  let distressScore = 0
  const distressSignals = [
    distress.foreclosure,
    distress.taxDelinquent,
    distress.bankruptcy,
    distress.divorce,
    distress.vacant,
    distress.lien,
    owner.deceased,
  ].filter(Boolean).length
  distressScore = Math.min(w.distress, (distressSignals / 3) * w.distress)

  let motivationScore = 0
  if ((owner.yearsOwned || 0) >= 10) motivationScore += w.motivation * 0.3
  if ((owner.yearsOwned || 0) >= 20) motivationScore += w.motivation * 0.2
  if (distress.vacant) motivationScore += w.motivation * 0.2
  if (owner.deceased) motivationScore += w.motivation * 0.3
  if (distress.foreclosure) motivationScore += w.motivation * 0.3
  motivationScore = Math.min(w.motivation, motivationScore)

  let propertyScore = 0
  const value = financial.estimatedValue || 0
  if (value >= 100_000 && value <= 1_500_000) propertyScore += w.property * 0.5 // Sweet spot
  if (property.sqft && property.sqft >= 800) propertyScore += w.property * 0.25
  if (property.beds && property.beds >= 2) propertyScore += w.property * 0.25

  let timingScore = 0
  if (distress.auctionDate) {
    const daysUntil = (new Date(distress.auctionDate).getTime() - Date.now()) / 86400000
    if (daysUntil > 0 && daysUntil < 30) timingScore = w.timing // Urgent
    else if (daysUntil > 0 && daysUntil < 90) timingScore = w.timing * 0.6
  }
  if ((num(raw.daysOnMarket) || 0) > 90) timingScore = Math.max(timingScore, w.timing * 0.5) // Stale listing

  const totalScore = Math.min(100, Math.round(equityScore + distressScore + motivationScore + propertyScore + timingScore))

  // Grade
  const leadGrade: EnrichedLead["leadGrade"] =
    totalScore >= 80 ? "A" :
    totalScore >= 60 ? "B" :
    totalScore >= 40 ? "C" :
    totalScore >= 20 ? "D" : "F"

  // Use case detection
  const primaryUseCase = detectUseCase(financial, distress, owner, property)
  const bestProductFit = detectProductFit(financial, distress, owner)

  // Motivation (1-10)
  const motiv = Math.max(1, Math.min(10, Math.round(totalScore / 10)))

  return {
    radarId: property.radarId || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    property,
    financial,
    owner,
    distress,
    leadScore: totalScore,
    leadGrade,
    motivationScore: motiv,
    primaryUseCase,
    bestProductFit,
    source: str(raw.source) || "PropertyRadar",
    scoredAt: new Date().toISOString(),
  }
}

/**
 * Score a batch of raw property results
 */
export function scoreBatch(
  properties: Record<string, unknown>[],
  weights?: Partial<ScoringWeights>,
): {
  leads: EnrichedLead[]
  gradeSummary: Record<string, number>
  topUseCases: string[]
  avgScore: number
} {
  const leads = properties.map((p) => scoreProperty(p, weights))
  leads.sort((a, b) => b.leadScore - a.leadScore)

  const gradeSummary: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 }
  const useCaseCounts: Record<string, number> = {}

  for (const lead of leads) {
    gradeSummary[lead.leadGrade] = (gradeSummary[lead.leadGrade] || 0) + 1
    useCaseCounts[lead.primaryUseCase] = (useCaseCounts[lead.primaryUseCase] || 0) + 1
  }

  const topUseCases = Object.entries(useCaseCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([uc]) => uc)

  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.leadScore, 0) / leads.length) : 0

  return { leads, gradeSummary, topUseCases, avgScore }
}

// ---------------------------------------------------------------------------
// Use Case & Product Detection
// ---------------------------------------------------------------------------

function detectUseCase(
  financial: LeadFinancial,
  distress: LeadDistress,
  owner: LeadOwner,
  property: LeadProperty,
): string {
  if (distress.foreclosure) {
    if (distress.foreclosureStage?.includes("Auction")) return "Auction Acquisition"
    return "Pre-Foreclosure Deal"
  }
  if (distress.vacancy || distress.vacant) return "Fix & Flip"
  if (distress.taxDelinquent) return "Tax Lien Opportunity"
  if (owner.deceased) return "Probate / Estate Sale"
  if (distress.divorce) return "Divorce Sale"
  if (distress.bankruptcy) return "Bankruptcy Sale"
  if ((financial.equityPercent || 0) >= 60 && (owner.yearsOwned || 0) >= 15) return "Cash-Out Refi"
  if ((financial.equityPercent || 0) >= 50 && !owner.ownerOccupied) return "Portfolio Liquidation"
  if ((financial.loanRate || 0) > 6.5) return "Rate Reduction Refi"
  if (property.propertyType === "COM" || property.propertyType === "IND") return "Commercial Lending"
  if ((owner.yearsOwned || 0) >= 20) return "Long-Hold Equity Play"
  return "General Opportunity"
}

function detectProductFit(
  financial: LeadFinancial,
  distress: LeadDistress,
  owner: LeadOwner,
): string {
  if (distress.foreclosure) return "Bridge Loan"
  if (distress.taxDelinquent) return "Hard Money"
  if ((financial.equityPercent || 0) >= 50) return "Cash-Out Refi"
  if ((financial.loanRate || 0) > 6.5) return "Rate & Term Refi"
  if (!owner.ownerOccupied) return "DSCR Loan"
  if (distress.bankruptcy || distress.divorce) return "Hard Money"
  return "Conventional Refi"
}

// ---------------------------------------------------------------------------
// Campaign Templates
// ---------------------------------------------------------------------------

export const CAMPAIGN_TEMPLATES: Record<CampaignType, Omit<CampaignConfig, "search"> & { defaultSearch: CampaignConfig["search"] }> = {
  distressed_equity: {
    name: "Distressed High Equity",
    type: "distressed_equity",
    description: "High equity owners facing foreclosure, tax liens, or other distress. The prime hard money & bridge loan targets.",
    icon: "AlertTriangle",
    defaultSearch: {
      equityMin: 30,
      foreclosure: true,
      taxDelinquent: true,
      limit: 50,
    },
    scoring: { distress: 30, equity: 25, motivation: 20 },
  },
  arm_refi: {
    name: "ARM Refi Targets",
    type: "arm_refi",
    description: "Adjustable rate mortgage holders with equity. Rate shock creates urgency to refinance.",
    icon: "TrendingUp",
    defaultSearch: {
      equityMin: 20,
      ownerOccupied: true,
      limit: 50,
    },
    scoring: { equity: 25, timing: 15, motivation: 20 },
  },
  investor_portfolio: {
    name: "Investor Portfolio",
    type: "investor_portfolio",
    description: "Non-owner occupied high equity properties. Landlords ready to sell, refi, or cash out.",
    icon: "Building2",
    defaultSearch: {
      equityMin: 40,
      absenteeOwner: true,
      limit: 50,
    },
    scoring: { equity: 30, property: 20, motivation: 15 },
  },
  fix_and_flip: {
    name: "Fix & Flip Pipeline",
    type: "fix_and_flip",
    description: "Vacant distressed properties in the value sweet spot for rehab deals.",
    icon: "Hammer",
    defaultSearch: {
      vacant: true,
      valueMin: 100000,
      valueMax: 750000,
      limit: 50,
    },
    scoring: { distress: 30, property: 25, timing: 15 },
  },
  senior_homeowners: {
    name: "Senior Homeowners",
    type: "senior_homeowners",
    description: "Long-term owner-occupied homeowners with high equity. Reverse mortgage & estate planning targets.",
    icon: "Heart",
    defaultSearch: {
      equityMin: 50,
      ownerOccupied: true,
      limit: 50,
    },
    scoring: { equity: 30, motivation: 25, timing: 10 },
  },
  pre_foreclosure: {
    name: "Pre-Foreclosure Goldmine",
    type: "pre_foreclosure",
    description: "Active pre-foreclosure notices with equity remaining. The most motivated sellers.",
    icon: "Gavel",
    defaultSearch: {
      foreclosure: true,
      foreclosureStage: "Preforeclosure",
      equityMin: 15,
      limit: 50,
    },
    scoring: { distress: 35, timing: 20, motivation: 20 },
  },
  commercial_lending: {
    name: "Commercial Lending",
    type: "commercial_lending",
    description: "Commercial property owners with maturing loans or high LTV. CookinCapital targets.",
    icon: "Landmark",
    defaultSearch: {
      propertyType: "COM",
      equityMin: 20,
      limit: 50,
    },
    scoring: { property: 25, equity: 25, timing: 15 },
  },
  free_and_clear: {
    name: "Free & Clear Owners",
    type: "free_and_clear",
    description: "Properties with no mortgage - 100% equity. HELOC, cash-out refi, and investment targets.",
    icon: "Shield",
    defaultSearch: {
      equityMin: 95,
      limit: 50,
    },
    scoring: { equity: 35, motivation: 20, property: 15 },
  },
  custom: {
    name: "Custom Campaign",
    type: "custom",
    description: "Build your own campaign with custom search criteria and scoring weights.",
    icon: "Settings",
    defaultSearch: { limit: 50 },
  },
}

// ---------------------------------------------------------------------------
// Elite Tier Campaign Templates (from the Elite Real Estate Lead Research Flow)
// ---------------------------------------------------------------------------

export const ELITE_CAMPAIGNS: {
  type: CampaignType
  tier: EliteTier
  name: string
  description: string
  whyItConverts: string
  responseRate: string
  icon: string
  accent: string
  defaultSearch: CampaignConfig["search"]
  scoring?: Partial<ScoringWeights>
}[] = [
  // TIER 1 - HOTTEST LEADS
  {
    type: "elite_pre_foreclosure",
    tier: "tier1",
    name: "Pre-Foreclosure Stack",
    description: "Owners facing foreclosure with $50K+ equity. Gun to their head - most motivated sellers on the planet.",
    whyItConverts: "Owner facing credit destruction + losing home. Response rate 3-5x above any other list.",
    responseRate: "3-5x normal",
    icon: "Gavel",
    accent: "text-red-400 bg-red-500/10 border-red-500/20",
    defaultSearch: {
      foreclosure: true,
      foreclosureStage: "Preforeclosure",
      equityMin: 20,
      propertyType: "SFR",
      ownerOccupied: true,
      limit: 50,
    },
    scoring: { distress: 35, timing: 20, motivation: 25 },
  },
  {
    type: "elite_tax_delinquent",
    tier: "tier1",
    name: "Tax Delinquent High Equity",
    description: "Behind on taxes 2+ years but sitting on 40%+ equity. County coming for them in 12-24 months.",
    whyItConverts: "Can't pay taxes but has equity. County is coming within 12-24 months.",
    responseRate: "4-6x normal",
    icon: "AlertTriangle",
    accent: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    defaultSearch: {
      taxDelinquent: true,
      equityMin: 40,
      limit: 50,
    },
    scoring: { distress: 30, equity: 25, timing: 20 },
  },
  {
    type: "elite_probate",
    tier: "tier1",
    name: "Probate / Inherited Property",
    description: "Heirs don't want the house - they want the cash. Average days to contract: 14-21.",
    whyItConverts: "Emotional detachment + carrying costs they don't want = motivated. Fast close.",
    responseRate: "3-4x normal",
    icon: "Shield",
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    defaultSearch: {
      deceased: true,
      equityMin: 30,
      propertyType: "SFR",
      limit: 50,
    },
    scoring: { motivation: 30, equity: 25, timing: 15 },
  },
  // TIER 2 - SMART MONEY
  {
    type: "elite_absentee_longhold",
    tier: "tier2",
    name: "Absentee Owner Long-Term Hold",
    description: "Out-of-state landlords holding 15+ years with 60%+ equity. Tired of managing remotely.",
    whyItConverts: "Bought cheap decades ago. Tired of managing. Getting them on the phone = deal.",
    responseRate: "2-3x normal",
    icon: "Building2",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    defaultSearch: {
      absenteeOwner: true,
      equityMin: 60,
      limit: 50,
    },
    scoring: { equity: 30, motivation: 25, property: 15 },
  },
  {
    type: "elite_senior_free_clear",
    tier: "tier2",
    name: "Senior Owner Free & Clear",
    description: "65+ years old, owns outright, fixed income. Often needs liquidity for medical or life transition.",
    whyItConverts: "Paid off. Has equity. Life changing. This is the list agents and investors fight over.",
    responseRate: "2-4x normal",
    icon: "Heart",
    accent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    defaultSearch: {
      equityMin: 90,
      ownerOccupied: true,
      propertyType: "SFR",
      limit: 50,
    },
    scoring: { equity: 35, motivation: 25, timing: 10 },
  },
  {
    type: "elite_divorce",
    tier: "tier2",
    name: "Divorce / Life Event",
    description: "Court-ordered sale or couple splitting assets. They need a decision NOW.",
    whyItConverts: "Court timelines and emotional urgency - best closing pressure you'll never have to manufacture.",
    responseRate: "2-3x normal",
    icon: "Users",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    defaultSearch: {
      divorce: true,
      equityMin: 30,
      propertyType: "SFR",
      limit: 50,
    },
    scoring: { distress: 30, timing: 25, motivation: 20 },
  },
  // TIER 3 - VOLUME PLAY
  {
    type: "elite_cash_buyers",
    tier: "tier3",
    name: "Cash Buyer Repeat Investors",
    description: "People buying deals RIGHT NOW with cash. These become YOUR buyers list for wholesaling.",
    whyItConverts: "Not sellers - they're your END BUYERS. Wholesale deals in 48 hours with this list.",
    responseRate: "Buyers list",
    icon: "DollarSign",
    accent: "text-green-400 bg-green-500/10 border-green-500/20",
    defaultSearch: {
      equityMin: 80,
      absenteeOwner: true,
      limit: 50,
    },
    scoring: { equity: 30, property: 25, motivation: 15 },
  },
  {
    type: "elite_rent_burdened",
    tier: "tier3",
    name: "High Equity Absentee - Rent Burdened",
    description: "Landlords getting squeezed by tenant protections + rising costs in hot markets.",
    whyItConverts: "Rising costs, tenant headaches, and sitting on equity. Ready to exit.",
    responseRate: "1.5-2x normal",
    icon: "Building2",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    defaultSearch: {
      absenteeOwner: true,
      equityMin: 50,
      limit: 50,
    },
    scoring: { equity: 25, motivation: 20, property: 20 },
  },
]

// ---------------------------------------------------------------------------
// List Stacking Engine - Multiple criteria on one property = HOT lead
// ---------------------------------------------------------------------------

/**
 * Calculate the "stack depth" for a lead - how many distress/motivation criteria it hits
 */
export function calculateStackDepth(lead: EnrichedLead): number {
  let depth = 0
  if (lead.distress.foreclosure) depth++
  if (lead.distress.taxDelinquent) depth++
  if (lead.distress.bankruptcy) depth++
  if (lead.distress.divorce) depth++
  if (lead.distress.vacant) depth++
  if (lead.distress.lien) depth++
  if (lead.owner.deceased) depth++
  if (!lead.owner.ownerOccupied) depth++ // absentee
  if ((lead.financial.equityPercent || 0) >= 60) depth++ // high equity
  if ((lead.owner.yearsOwned || 0) >= 10) depth++ // long-term hold
  return depth
}

/**
 * Stack and re-score leads based on criteria overlap.
 * The more criteria that stack on one property, the hotter the lead.
 * Response rates: single-criteria 2-4%, stacked 15-25%
 */
export function stackAndRescore(leads: EnrichedLead[]): StackedListResult {
  // Calculate stack depth for each lead
  const leadsWithStack = leads.map((lead) => {
    const depth = calculateStackDepth(lead)
    // Boost score based on stack depth (each additional criterion = +8 points, capped at 100)
    const boostedScore = Math.min(100, lead.leadScore + (depth - 1) * 8)
    const boostedGrade: EnrichedLead["leadGrade"] =
      boostedScore >= 80 ? "A" :
      boostedScore >= 60 ? "B" :
      boostedScore >= 40 ? "C" :
      boostedScore >= 20 ? "D" : "F"

    return {
      ...lead,
      leadScore: boostedScore,
      leadGrade: boostedGrade,
      motivationScore: Math.max(lead.motivationScore, Math.min(10, depth * 2)),
      stackDepth: depth,
    }
  })

  // Sort by stack depth first, then by score
  leadsWithStack.sort((a, b) => {
    if (b.stackDepth !== a.stackDepth) return b.stackDepth - a.stackDepth
    return b.leadScore - a.leadScore
  })

  // Calculate stack depth distribution
  const stackDepthDist: Record<number, number> = {}
  for (const l of leadsWithStack) {
    const d = l.stackDepth
    stackDepthDist[d] = (stackDepthDist[d] || 0) + 1
  }

  const avgDepth = leadsWithStack.length > 0
    ? leadsWithStack.reduce((s, l) => s + l.stackDepth, 0) / leadsWithStack.length
    : 0

  // Hot leads = 3+ stacked criteria (15-25% response rate)
  const hotLeads = leadsWithStack.filter((l) => l.stackDepth >= 3)

  return {
    leads: leadsWithStack,
    stackDepth: stackDepthDist,
    totalFound: leadsWithStack.length,
    avgStackDepth: Math.round(avgDepth * 10) / 10,
    hotLeads,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(val: unknown): string | undefined {
  if (typeof val === "string" && val) return val
  return undefined
}

function num(val: unknown): number | undefined {
  if (typeof val === "number" && !isNaN(val)) return val
  if (typeof val === "string") {
    const n = parseFloat(val)
    if (!isNaN(n)) return n
  }
  return undefined
}
