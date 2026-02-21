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
} from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types mirroring saint-lead.ts
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
}

type CampaignType =
  | "distressed_equity"
  | "arm_refi"
  | "investor_portfolio"
  | "fix_and_flip"
  | "senior_homeowners"
  | "pre_foreclosure"
  | "commercial_lending"
  | "free_and_clear"

// ---------------------------------------------------------------------------
// Campaign Template Config
// ---------------------------------------------------------------------------

const CAMPAIGNS: {
  type: CampaignType
  name: string
  description: string
  icon: typeof AlertTriangle
  accent: string
}[] = [
  {
    type: "distressed_equity",
    name: "Distressed High Equity",
    description: "High equity owners facing foreclosure, tax liens, or other distress signals.",
    icon: AlertTriangle,
    accent: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  {
    type: "pre_foreclosure",
    name: "Pre-Foreclosure Goldmine",
    description: "Active pre-foreclosure notices with equity remaining. Most motivated sellers.",
    icon: Gavel,
    accent: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    type: "fix_and_flip",
    name: "Fix & Flip Pipeline",
    description: "Vacant distressed properties in the value sweet spot for rehab deals.",
    icon: Hammer,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    type: "investor_portfolio",
    name: "Investor Portfolio",
    description: "Non-owner occupied high equity. Landlords ready to sell, refi, or cash out.",
    icon: Building2,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    type: "arm_refi",
    name: "ARM Refi Targets",
    description: "Adjustable rate mortgage holders with equity. Rate shock creates urgency.",
    icon: TrendingUp,
    accent: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    type: "senior_homeowners",
    name: "Senior Homeowners",
    description: "Long-term owner-occupied with high equity. Reverse mortgage & estate targets.",
    icon: Heart,
    accent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
  {
    type: "commercial_lending",
    name: "Commercial Lending",
    description: "Commercial property owners with maturing loans. CookinCapital targets.",
    icon: Landmark,
    accent: "text-primary bg-primary/10 border-primary/20",
  },
  {
    type: "free_and_clear",
    name: "Free & Clear Owners",
    description: "Properties with no mortgage. HELOC, cash-out refi, and investment targets.",
    icon: Shield,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
]

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
]

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

// ---------------------------------------------------------------------------
// Lead Card Component
// ---------------------------------------------------------------------------

function LeadCard({ lead, rank }: { lead: EnrichedLead; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const gc = gradeColor(lead.leadGrade)
  const tags = getDistressTags(lead.distress)

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
      transition={{ delay: rank * 0.03 }}
      className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-colors"
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
          {/* Grade Badge */}
          <span className={cn("w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-black", gc.bg, gc.text)}>
            {lead.leadGrade}
          </span>
          {/* Score */}
          <span className="text-xs font-bold text-muted-foreground tabular-nums">{lead.leadScore}</span>
          {/* Expand */}
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
              {/* Property Details */}
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

              {/* Owner Info */}
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

              {/* Foreclosure Details */}
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

              {/* Actions */}
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

function GradeSummary({ gradeSummary, avgScore, total }: { gradeSummary: Record<string, number>; avgScore: number; total: number }) {
  const grades = ["A", "B", "C", "D", "F"]
  return (
    <div className="grid grid-cols-6 gap-3">
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
  )
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

function exportToCSV(leads: EnrichedLead[], campaignName: string) {
  const headers = [
    "Rank", "Grade", "Score", "Address", "City", "State", "Zip", "County",
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
    i + 1, l.leadGrade, l.leadScore,
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
// Main Dashboard
// ---------------------------------------------------------------------------

export default function CampaignDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(null)
  const [state, setState] = useState("CA")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
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
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || `Campaign failed (${res.status})`)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError("Something went wrong. Check your connection and try again.")
    } finally {
      setIsRunning(false)
    }
  }, [selectedCampaign, state, city, zip])

  const filteredLeads = result?.leads
    ? filterGrade
      ? result.leads.filter((l) => l.leadGrade === filterGrade)
      : result.leads
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            SAINT LEAD Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered lead campaigns with PropertyRadar 250+ criteria and intelligent scoring
          </p>
        </div>
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

      {/* Campaign Selection Grid */}
      {!result && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAMPAIGNS.map((c) => {
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

          {/* Location & Launch */}
          {selectedCampaign && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Target Location
              </h2>

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
                    Launch Campaign
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
          <h2 className="text-xl font-semibold text-foreground mb-2">Running Campaign...</h2>
          <p className="text-muted-foreground">Searching PropertyRadar, scoring leads, detecting use cases</p>
        </div>
      )}

      {/* Results */}
      {result && !isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Campaign Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{result.campaignName}</h2>
              <p className="text-sm text-muted-foreground">
                {result.totalScored} leads scored in{" "}
                {((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000).toFixed(1)}s
                {result.topUseCases.length > 0 && (
                  <> | Top: {result.topUseCases.slice(0, 3).join(", ")}</>
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
          />

          {/* Grade Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterGrade(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                !filterGrade ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              All ({result.totalScored})
            </button>
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
            {filteredLeads.map((lead, i) => (
              <LeadCard key={lead.radarId} lead={lead} rank={i + 1} />
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leads match the selected grade filter.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
