"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Target,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Heart,
  Landmark,
  Hammer,
  Building2,
  Settings,
  Gavel,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  Search,
  BedDouble,
  Bath,
  Square,
  User,
  Users,
  Calendar,
  DollarSign,
  Home,
  Calculator,
  CheckCircle2,
  Download,
  Copy,
  Check,
  AlertCircle,
  BarChart3,
  Zap,
  Layers,
  Flame,
  Crown,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnrichedLead {
  radarId: string
  property: {
    address: string
    city: string
    state: string
    zip: string
    county?: string
    propertyType?: string
    beds?: number
    baths?: number
    sqft?: number
    yearBuilt?: number
  }
  financial: {
    estimatedValue?: number
    equityPercent?: number
    equityAmount?: number
    loanBalance?: number
    loanRate?: number
    loanType?: string
    assessedValue?: number
    lastSalePrice?: number
    lastSaleDate?: string
    listPrice?: number
  }
  owner: {
    name?: string
    yearsOwned?: number
    ownerOccupied?: boolean
    mailAddress?: string
    mailCity?: string
    mailState?: string
    mailZip?: string
    deceased?: boolean
  }
  distress: {
    foreclosure?: boolean
    foreclosureStage?: string
    auctionDate?: string
    openingBid?: number
    taxDelinquent?: boolean
    taxDelinquentYears?: number
    taxDelinquentAmount?: number
    bankruptcy?: boolean
    bankruptcyChapter?: string
    divorce?: boolean
    vacant?: boolean
  }
  leadScore: number
  leadGrade: "A" | "B" | "C" | "D" | "F"
  motivationScore: number
  primaryUseCase: string
  bestProductFit: string
  source: string
  scoredAt: string
  stackDepth?: number
}

interface CampaignResult {
  campaignName: string
  campaignType: string
  startedAt: string
  completedAt: string
  totalFound: number
  totalScored: number
  gradeSummary: Record<string, number>
  topUseCases: string[]
  leads: EnrichedLead[]
  errors: string[]
  avgScore: number
  tier?: string
  stackingData?: {
    stackDepth: Record<number, number>
    avgStackDepth: number
    hotLeadCount: number
  }
}

// ---------------------------------------------------------------------------
// Elite Campaign Configs (client-side mirror)
// ---------------------------------------------------------------------------

type EliteTier = "tier1" | "tier2" | "tier3"

interface EliteCampaign {
  type: string
  tier: EliteTier
  name: string
  description: string
  whyItConverts: string
  responseRate: string
  icon: typeof AlertTriangle
  accent: string
}

const ICON_MAP: Record<string, typeof AlertTriangle> = {
  Gavel,
  AlertTriangle,
  Shield,
  Building2,
  Heart,
  Users,
  DollarSign,
  Hammer,
  TrendingUp,
  Landmark,
  Settings,
  Target,
}

const ELITE_CAMPAIGNS: EliteCampaign[] = [
  // TIER 1 - HOTTEST
  {
    type: "elite_pre_foreclosure",
    tier: "tier1",
    name: "Pre-Foreclosure Stack",
    description: "Owners facing foreclosure with equity. Most motivated sellers on the planet.",
    whyItConverts: "Owner facing credit destruction + losing home. Response rate 3-5x above any other list.",
    responseRate: "3-5x",
    icon: Gavel,
    accent: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  {
    type: "elite_tax_delinquent",
    tier: "tier1",
    name: "Tax Delinquent High Equity",
    description: "Behind on taxes but sitting on 40%+ equity. County coming for them.",
    whyItConverts: "Can't pay taxes but has equity. County coming within 12-24 months.",
    responseRate: "4-6x",
    icon: AlertTriangle,
    accent: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    type: "elite_probate",
    tier: "tier1",
    name: "Probate / Inherited",
    description: "Heirs don't want the house - they want the cash. Fast close.",
    whyItConverts: "Emotional detachment + carrying costs = motivated. Days to contract: 14-21.",
    responseRate: "3-4x",
    icon: Shield,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  // TIER 2 - SMART MONEY
  {
    type: "elite_absentee_longhold",
    tier: "tier2",
    name: "Absentee Long-Term Hold",
    description: "Out-of-state landlords holding 15+ years. Tired of managing remotely.",
    whyItConverts: "Bought cheap decades ago. Getting them on the phone = deal.",
    responseRate: "2-3x",
    icon: Building2,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    type: "elite_senior_free_clear",
    tier: "tier2",
    name: "Senior Free & Clear",
    description: "65+ years old, owns outright. Needs liquidity for life transition.",
    whyItConverts: "Paid off. Has equity. Life changing. The list agents fight over.",
    responseRate: "2-4x",
    icon: Heart,
    accent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
  {
    type: "elite_divorce",
    tier: "tier2",
    name: "Divorce / Life Event",
    description: "Court-ordered sale or splitting assets. Decision needed NOW.",
    whyItConverts: "Court timelines and emotional urgency = best closing pressure.",
    responseRate: "2-3x",
    icon: Users,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  // TIER 3 - VOLUME PLAY
  {
    type: "elite_cash_buyers",
    tier: "tier3",
    name: "Cash Buyer Investors",
    description: "People buying deals RIGHT NOW with cash. Your buyers list.",
    whyItConverts: "Not sellers - END BUYERS. Wholesale deals in 48 hours.",
    responseRate: "Buyers",
    icon: DollarSign,
    accent: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    type: "elite_rent_burdened",
    tier: "tier3",
    name: "Rent Burdened Absentee",
    description: "Landlords squeezed by costs in hot markets. Ready to exit.",
    whyItConverts: "Rising costs, tenant headaches, sitting on equity.",
    responseRate: "1.5-2x",
    icon: Building2,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
]

// Standard campaigns
const STANDARD_CAMPAIGNS: {
  type: string
  name: string
  description: string
  icon: typeof AlertTriangle
  accent: string
}[] = [
  { type: "distressed_equity", name: "Distressed High Equity", description: "High equity owners facing foreclosure, tax liens, or other distress.", icon: AlertTriangle, accent: "text-red-400 bg-red-500/10 border-red-500/20" },
  { type: "pre_foreclosure", name: "Pre-Foreclosure Goldmine", description: "Active pre-foreclosure notices with equity remaining.", icon: Gavel, accent: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { type: "fix_and_flip", name: "Fix & Flip Pipeline", description: "Vacant distressed properties in the rehab sweet spot.", icon: Hammer, accent: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { type: "investor_portfolio", name: "Investor Portfolio", description: "Non-owner occupied high equity landlords.", icon: Building2, accent: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { type: "arm_refi", name: "ARM Refi Targets", description: "Adjustable rate holders with equity. Rate shock urgency.", icon: TrendingUp, accent: "text-green-400 bg-green-500/10 border-green-500/20" },
  { type: "senior_homeowners", name: "Senior Homeowners", description: "Long-term high equity. Reverse mortgage & estate targets.", icon: Heart, accent: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { type: "commercial_lending", name: "Commercial Lending", description: "Commercial owners with maturing loans.", icon: Landmark, accent: "text-primary bg-primary/10 border-primary/20" },
  { type: "free_and_clear", name: "Free & Clear Owners", description: "No mortgage. HELOC and investment targets.", icon: Shield, accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
]

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
]

const WEEKLY_SCHEDULE = [
  { day: "MON", task: "Pre-Foreclosure", desc: "Pull fresh NODs from last 30 days. $75K equity min.", color: "text-red-400" },
  { day: "TUE", task: "Tax Delinquent", desc: "New delinquencies, stack against existing. 40%+ equity.", color: "text-orange-400" },
  { day: "WED", task: "Absentee Owners", desc: "Target zips with highest appreciation. 15+ yr owners.", color: "text-blue-400" },
  { day: "THU", task: "Probate Sweep", desc: "New probate filings. Cross-reference equity position.", color: "text-purple-400" },
  { day: "FRI", task: "Cash Buyers", desc: "Who bought cash last 60 days? Build your buyers list.", color: "text-green-400" },
]

const TIER_CONFIG = {
  tier1: { label: "TIER 1 - HOTTEST LEADS", sublabel: "Highest Motivation = Fastest Close", color: "text-red-400", bg: "bg-red-500/5 border-red-500/20", badge: "bg-red-500/20 text-red-400" },
  tier2: { label: "TIER 2 - SMART MONEY", sublabel: "Lower Competition, High ROI", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/20", badge: "bg-amber-500/20 text-amber-400" },
  tier3: { label: "TIER 3 - VOLUME PLAY", sublabel: "Scale Your Pipeline", color: "text-green-400", bg: "bg-green-500/5 border-green-500/20", badge: "bg-green-500/20 text-green-400" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(num: number | undefined) {
  if (!num || num === 0) return "--"
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

function gradeColor(grade: string) {
  switch (grade) {
    case "A": return { text: "text-green-400", bg: "bg-green-500/15 border-green-500/30" }
    case "B": return { text: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" }
    case "C": return { text: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30" }
    case "D": return { text: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" }
    default: return { text: "text-muted-foreground", bg: "bg-muted/50 border-border" }
  }
}

function getDistressTags(d: EnrichedLead["distress"]) {
  const tags: { label: string; color: string }[] = []
  if (d.foreclosure) tags.push({ label: d.foreclosureStage || "Foreclosure", color: "bg-red-500/20 text-red-400" })
  if (d.taxDelinquent) tags.push({ label: `Tax Default${d.taxDelinquentYears ? ` ${d.taxDelinquentYears}yr` : ""}`, color: "bg-orange-500/20 text-orange-400" })
  if (d.bankruptcy) tags.push({ label: `Bankruptcy${d.bankruptcyChapter ? ` Ch.${d.bankruptcyChapter}` : ""}`, color: "bg-red-500/20 text-red-400" })
  if (d.divorce) tags.push({ label: "Divorce", color: "bg-purple-500/20 text-purple-400" })
  if (d.vacant) tags.push({ label: "Vacant", color: "bg-yellow-500/20 text-yellow-400" })
  return tags
}

function getStackDepthLabel(depth: number) {
  if (depth >= 5) return { label: "NUCLEAR", color: "text-red-400 bg-red-500/20" }
  if (depth >= 4) return { label: "ON FIRE", color: "text-orange-400 bg-orange-500/20" }
  if (depth >= 3) return { label: "HOT", color: "text-amber-400 bg-amber-500/20" }
  if (depth >= 2) return { label: "WARM", color: "text-yellow-400 bg-yellow-500/20" }
  return { label: "SINGLE", color: "text-muted-foreground bg-muted" }
}

// ---------------------------------------------------------------------------
// Lead Card Component
// ---------------------------------------------------------------------------

function LeadCard({ lead, rank }: { lead: EnrichedLead; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const gc = gradeColor(lead.leadGrade)
  const tags = getDistressTags(lead.distress)
  const stackLabel = lead.stackDepth ? getStackDepthLabel(lead.stackDepth) : null

  const copyAddress = () => {
    navigator.clipboard.writeText(
      `${lead.property.address}, ${lead.property.city}, ${lead.property.state} ${lead.property.zip}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(rank * 0.03, 0.6) }}
      className={cn(
        "bg-card rounded-xl border overflow-hidden transition-colors",
        (lead.stackDepth || 0) >= 3
          ? "border-primary/30 hover:border-primary/50"
          : "border-border hover:border-primary/20"
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-muted-foreground text-xs font-bold flex-shrink-0">
            {rank}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{lead.property.address}</h3>
              <button onClick={copyAddress} className="p-1 hover:bg-secondary rounded flex-shrink-0">
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {lead.property.city}, {lead.property.state} {lead.property.zip}
              {lead.property.county ? ` - ${lead.property.county}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Stack Depth Badge */}
          {stackLabel && lead.stackDepth && lead.stackDepth >= 2 && (
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", stackLabel.color)}>
              {lead.stackDepth}x {stackLabel.label}
            </span>
          )}
          {/* Grade Badge */}
          <span className={cn("w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-black", gc.bg, gc.text)}>
            {lead.leadGrade}
          </span>
          <span className="text-xs font-bold text-muted-foreground tabular-nums">{lead.leadScore}</span>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 hover:bg-secondary rounded-lg">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-5 border-t border-border divide-x divide-border bg-secondary/30">
        <MetricCell label="Value" value={formatCurrency(lead.financial.estimatedValue)} />
        <MetricCell
          label="Equity"
          value={lead.financial.equityPercent !== undefined ? `${lead.financial.equityPercent.toFixed(0)}%` : "--"}
          highlight={(lead.financial.equityPercent || 0) >= 40}
        />
        <MetricCell label="Loan" value={formatCurrency(lead.financial.loanBalance)} />
        <MetricCell label="Use Case" value={lead.primaryUseCase} small />
        <MetricCell label="Product" value={lead.bestProductFit} small />
      </div>

      {/* Distress Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-border">
          {tags.map((t) => (
            <span key={t.label} className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", t.color)}>
              {t.label}
            </span>
          ))}
        </div>
      )}

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailItem label="Type" value={lead.property.propertyType || "--"} />
                <DetailItem label="Beds" value={lead.property.beds?.toString() || "--"} />
                <DetailItem label="Baths" value={lead.property.baths?.toString() || "--"} />
                <DetailItem label="Sq Ft" value={lead.property.sqft?.toLocaleString() || "--"} />
                <DetailItem label="Year Built" value={lead.property.yearBuilt?.toString() || "--"} />
                <DetailItem label="Last Sale" value={formatCurrency(lead.financial.lastSalePrice)} />
                <DetailItem label="Sale Date" value={lead.financial.lastSaleDate ? new Date(lead.financial.lastSaleDate).toLocaleDateString() : "--"} />
                <DetailItem label="Assessed" value={formatCurrency(lead.financial.assessedValue)} />
              </div>

              {lead.owner.name && (
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Owner</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <DetailItem label="Name" value={lead.owner.name} />
                    <DetailItem label="Years Owned" value={lead.owner.yearsOwned?.toString() || "--"} />
                    <DetailItem label="Occupancy" value={lead.owner.ownerOccupied ? "Owner Occupied" : "Absentee"} />
                    {lead.owner.mailAddress && (
                      <DetailItem label="Mail To" value={`${lead.owner.mailAddress}, ${lead.owner.mailCity || ""} ${lead.owner.mailState || ""}`} />
                    )}
                  </div>
                </div>
              )}

              {lead.distress.foreclosure && (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Foreclosure</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <DetailItem label="Stage" value={lead.distress.foreclosureStage || "Active"} />
                    <DetailItem label="Auction Date" value={lead.distress.auctionDate ? new Date(lead.distress.auctionDate).toLocaleDateString() : "--"} />
                    <DetailItem label="Opening Bid" value={formatCurrency(lead.distress.openingBid)} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/app/analyzer?address=${encodeURIComponent(lead.property.address)}&price=${lead.financial.estimatedValue || 0}&arv=${lead.financial.estimatedValue || 0}`}
                  className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 text-primary font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Analyze Deal
                </Link>
                <Link
                  href={`/apply?address=${encodeURIComponent(`${lead.property.address}, ${lead.property.city}, ${lead.property.state} ${lead.property.zip}`)}`}
                  className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Apply for Capital
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MetricCell({ label, value, highlight, small }: { label: string; value: string; highlight?: boolean; small?: boolean }) {
  return (
    <div className="p-2.5 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className={cn(
        "font-semibold truncate",
        small ? "text-xs" : "text-sm",
        highlight ? "text-green-400" : "text-foreground"
      )}>{value}</p>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Grade Summary Cards
// ---------------------------------------------------------------------------

function GradeSummary({ gradeSummary, avgScore, total, stackingData }: {
  gradeSummary: Record<string, number>
  avgScore: number
  total: number
  stackingData?: CampaignResult["stackingData"]
}) {
  const grades = ["A", "B", "C", "D", "F"]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {/* Average Score */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-xs text-primary mb-1 font-medium">Avg Score</p>
          <p className="text-3xl font-black text-primary tabular-nums">{avgScore}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{total} leads</p>
        </div>
        {/* Grade Bars */}
        {grades.map((g) => {
          const gc = gradeColor(g)
          const count = gradeSummary[g] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={g} className={cn("rounded-xl border p-4 text-center", gc.bg)}>
              <p className={cn("text-3xl font-black tabular-nums", gc.text)}>{count}</p>
              <p className={cn("text-xs font-bold mt-1", gc.text)}>Grade {g}</p>
              <div className="mt-2 h-1 bg-background rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", g === "A" ? "bg-green-400" : g === "B" ? "bg-emerald-400" : g === "C" ? "bg-yellow-400" : g === "D" ? "bg-orange-400" : "bg-muted-foreground")} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Stacking Stats */}
      {stackingData && (
        <div className="flex items-center gap-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">List Stacking Active</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Avg Depth: <strong className="text-foreground">{stackingData.avgStackDepth}</strong></span>
            <span>Hot Leads (3+): <strong className="text-primary">{stackingData.hotLeadCount}</strong></span>
            {Object.entries(stackingData.stackDepth).sort(([a], [b]) => Number(b) - Number(a)).slice(0, 3).map(([depth, count]) => (
              <span key={depth}>{depth}x: <strong className="text-foreground">{count}</strong></span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

function exportToCSV(leads: EnrichedLead[], campaignName: string) {
  const headers = [
    "Rank", "Grade", "Score", "Stack Depth", "Address", "City", "State", "Zip", "County",
    "Property Type", "Beds", "Baths", "Sq Ft", "Year Built",
    "Est. Value", "Equity %", "Equity $", "Loan Balance", "Loan Rate",
    "Owner Name", "Years Owned", "Occupancy", "Mail Address",
    "Foreclosure", "Foreclosure Stage", "Auction Date",
    "Tax Default", "Tax Default Years", "Tax Default Amount",
    "Bankruptcy", "Divorce", "Vacant",
    "Use Case", "Product Fit", "Motivation",
    "Last Sale Price", "Last Sale Date",
  ]

  const rows = leads.map((l, i) => [
    i + 1, l.leadGrade, l.leadScore, l.stackDepth || 0,
    l.property.address, l.property.city, l.property.state, l.property.zip, l.property.county || "",
    l.property.propertyType || "", l.property.beds || "", l.property.baths || "", l.property.sqft || "", l.property.yearBuilt || "",
    l.financial.estimatedValue || "", l.financial.equityPercent?.toFixed(1) || "", l.financial.equityAmount || "", l.financial.loanBalance || "", l.financial.loanRate || "",
    l.owner.name || "", l.owner.yearsOwned || "", l.owner.ownerOccupied ? "Owner" : "Absentee", l.owner.mailAddress || "",
    l.distress.foreclosure ? "Yes" : "No", l.distress.foreclosureStage || "", l.distress.auctionDate || "",
    l.distress.taxDelinquent ? "Yes" : "No", l.distress.taxDelinquentYears || "", l.distress.taxDelinquentAmount || "",
    l.distress.bankruptcy ? "Yes" : "No", l.distress.divorce ? "Yes" : "No", l.distress.vacant ? "Yes" : "No",
    l.primaryUseCase, l.bestProductFit, l.motivationScore,
    l.financial.lastSalePrice || "", l.financial.lastSaleDate || "",
  ])

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${campaignName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Weekly Research Flow Schedule
// ---------------------------------------------------------------------------

function WeeklySchedule() {
  const today = new Date().getDay()
  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  const dayMap = [null, 0, 1, 2, 3, 4, null] // map JS day to our schedule index

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Weekly Research Flow</h3>
        <span className="text-xs text-muted-foreground ml-auto">Run this every week to dominate your market</span>
      </div>
      <div className="grid grid-cols-5 divide-x divide-border">
        {WEEKLY_SCHEDULE.map((item, idx) => {
          const isToday = dayMap[today] === idx
          return (
            <div key={item.day} className={cn("p-4 text-center", isToday && "bg-primary/5")}>
              <span className={cn("text-xs font-black uppercase tracking-wider", isToday ? "text-primary" : item.color)}>
                {item.day}
              </span>
              {isToday && <span className="block text-[10px] text-primary font-medium mt-0.5">TODAY</span>}
              <p className="text-xs font-semibold text-foreground mt-2">{item.task}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// List Stacking Explainer
// ---------------------------------------------------------------------------

function StackingExplainer() {
  return (
    <div className="bg-card rounded-xl border border-primary/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">The List Stacking Play</h3>
        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full">15-25% Response Rate</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        The more criteria that STACK on one property, the hotter the lead. Single-criteria lists get 2-4% response rates.
        Stacked lists hit 15-25%. Enable List Stacking to automatically boost scores based on overlapping distress signals.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg">Pre-Foreclosure</span>
        <span className="text-muted-foreground text-xs">+</span>
        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg">Absentee Owner</span>
        <span className="text-muted-foreground text-xs">+</span>
        <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold rounded-lg">Tax Delinquent</span>
        <span className="text-muted-foreground text-xs">+</span>
        <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-lg">{'60%+ Equity'}</span>
        <span className="text-muted-foreground text-xs">+</span>
        <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold rounded-lg">{'10+ Years'}</span>
        <span className="text-xs text-muted-foreground ml-1">= CALLING YOU BACK</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function CampaignDashboard() {
  const [view, setView] = useState<"elite" | "standard">("elite")
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [state, setState] = useState("CA")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [enableStacking, setEnableStacking] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<CampaignResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filterGrade, setFilterGrade] = useState<string | null>(null)

  const runCampaign = useCallback(async () => {
    if (!selectedCampaign) return
    if (!city && !zip) {
      setError("Please enter a city or zip code to target")
      return
    }

    setIsRunning(true)
    setError(null)
    setResult(null)
    setFilterGrade(null)

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedCampaign,
          state,
          city: city || undefined,
          zip: zip || undefined,
          enableStacking,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || `Campaign failed (${res.status})`)
      } else {
        setResult(data)
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.")
    } finally {
      setIsRunning(false)
    }
  }, [selectedCampaign, state, city, zip, enableStacking])

  const filteredLeads = result?.leads
    ? filterGrade
      ? result.leads.filter((l) => l.leadGrade === filterGrade)
      : result.leads
    : []

  const selectedElite = ELITE_CAMPAIGNS.find((c) => c.type === selectedCampaign)
  const selectedStandard = STANDARD_CAMPAIGNS.find((c) => c.type === selectedCampaign)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 text-balance">
            <Target className="w-6 h-6 text-primary" />
            Elite Lead Research Flow
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            PropertyRadar 250+ Criteria -- The Stack That Actually Converts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && result.leads.length > 0 && (
            <button
              onClick={() => exportToCSV(result.leads, result.campaignName)}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Campaign Selection View */}
      {!result && (
        <>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1 max-w-md">
            <button
              onClick={() => { setView("elite"); setSelectedCampaign(null) }}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                view === "elite" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Crown className="w-4 h-4" />
              Elite Campaigns
            </button>
            <button
              onClick={() => { setView("standard"); setSelectedCampaign(null) }}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                view === "standard" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="w-4 h-4" />
              Standard
            </button>
          </div>

          {/* Weekly Schedule */}
          {view === "elite" && <WeeklySchedule />}

          {/* List Stacking Explainer */}
          {view === "elite" && <StackingExplainer />}

          {/* Elite Campaign Grid - Organized by Tier */}
          {view === "elite" && (
            <div className="space-y-6">
              {(["tier1", "tier2", "tier3"] as EliteTier[]).map((tier) => {
                const tierCampaigns = ELITE_CAMPAIGNS.filter((c) => c.tier === tier)
                const tc = TIER_CONFIG[tier]
                return (
                  <div key={tier}>
                    <div className={cn("flex items-center gap-3 mb-3 px-4 py-2.5 rounded-lg border", tc.bg)}>
                      <Flame className={cn("w-4 h-4", tc.color)} />
                      <div>
                        <h2 className={cn("text-sm font-black uppercase tracking-wide", tc.color)}>{tc.label}</h2>
                        <p className="text-[10px] text-muted-foreground">{tc.sublabel}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {tierCampaigns.map((c) => {
                        const IconComp = c.icon
                        const isSelected = selectedCampaign === c.type
                        return (
                          <button
                            key={c.type}
                            onClick={() => setSelectedCampaign(c.type)}
                            className={cn(
                              "text-left p-4 rounded-xl border-2 transition-all",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", c.accent.split(" ").slice(1).join(" "))}>
                                <IconComp className={cn("w-5 h-5", c.accent.split(" ")[0])} />
                              </div>
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", TIER_CONFIG[c.tier].badge)}>
                                {c.responseRate}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">{c.name}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{c.description}</p>
                            <p className="text-[10px] text-primary/80 leading-relaxed italic">{c.whyItConverts}</p>
                            {isSelected && (
                              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Standard Campaign Grid */}
          {view === "standard" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STANDARD_CAMPAIGNS.map((c) => {
                const IconComp = c.icon
                const isSelected = selectedCampaign === c.type
                return (
                  <button
                    key={c.type}
                    onClick={() => setSelectedCampaign(c.type)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", c.accent.split(" ").slice(1).join(" "))}>
                      <IconComp className={cn("w-5 h-5", c.accent.split(" ")[0])} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{c.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Location & Launch */}
          {selectedCampaign && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Target Location
                </h2>
                {/* Stacking Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-medium text-muted-foreground">List Stacking</span>
                  <button
                    onClick={() => setEnableStacking(!enableStacking)}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors",
                      enableStacking ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform shadow-sm",
                      enableStacking ? "translate-x-5" : "translate-x-0.5"
                    )} />
                  </button>
                  {enableStacking && (
                    <span className="text-[10px] text-primary font-bold">ON</span>
                  )}
                </label>
              </div>

              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runCampaign()}
                    placeholder="e.g. Los Angeles"
                    className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zip (optional)</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runCampaign()}
                    placeholder="e.g. 90001"
                    className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Selected Campaign Info */}
              {selectedElite && (
                <div className={cn("mb-4 p-3 rounded-lg border", TIER_CONFIG[selectedElite.tier].bg)}>
                  <div className="flex items-center gap-2 mb-1">
                    <selectedElite.icon className={cn("w-4 h-4", selectedElite.accent.split(" ")[0])} />
                    <span className="text-xs font-bold text-foreground">{selectedElite.name}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", TIER_CONFIG[selectedElite.tier].badge)}>
                      {selectedElite.responseRate} response rate
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{selectedElite.whyItConverts}</p>
                </div>
              )}

              <button
                onClick={runCampaign}
                disabled={isRunning}
                className="w-full px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Campaign...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Launch {enableStacking ? "Stacked " : ""}Campaign
                  </>
                )}
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Loading */}
      {isRunning && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {enableStacking ? "Running Stacked Campaign..." : "Running Campaign..."}
          </h2>
          <p className="text-muted-foreground">
            Searching PropertyRadar, scoring leads
            {enableStacking ? ", stacking criteria overlaps" : ""}
          </p>
        </div>
      )}

      {/* Results */}
      {result && !isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Campaign Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{result.campaignName}</h2>
                {result.tier && (
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", TIER_CONFIG[result.tier as EliteTier]?.badge || "bg-muted text-muted-foreground")}>
                    {TIER_CONFIG[result.tier as EliteTier]?.label || result.tier}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {result.totalScored} leads scored in{" "}
                {((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000).toFixed(1)}s
                {result.topUseCases.length > 0 && (
                  <> | Top: {result.topUseCases.slice(0, 3).join(", ")}</>
                )}
                {result.stackingData && (
                  <> | <strong className="text-primary">{result.stackingData.hotLeadCount} hot leads</strong> (3+ stacked)</>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setResult(null)
                setSelectedCampaign(null)
              }}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              New Campaign
            </button>
          </div>

          {/* Grade Summary */}
          <GradeSummary
            gradeSummary={result.gradeSummary}
            avgScore={result.avgScore}
            total={result.totalScored}
            stackingData={result.stackingData}
          />

          {/* Grade Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterGrade(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                !filterGrade ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              All ({result.totalScored})
            </button>
            {/* Hot Leads filter */}
            {result.stackingData && result.stackingData.hotLeadCount > 0 && (
              <button
                onClick={() => setFilterGrade(filterGrade === "HOT" ? null : "HOT")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1",
                  filterGrade === "HOT"
                    ? "bg-red-500/15 border-red-500/30 text-red-400"
                    : "bg-secondary text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <Flame className="w-3 h-3" />
                Hot ({result.stackingData.hotLeadCount})
              </button>
            )}
            {["A", "B", "C", "D", "F"].map((g) => {
              const count = result.gradeSummary[g] || 0
              if (count === 0) return null
              const gc = gradeColor(g)
              return (
                <button
                  key={g}
                  onClick={() => setFilterGrade(filterGrade === g ? null : g)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                    filterGrade === g ? cn(gc.bg, gc.text) : "bg-secondary text-muted-foreground hover:text-foreground border-transparent"
                  )}
                >
                  {g} ({count})
                </button>
              )
            })}
          </div>

          {/* Lead List */}
          <div className="space-y-3">
            {(filterGrade === "HOT"
              ? result.leads.filter((l) => (l.stackDepth || 0) >= 3)
              : filteredLeads
            ).map((lead, i) => (
              <LeadCard key={lead.radarId} lead={lead} rank={i + 1} />
            ))}
          </div>

          {(filterGrade === "HOT"
            ? result.leads.filter((l) => (l.stackDepth || 0) >= 3).length === 0
            : filteredLeads.length === 0
          ) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leads match the selected filter.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
