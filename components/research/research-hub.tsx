"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  Globe,
  Building2,
  Calculator,
  DollarSign,
  MapPin,
  Users,
  User,
  MessageCircle,
  Mic,
  Camera,
  Upload,
  X,
  Wand2,
  FileText,
  Home,
  Phone,
  Mail,
  Zap,
  Target,
  BarChart3,
  Check,
  Bookmark,
  AlertTriangle,
  Calendar,
  Copy,
  ChevronDown,
  ChevronUp,
  BedDouble,
  Bath,
  Ruler,
  ArrowLeft,
  TrendingUp,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ===========================================
// SAINTSAL™ RESEARCH COMMAND CENTER v3.0
// Perplexity-Level • AI Orchestration
// Lead Finding • Intent Detection
// ===========================================

interface FileAttachment {
  id: string
  file: File
  preview?: string
  type: "image" | "document"
}

interface SearchResult {
  title: string
  url: string
  snippet: string
  favicon?: string
}

interface PropertyResult {
  // Basic Property Info
  radarId?: string
  address: string
  city: string
  state: string
  zip: string
  county?: string
  propertyType?: string

  // Property Details
  beds?: number
  baths?: number
  sqft?: number
  lotSize?: number
  yearBuilt?: number
  units?: number

  // Valuation & Equity
  value?: number
  equity?: number
  equityPercent?: number
  availableEquity?: number

  // Owner Information
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
  ownerAddress?: string
  ownerCity?: string
  ownerState?: string
  ownerZip?: string
  yearsOwned?: number

  // Distress Signals
  foreclosureStatus?: string
  foreclosureAuctionDate?: string
  foreclosureOpeningBid?: number
  taxDefaultYears?: number
  taxDefaultAmount?: number
  inDivorce?: boolean
  divorceRecordingDate?: string
  inBankruptcy?: boolean
  bankruptcyStatus?: string
  bankruptcyChapter?: string
  hasLiens?: boolean
  lienAmount?: number
  isVacant?: boolean
  isDeceased?: boolean

  // Transfer Info
  transferType?: string
  transferDate?: string
  transferAmount?: number

  // Loan Info
  loanBalance?: number
  loanRate?: number
  loanType?: string

  // Last Sale
  lastSaleDate?: string
  lastSalePrice?: number
  apn?: string

  // RentCast Enhancements
  rentEstimate?: number
  rentLow?: number
  rentHigh?: number
  valueLow?: number
  valueHigh?: number
  daysOnMarket?: number
  listedDate?: string
  listingUrl?: string

  // Data source
  source?: string
}

interface LeadResult {
  name: string
  company?: string
  title?: string
  phone?: string
  email?: string
  location?: string
  source?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: SearchResult[]
  properties?: PropertyResult[]
  leads?: LeadResult[]
  images?: string[]
  attachments?: FileAttachment[]
  summary?: string
  intent?: string
  isStreaming?: boolean
}

const QUICK_PROMPTS = [
  { text: "Find foreclosures in Orange County", icon: Home, category: "property" },
  { text: "Find motivated sellers in LA", icon: Target, category: "leads" },
  { text: "Analyze 123 Main St Huntington Beach", icon: Calculator, category: "deal" },
  { text: "Generate a real estate social post", icon: Wand2, category: "social" },
]

const MOBILE_NAV = [
  { label: "Chat", icon: MessageCircle, href: "/research", active: true },
  { label: "Property", icon: Building2, href: "/app/properties" },
  { label: "Deals", icon: Calculator, href: "/app/analyzer" },
  { label: "Leads", icon: Users, href: "/app/opportunities" },
  { label: "Loans", icon: DollarSign, href: "/capital" },
  { label: "Account", icon: User, href: "/app/settings" },
]

// Detect user intent for AI orchestration
function detectIntent(query: string): string {
  const q = query.toLowerCase()

  // Property/Real Estate Intent
  if (q.includes("foreclosure") || q.includes("pre-foreclosure") || q.includes("nod") || q.includes("auction")) {
    return "foreclosure_search"
  }
  if (q.includes("property") && (q.includes("find") || q.includes("search") || q.includes("look"))) {
    return "property_search"
  }
  if (
    q.includes("owner") &&
    (q.includes("find") || q.includes("contact") || q.includes("phone") || q.includes("email"))
  ) {
    return "owner_lookup"
  }
  if (q.match(/\d+\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)/i)) {
    return "property_lookup"
  }

  // Lead Generation Intent
  if (q.includes("lead") || q.includes("investor") || q.includes("buyer") || q.includes("seller")) {
    if (q.includes("find") || q.includes("search") || q.includes("get")) {
      return "lead_generation"
    }
  }
  if (q.includes("enrich") || q.includes("contact info") || q.includes("phone number") || q.includes("email")) {
    return "lead_enrichment"
  }

  if (q.includes("motivated") || q.includes("distress") || q.includes("desperate") || q.includes("urgent")) {
    return "motivated_sellers"
  }

  if (q.includes("cash buyer") || q.includes("cash offer") || q.includes("all cash")) {
    return "cash_buyers"
  }

  // Deal Analysis Intent
  if (q.includes("analyze") || q.includes("analysis") || q.includes("roi") || q.includes("deal")) {
    return "deal_analysis"
  }
  if (q.includes("flip") || q.includes("arv") || q.includes("rehab") || q.includes("profit")) {
    return "deal_analysis"
  }

  // Lending Intent
  if (
    q.includes("loan") ||
    q.includes("lend") ||
    q.includes("rate") ||
    q.includes("finance") ||
    q.includes("mortgage")
  ) {
    return "lending_info"
  }
  if (q.includes("bridge") || q.includes("hard money") || q.includes("dscr") || q.includes("fix and flip")) {
    return "lending_info"
  }

  if (
    q.includes("generate image") ||
    q.includes("create image") ||
    q.includes("make image") ||
    q.includes("draw") ||
    q.includes("picture of")
  ) {
    return "image_generation"
  }

  if (
    q.includes("social") ||
    q.includes("post") ||
    q.includes("instagram") ||
    q.includes("linkedin") ||
    q.includes("facebook") ||
    q.includes("twitter") ||
    q.includes("caption") ||
    q.includes("content")
  ) {
    return "social_media"
  }

  // Default to general chat/research
  return "web_research"
}

function PropertyCard({ property, onSave }: { property: PropertyResult; onSave?: (property: PropertyResult) => void }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/saved-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: "property",
          data: property,
        }),
      })
      if (res.ok) {
        setSaved(true)
        const savedProps = JSON.parse(localStorage.getItem("savedProperties") || "[]")
        savedProps.push({ ...property, savedAt: new Date().toISOString() })
        localStorage.setItem("savedProperties", JSON.stringify(savedProps))
        onSave?.(property)
      }
    } catch (e) {
      const savedProps = JSON.parse(localStorage.getItem("savedProperties") || "[]")
      savedProps.push({ ...property, savedAt: new Date().toISOString() })
      localStorage.setItem("savedProperties", JSON.stringify(savedProps))
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // Determine distress level and badge
  const getDistressBadge = () => {
    if (property.foreclosureStatus) {
      const status = property.foreclosureStatus.toUpperCase()
      if (status === "NTS" || status === "AUCTION") return { label: "AUCTION", color: "bg-red-500" }
      if (status === "NOD") return { label: "PRE-FORECLOSURE", color: "bg-orange-500" }
      if (status === "REO") return { label: "BANK OWNED", color: "bg-purple-500" }
    }
    if (property.taxDefaultYears && property.taxDefaultYears > 0) return { label: "TAX DEFAULT", color: "bg-red-400" }
    if (property.inBankruptcy) return { label: "BANKRUPTCY", color: "bg-red-600" }
    if (property.inDivorce) return { label: "DIVORCE", color: "bg-orange-400" }
    if (property.hasLiens) return { label: "LIENS", color: "bg-yellow-500" }
    if (property.isVacant) return { label: "VACANT", color: "bg-blue-500" }
    if (property.isDeceased) return { label: "PROBATE", color: "bg-purple-400" }
    if (property.transferType === "Death" || property.transferType === "Inheritance")
      return { label: "INHERITED", color: "bg-purple-400" }
    if ((property.equityPercent || 0) > 50) return { label: "HIGH EQUITY", color: "bg-green-500" }
    return null
  }

  const distressBadge = getDistressBadge()

  // Calculate investment metrics
  const monthlyRent = property.rentEstimate || 0
  const annualRent = monthlyRent * 12
  const estimatedValue = property.value || 0
  const grossYield = estimatedValue > 0 && monthlyRent > 0 ? ((annualRent / estimatedValue) * 100).toFixed(1) : null
  const monthlyCashFlow = monthlyRent > 0 && estimatedValue > 0 ? monthlyRent - (estimatedValue * 0.007) : null // rough PITI estimate
  const pricePerSqft = estimatedValue > 0 && property.sqft ? Math.round(estimatedValue / property.sqft) : null

  // Investment score (A-F)
  const getInvestmentGrade = () => {
    let score = 0
    if (Number(grossYield) >= 10) score += 3
    else if (Number(grossYield) >= 7) score += 2
    else if (Number(grossYield) >= 4) score += 1
    if ((property.equityPercent || 0) > 40) score += 2
    else if ((property.equityPercent || 0) > 20) score += 1
    if (distressBadge) score += 2 // Distressed = opportunity
    if (property.isVacant) score += 1
    if ((property.daysOnMarket || 0) > 60) score += 1
    if (score >= 7) return { grade: "A", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" }
    if (score >= 5) return { grade: "B", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" }
    if (score >= 3) return { grade: "C", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" }
    if (score >= 1) return { grade: "D", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" }
    return { grade: "—", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" }
  }
  const investmentGrade = getInvestmentGrade()

  return (
    <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all shadow-xl">
      {/* Header with Address and Status */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <h3 className="font-bold text-white text-base truncate">{property.address}</h3>
            </div>
            <p className="text-sm text-gray-400 ml-6">
              {property.city}, {property.state} {property.zip}
              {property.county && <span className="text-gray-500"> -- {property.county} County</span>}
            </p>
            {property.apn && (
              <p className="text-[10px] text-gray-600 ml-6 mt-0.5 font-mono">APN: {property.apn}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {/* Investment Grade Badge */}
            <span className={cn("px-2 py-0.5 text-xs font-black rounded-md border", investmentGrade.bg, investmentGrade.color)}>
              {investmentGrade.grade}
            </span>
            {distressBadge && (
              <span className={cn("px-2 py-0.5 text-[10px] font-bold text-white rounded-full", distressBadge.color)}>
                {distressBadge.label}
              </span>
            )}
            {property.propertyType && (
              <span className="px-2 py-0.5 bg-[#222] text-gray-400 text-[10px] font-medium rounded-full">
                {property.propertyType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid - Row 1 */}
      <div className="grid grid-cols-4 divide-x divide-[#222] bg-[#0d0d0d]">
        <div className="p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Value</p>
          <p className="text-base font-bold text-white">
            {property.value ? `$${property.value >= 1000000 ? `${(property.value / 1000000).toFixed(1)}M` : `${(property.value / 1000).toFixed(0)}K`}` : "—"}
          </p>
          {pricePerSqft && <p className="text-[10px] text-gray-500">${pricePerSqft}/sqft</p>}
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Equity</p>
          <p className={cn("text-base font-bold", (property.equityPercent || 0) > 30 ? "text-green-400" : "text-white")}>
            {property.equityPercent !== undefined ? `${property.equityPercent}%` :
              property.equity ? `$${(property.equity / 1000).toFixed(0)}K` : "—"}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Rent Est.</p>
          <p className="text-base font-bold text-emerald-400">
            {property.rentEstimate ? `$${property.rentEstimate.toLocaleString()}` : "—"}
          </p>
          {property.rentEstimate && <p className="text-[10px] text-gray-500">/month</p>}
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Yield</p>
          <p className={cn("text-base font-bold", Number(grossYield) >= 7 ? "text-green-400" : Number(grossYield) >= 4 ? "text-yellow-400" : "text-white")}>
            {grossYield ? `${grossYield}%` : "—"}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid - Row 2 */}
      <div className="grid grid-cols-4 divide-x divide-[#222] bg-[#0d0d0d] border-t border-[#222]">
        <div className="p-2.5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Last Sale</p>
          <p className="text-sm font-semibold text-white">
            {property.lastSalePrice ? `$${property.lastSalePrice >= 1000000 ? `${(property.lastSalePrice / 1000000).toFixed(1)}M` : `${(property.lastSalePrice / 1000).toFixed(0)}K`}` : "—"}
          </p>
          {property.lastSaleDate && <p className="text-[10px] text-gray-500">{property.lastSaleDate}</p>}
        </div>
        <div className="p-2.5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Owned</p>
          <p className="text-sm font-semibold text-white">{property.yearsOwned ? `${property.yearsOwned} yrs` : "—"}</p>
        </div>
        <div className="p-2.5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">On Market</p>
          <p className="text-sm font-semibold text-white">
            {property.daysOnMarket !== undefined ? `${property.daysOnMarket}d` : "—"}
          </p>
        </div>
        <div className="p-2.5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Loan Bal.</p>
          <p className="text-sm font-semibold text-white">
            {property.loanBalance ? `$${property.loanBalance >= 1000000 ? `${(property.loanBalance / 1000000).toFixed(1)}M` : `${(property.loanBalance / 1000).toFixed(0)}K`}` : "—"}
          </p>
        </div>
      </div>

      {/* Property Details Row */}
      {(property.beds || property.baths || property.sqft || property.yearBuilt) && (
        <div className="flex items-center justify-center gap-4 py-2 px-4 bg-[#111] border-t border-[#222]">
          {property.beds && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <BedDouble className="h-3.5 w-3.5" />
              <span>{property.beds} bed</span>
            </div>
          )}
          {property.baths && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.baths} bath</span>
            </div>
          )}
          {property.sqft && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Ruler className="h-3.5 w-3.5" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
          {property.yearBuilt && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{property.yearBuilt}</span>
            </div>
          )}
        </div>
      )}

      {/* Owner Contact Section */}
      {property.ownerName && (
        <div className="p-4 border-t border-[#222] bg-[#0a0a0a]">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Owner Contact</p>
          </div>

          <div className="space-y-2">
            {/* Owner Name with Copy */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{property.ownerName}</p>
              <button
                onClick={() => copyToClipboard(property.ownerName!, "name")}
                className="p-1 hover:bg-[#222] rounded transition-colors"
              >
                {copied === "name" ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-500" />
                )}
              </button>
            </div>

            {/* Owner Mailing Address */}
            {property.ownerAddress && (
              <p className="text-xs text-gray-400">
                {property.ownerAddress}
                {property.ownerCity && `, ${property.ownerCity}`}
                {property.ownerState && `, ${property.ownerState}`}
                {property.ownerZip && ` ${property.ownerZip}`}
              </p>
            )}

            {/* Phone - Large Tap Target */}
            {property.ownerPhone && (
              <a
                href={`tel:${property.ownerPhone}`}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">{property.ownerPhone}</span>
                </div>
                <span className="text-[10px] text-amber-500/70 uppercase">Tap to Call</span>
              </a>
            )}

            {/* Email - Large Tap Target */}
            {property.ownerEmail && (
              <a
                href={`mailto:${property.ownerEmail}`}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-400 truncate">{property.ownerEmail}</span>
                </div>
                <span className="text-[10px] text-blue-400/70 uppercase flex-shrink-0 ml-2">Tap to Email</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Distress & Investment Details (Expandable) */}
      {(property.foreclosureStatus ||
        property.taxDefaultYears ||
        property.inBankruptcy ||
        property.inDivorce ||
        property.hasLiens ||
        property.loanBalance ||
        property.apn ||
        property.listingUrl ||
        property.lastSalePrice ||
        property.rentEstimate ||
        property.source) && (
        <div className="border-t border-[#222]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs text-gray-400 hover:bg-[#111] transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="uppercase tracking-wide font-medium">Distress & Legal Details</span>
            </div>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-3">
              {/* Foreclosure Info */}
              {property.foreclosureStatus && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-[10px] text-red-400 uppercase font-medium mb-1">Foreclosure Status</p>
                  <p className="text-sm text-white font-semibold">{property.foreclosureStatus}</p>
                  {property.foreclosureAuctionDate && (
                    <p className="text-xs text-gray-400 mt-1">Auction: {property.foreclosureAuctionDate}</p>
                  )}
                  {property.foreclosureOpeningBid && (
                    <p className="text-xs text-gray-400">
                      Opening Bid: ${property.foreclosureOpeningBid.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Tax Default */}
              {property.taxDefaultYears && property.taxDefaultYears > 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-[10px] text-orange-400 uppercase font-medium mb-1">Tax Delinquent</p>
                  <p className="text-sm text-white">{property.taxDefaultYears} years delinquent</p>
                  {property.taxDefaultAmount && (
                    <p className="text-xs text-gray-400">Amount Owed: ${property.taxDefaultAmount.toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Bankruptcy */}
              {property.inBankruptcy && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-[10px] text-purple-400 uppercase font-medium mb-1">Bankruptcy</p>
                  <p className="text-sm text-white">
                    {property.bankruptcyChapter && `Chapter ${property.bankruptcyChapter}`}
                    {property.bankruptcyStatus && ` - ${property.bankruptcyStatus}`}
                  </p>
                </div>
              )}

              {/* Divorce */}
              {property.inDivorce && (
                <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                  <p className="text-[10px] text-pink-400 uppercase font-medium mb-1">Divorce / Lis Pendens</p>
                  <p className="text-sm text-white">Property involved in divorce proceedings</p>
                  {property.divorceRecordingDate && (
                    <p className="text-xs text-gray-400">Filed: {property.divorceRecordingDate}</p>
                  )}
                </div>
              )}

              {/* Liens */}
              {property.hasLiens && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-[10px] text-yellow-400 uppercase font-medium mb-1">Liens / Judgments</p>
                  <p className="text-sm text-white">Property has open liens</p>
                  {property.lienAmount && (
                    <p className="text-xs text-gray-400">Lien Amount: ${property.lienAmount.toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Loan Info */}
              {property.loanBalance && (
                <div className="p-3 bg-[#111] border border-[#222] rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Existing Loan</p>
                  <p className="text-sm text-white">Balance: ${property.loanBalance.toLocaleString()}</p>
                  {property.loanType && <p className="text-xs text-gray-400">Type: {property.loanType}</p>}
                  {property.loanRate && <p className="text-xs text-gray-400">Rate: {property.loanRate}%</p>}
                </div>
              )}

              {/* Investment Analysis */}
              {(grossYield || monthlyCashFlow) && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <p className="text-[10px] text-emerald-400 uppercase font-medium mb-2">Investment Analysis</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {grossYield && (
                      <div>
                        <span className="text-gray-500">Gross Yield:</span>
                        <span className={cn("ml-1 font-semibold", Number(grossYield) >= 7 ? "text-green-400" : "text-white")}>{grossYield}%</span>
                      </div>
                    )}
                    {monthlyCashFlow !== null && (
                      <div>
                        <span className="text-gray-500">Est. Cash Flow:</span>
                        <span className={cn("ml-1 font-semibold", monthlyCashFlow > 0 ? "text-green-400" : "text-red-400")}>
                          ${Math.round(monthlyCashFlow).toLocaleString()}/mo
                        </span>
                      </div>
                    )}
                    {property.rentLow && property.rentHigh && (
                      <div>
                        <span className="text-gray-500">Rent Range:</span>
                        <span className="ml-1 text-white">${property.rentLow.toLocaleString()} - ${property.rentHigh.toLocaleString()}</span>
                      </div>
                    )}
                    {property.valueLow && property.valueHigh && (
                      <div>
                        <span className="text-gray-500">Value Range:</span>
                        <span className="ml-1 text-white">
                          ${(property.valueLow / 1000).toFixed(0)}K - ${(property.valueHigh / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}
                    {pricePerSqft && (
                      <div>
                        <span className="text-gray-500">Price/SqFt:</span>
                        <span className="ml-1 text-white font-semibold">${pricePerSqft}</span>
                      </div>
                    )}
                    {property.lotSize && (
                      <div>
                        <span className="text-gray-500">Lot Size:</span>
                        <span className="ml-1 text-white">{property.lotSize} acres</span>
                      </div>
                    )}
                    {property.units && property.units > 1 && (
                      <div>
                        <span className="text-gray-500">Units:</span>
                        <span className="ml-1 text-white font-semibold">{property.units}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transfer / Sale History */}
              {(property.transferDate || property.lastSalePrice) && (
                <div className="p-3 bg-[#111] border border-[#222] rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Sale / Transfer History</p>
                  {property.lastSalePrice && (
                    <p className="text-sm text-white">
                      Last Sale: ${property.lastSalePrice.toLocaleString()}
                      {property.lastSaleDate && <span className="text-gray-400"> on {property.lastSaleDate}</span>}
                    </p>
                  )}
                  {property.transferDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Transfer: {property.transferDate}
                      {property.transferAmount && ` -- $${property.transferAmount.toLocaleString()}`}
                      {property.transferType && ` (${property.transferType})`}
                    </p>
                  )}
                </div>
              )}

              {/* Listing Link */}
              {property.listingUrl && (
                <a
                  href={property.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">View Active Listing</span>
                  </div>
                  {property.listedDate && (
                    <span className="text-[10px] text-blue-400/70">Listed {property.listedDate}</span>
                  )}
                </a>
              )}

              {/* Data Source + APN */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
                {property.apn && (
                  <p className="text-[10px] text-gray-600 font-mono">APN: {property.apn}</p>
                )}
                <p className="text-[10px] text-gray-600">
                  Data: {property.source || "PropertyAPI"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-[#222] flex gap-2">
        <Link
          href={`/app/analyzer?address=${encodeURIComponent(property.address)}&city=${encodeURIComponent(property.city)}&state=${encodeURIComponent(property.state)}&zip=${encodeURIComponent(property.zip || "")}&value=${property.value || ""}`}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          Analyze Deal
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            "px-4 py-3 text-sm font-semibold rounded-xl transition-all flex items-center gap-2",
            saved
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-[#1a1a1a] hover:bg-[#222] text-white border border-[#333]",
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Lead Card Component
function LeadCard({ lead, onSave }: { lead: LeadResult; onSave?: (lead: LeadResult) => void }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/saved-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: "lead",
          data: lead,
        }),
      })
      if (res.ok) {
        setSaved(true)
        // Also save to localStorage as fallback
        const savedLeads = JSON.parse(localStorage.getItem("savedLeads") || "[]")
        savedLeads.push({ ...lead, savedAt: new Date().toISOString() })
        localStorage.setItem("savedLeads", JSON.stringify(savedLeads))
        onSave?.(lead)
      }
    } catch (e) {
      // Fallback to localStorage
      const savedLeads = JSON.parse(localStorage.getItem("savedLeads") || "[]")
      savedLeads.push({ ...lead, savedAt: new Date().toISOString() })
      localStorage.setItem("savedLeads", JSON.stringify(savedLeads))
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-amber-500/30 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold">
          {lead.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{lead.name}</p>
          {lead.title && <p className="text-xs text-gray-400">{lead.title}</p>}
          {lead.company && <p className="text-xs text-amber-500">{lead.company}</p>}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 px-3 py-2 -mx-3 text-sm text-gray-300 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all active:scale-95"
            aria-label={`Call ${lead.name} at ${lead.phone}`}
          >
            <Phone className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{lead.phone}</span>
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 px-3 py-2 -mx-3 text-sm text-gray-300 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all active:scale-95 truncate"
            aria-label={`Email ${lead.name} at ${lead.email}`}
          >
            <Mail className="h-4 w-4 text-amber-500" />
            <span className="font-medium truncate">{lead.email}</span>
          </a>
        )}
        {lead.location && (
          <p className="flex items-center gap-2 px-3 py-2 -mx-3 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {lead.location}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1",
            saved ? "bg-green-500/20 text-green-400 cursor-default" : "bg-amber-500 hover:bg-amber-600 text-black",
          )}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-3 w-3" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-3 w-3" />
              Save Lead
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Source Pill Component
function SourcePill({ source, index }: { source: SearchResult; index: number }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-full text-xs transition-colors group"
    >
      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">
        {index + 1}
      </span>
      <span className="text-gray-300 group-hover:text-white truncate max-w-[120px]">
        {source.title || new URL(source.url).hostname}
      </span>
      <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-amber-500" />
    </a>
  )
}

// Rich Content Renderer
function RichContent({ content }: { content: string }) {
  // Simple markdown parsing
  const renderContent = () => {
    const lines = content.split("\n")
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">
            {line.slice(4)}
          </h3>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-xl font-bold text-white mt-4 mb-3">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.match(/^[-*]\s/)) {
        return (
          <li key={i} className="text-sm text-gray-300 ml-4 mb-1 list-disc">
            {renderInline(line.slice(2))}
          </li>
        )
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="text-sm text-gray-300 ml-4 mb-1 list-decimal">
            {renderInline(line.replace(/^\d+\.\s/, ""))}
          </li>
        )
      }
      if (line.trim() === "") return <br key={i} />
      return (
        <p key={i} className="text-sm text-gray-300 mb-2 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    })
  }

  const renderInline = (text: string): React.ReactNode => {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      // Inline code
      if (part.includes("`")) {
        const codeParts = part.split(/(`[^`]+`)/)
        return codeParts.map((cp, j) => {
          if (cp.startsWith("`") && cp.endsWith("`")) {
            return (
              <code key={j} className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-amber-500 text-xs font-mono">
                {cp.slice(1, -1)}
              </code>
            )
          }
          return cp
        })
      }
      return part
    })
  }

  return <div className="prose-invert max-w-none">{renderContent()}</div>
}

export function ResearchHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const processFiles = (files: File[]) => {
    const newAttachments: FileAttachment[] = files
      .filter((file) => file.type.startsWith("image/") || file.type === "application/pdf")
      .slice(0, 4)
      .map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: file.type.startsWith("image/") ? "image" : "document",
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }))
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 4))
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id)
      if (att?.preview) URL.revokeObjectURL(att.preview)
      return prev.filter((a) => a.id !== id)
    })
  }

  // Voice recording (placeholder - would integrate with ElevenLabs)
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Integrate with ElevenLabs voice agent
  }

  // Image generation
  const handleGenerateImage = async () => {
    if (!input?.trim()) return
    setIsGeneratingImage(true)
    const prompt = input.trim()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Generate image: ${prompt}`,
      timestamp: new Date(),
      intent: "image_generation",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `generate image: ${prompt}`, tool: "fal_generate_image" }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's the generated image:",
          timestamp: new Date(),
          images: data.images || [],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't generate that image.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Main submit handler with AI orchestration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input?.trim() && attachments.length === 0) || isLoading) return

    const query = input.trim()
    const intent = detectIntent(query)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      intent,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    // Add streaming placeholder
    const streamingId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: streamingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        intent,
      },
    ])

    try {
      console.log("[v0] Sending to /api/mcp:", { query, intent })
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          intent,
          conversationHistory: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      console.log("[v0] MCP response status:", res.status)
      const data = await res.json()
      console.log("[v0] MCP response data keys:", Object.keys(data))
      console.log("[v0] MCP properties count:", data.properties?.length || 0)
      console.log("[v0] MCP intent:", data.intent)

      // Update streaming message with real content
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                content: data.summary || data.response || "I couldn't process that request.",
                sources: data.sources,
                properties: data.properties,
                leads: data.leads,
                images: data.images,
                summary: data.summary,
                isStreaming: false,
              }
            : m,
        ),
      )
    } catch (err) {
      console.error("[v0] MCP fetch error:", err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                content: "Sorry, there was an error. Please try again.",
                isStreaming: false,
              }
            : m,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div
      className="flex flex-col h-[100dvh] bg-[#0a0a0a]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="border-2 border-dashed border-amber-500 rounded-3xl p-12 text-center">
            <Upload className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">Drop files here</p>
            <p className="text-sm text-gray-400 mt-2">Images & PDFs supported</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 flex-shrink-0">
            <Image src="/saintsal-logo.png" alt="SaintSal" fill className="rounded-xl object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">
              SaintSal<span className="text-amber-500">™</span>
            </h1>
            <p className="text-[10px] text-gray-500">Research Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-amber-500 hover:text-amber-400 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          // Landing View
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
            <div className="relative h-20 w-20 mb-6 flex-shrink-0">
              <Image src="/saintsal-logo.png" alt="SaintSal" fill className="rounded-2xl object-contain" />
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Ask SaintSal<span className="text-amber-500">™</span> Anything
            </h2>
            <p className="text-gray-400 text-center text-sm mb-8 max-w-md">
              Find properties, generate leads, analyze deals, research markets—all in one conversation.
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt.text)
                    inputRef.current?.focus()
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-[#222] hover:border-amber-500/50 rounded-full text-sm text-gray-300 hover:text-white transition-all group"
                >
                  <prompt.icon className="h-4 w-4 text-amber-500" />
                  {prompt.text}
                </button>
              ))}
            </div>

            {/* Capability Pills */}
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              <span className="px-3 py-1 bg-[#111] rounded-full border border-[#1a1a1a]">
                <Zap className="h-3 w-3 inline mr-1 text-amber-500" />
                35+ Data Sources
              </span>
              <span className="px-3 py-1 bg-[#111] rounded-full border border-[#1a1a1a]">
                <Target className="h-3 w-3 inline mr-1 text-amber-500" />
                Lead Enrichment
              </span>
              <span className="px-3 py-1 bg-[#111] rounded-full border border-[#1a1a1a]">
                <BarChart3 className="h-3 w-3 inline mr-1 text-amber-500" />
                Deal Analysis
              </span>
            </div>
          </div>
        ) : (
          // Chat View
          <div className="px-4 py-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl",
                    message.role === "user"
                      ? "bg-amber-500 text-black px-4 py-3"
                      : "bg-[#111] border border-[#222] px-4 py-4",
                  )}
                >
                  {/* User attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {message.attachments.map((att) => (
                        <div key={att.id} className="relative">
                          {att.preview ? (
                            <img
                              src={att.preview || "/placeholder.svg"}
                              alt=""
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-[#222] rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Streaming indicator */}
                  {message.isStreaming && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-sm">Searching...</span>
                    </div>
                  )}

                  {/* Sources at top (Perplexity style) */}
                  {message.sources && message.sources.length > 0 && !message.isStreaming && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.slice(0, 5).map((source, i) => (
                          <SourcePill key={i} source={source} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main content */}
                  {!message.isStreaming && (
                    <div className={message.role === "user" ? "text-sm font-medium" : ""}>
                      {message.role === "user" ? message.content : <RichContent content={message.content} />}
                    </div>
                  )}

                  {/* Property results */}
                  {message.properties && message.properties.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Home className="h-3 w-3" /> {message.properties.length} Properties Found
                        </p>
                        {message.properties[0]?.source && (
                          <span className="text-[10px] text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded-full">
                            {message.properties[0].source === "RentCast" ? "RentCast + PropertyAPI" : `Powered by ${message.properties[0].source}`}
                          </span>
                        )}
                      </div>
                      <div className="grid gap-3">
                        {message.properties.slice(0, 10).map((property, i) => (
                          <PropertyCard key={i} property={property} />
                        ))}
                      </div>
                      {message.properties.length > 10 && (
                        <button className="w-full mt-3 py-2 text-sm text-amber-500 hover:text-amber-400 transition-colors">
                          View all {message.properties.length} properties
                        </button>
                      )}
                    </div>
                  )}

                  {/* Lead results */}
                  {message.leads && message.leads.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {message.leads.length} Leads Found
                      </p>
                      <div className="grid gap-3">
                        {message.leads.slice(0, 4).map((lead, i) => (
                          <LeadCard key={i} lead={lead} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {message.images.map((img, i) => (
                        <img key={i} src={img || "/placeholder.svg"} alt="" className="rounded-xl w-full" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
      <div className="flex-shrink-0 p-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((att) => (
              <div key={att.id} className="relative flex-shrink-0">
                {att.preview ? (
                  <img
                    src={att.preview || "/placeholder.svg"}
                    alt=""
                    className="h-16 w-16 object-cover rounded-lg border border-[#2a2a2a]"
                  />
                ) : (
                  <div className="h-16 w-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* File upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))}
            accept="image/*,.pdf"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Camera className="h-5 w-5" />
          </button>

          {/* Voice */}
          <button
            type="button"
            onClick={toggleRecording}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white",
            )}
          >
            <Mic className="h-5 w-5" />
          </button>

          {/* Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full h-12 px-4 pr-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />

            {/* Image gen button */}
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={!input?.trim() || isGeneratingImage}
              className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#222] hover:bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors disabled:opacity-50"
            >
              {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={(!input?.trim() && attachments.length === 0) || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-2">
          SaintSal™ can make mistakes. Verify important information.
        </p>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="flex-shrink-0 flex items-center justify-around py-2 border-t border-[#1a1a1a] bg-[#0a0a0a] md:hidden">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
              item.active ? "text-amber-500" : "text-gray-500 hover:text-gray-300",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
