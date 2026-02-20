"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Home,
  Calculator,
  Sparkles,
  ArrowRight,
  Heart,
  Bath,
  BedDouble,
  Square,
  CheckCircle2,
  MessageCircle,
  Search,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  DollarSign,
  AlertTriangle,
  Shield,
  User,
  CalendarDays,
  Building,
  Landmark,
  Eye,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyResult {
  radarId?: string
  address: string
  city: string
  state: string
  zip: string
  county?: string
  apn?: string
  latitude?: number
  longitude?: number
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
  lotSize?: number
  yearBuilt?: number
  units?: number
  value?: number
  equity?: number
  equityPercent?: number
  availableEquity?: number
  loanBalance?: number
  ownerName?: string
  ownerAddress?: string
  ownerCity?: string
  ownerState?: string
  ownerZip?: string
  yearsOwned?: number
  foreclosureStatus?: string
  foreclosureAuctionDate?: string
  foreclosureOpeningBid?: number
  taxDefaultYears?: number
  taxDefaultAmount?: number
  inBankruptcy?: boolean
  bankruptcyStatus?: string
  bankruptcyChapter?: string
  inDivorce?: boolean
  divorceRecordingDate?: string
  isVacant?: boolean
  isDeceased?: boolean
  hasLiens?: boolean
  lienAmount?: number
  transferType?: string
  transferDate?: string
  transferAmount?: number
  lastSaleDate?: string
  lastSalePrice?: number
  loanRate?: number
  loanType?: string
  listedForSale?: boolean
  listPrice?: number
  listingDate?: string
  daysOnMarket?: number
  assessedValue?: number
  annualTaxes?: number
  source?: string
  // RentCast compat
  isSubject?: boolean
  correlation?: number
  distance?: number
}

interface SearchFilters {
  city: string
  state: string
  zip: string
  propertyType: string
  foreclosure: boolean
  taxDelinquent: boolean
  bankruptcy: boolean
  divorce: boolean
  vacant: boolean
  deceased: boolean
  absenteeOwner: boolean
  listedForSale: boolean
  bedsMin: string
  bedsMax: string
  bathsMin: string
  bathsMax: string
  valueMin: string
  valueMax: string
  equityMin: string
  equityMax: string
  yearBuiltMin: string
  yearBuiltMax: string
}

const DEFAULT_FILTERS: SearchFilters = {
  city: "",
  state: "CA",
  zip: "",
  propertyType: "",
  foreclosure: false,
  taxDelinquent: false,
  bankruptcy: false,
  divorce: false,
  vacant: false,
  deceased: false,
  absenteeOwner: false,
  listedForSale: false,
  bedsMin: "",
  bedsMax: "",
  bathsMin: "",
  bathsMax: "",
  valueMin: "",
  valueMax: "",
  equityMin: "",
  equityMax: "",
  yearBuiltMin: "",
  yearBuiltMax: "",
}

const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "SFR", label: "Single Family" },
  { value: "MFR", label: "Multi-Family" },
  { value: "CND", label: "Condo/Townhouse" },
  { value: "COM", label: "Commercial" },
  { value: "VL", label: "Vacant Land" },
  { value: "MH", label: "Mobile/Manufactured" },
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
  if (!num || num === 0) return "$0"
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

function getDistressBadges(p: PropertyResult) {
  const badges: { label: string; color: string }[] = []
  if (p.foreclosureStatus) badges.push({ label: `Foreclosure: ${p.foreclosureStatus}`, color: "bg-red-500/20 text-red-400" })
  if (p.taxDefaultYears && p.taxDefaultYears > 0) badges.push({ label: `Tax Default ${p.taxDefaultYears}yr`, color: "bg-orange-500/20 text-orange-400" })
  if (p.inBankruptcy) badges.push({ label: `Bankruptcy${p.bankruptcyChapter ? ` Ch.${p.bankruptcyChapter}` : ""}`, color: "bg-red-500/20 text-red-400" })
  if (p.inDivorce) badges.push({ label: "Divorce", color: "bg-purple-500/20 text-purple-400" })
  if (p.isVacant) badges.push({ label: "Vacant", color: "bg-yellow-500/20 text-yellow-400" })
  if (p.isDeceased) badges.push({ label: "Deceased Owner", color: "bg-gray-500/20 text-gray-400" })
  if (p.listedForSale) badges.push({ label: "Listed for Sale", color: "bg-green-500/20 text-green-400" })
  return badges
}

// ---------------------------------------------------------------------------
// Filter Panel Component
// ---------------------------------------------------------------------------

function FilterPanel({
  filters,
  setFilters,
  onSearch,
  isSearching,
  activeFilterCount,
}: {
  filters: SearchFilters
  setFilters: (f: SearchFilters) => void
  onSearch: () => void
  isSearching: boolean
  activeFilterCount: number
}) {
  const [expanded, setExpanded] = useState(false)

  const updateFilter = (key: keyof SearchFilters, value: string | boolean) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      city: filters.city,
      state: filters.state,
      zip: filters.zip,
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Filter Toggle Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 space-y-5">
              {/* Property Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Distress Signals */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  Distress Signals
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "foreclosure" as const, label: "Foreclosure" },
                    { key: "taxDelinquent" as const, label: "Tax Delinquent" },
                    { key: "bankruptcy" as const, label: "Bankruptcy" },
                    { key: "divorce" as const, label: "Divorce" },
                    { key: "vacant" as const, label: "Vacant" },
                    { key: "deceased" as const, label: "Deceased Owner" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters[key] as boolean}
                        onChange={(e) => updateFilter(key, e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-input accent-primary"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Owner / Listing Filters */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Owner &amp; Listing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.absenteeOwner}
                      onChange={(e) => updateFilter("absenteeOwner", e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-input accent-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Absentee Owner
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.listedForSale}
                      onChange={(e) => updateFilter("listedForSale", e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-input accent-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Listed for Sale
                    </span>
                  </label>
                </div>
              </div>

              {/* Beds / Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Beds (min - max)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.bedsMin}
                      onChange={(e) => updateFilter("bedsMin", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.bedsMax}
                      onChange={(e) => updateFilter("bedsMax", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Baths (min - max)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.bathsMin}
                      onChange={(e) => updateFilter("bathsMin", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.bathsMax}
                      onChange={(e) => updateFilter("bathsMax", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Value / Equity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Value Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={filters.valueMin}
                      onChange={(e) => updateFilter("valueMin", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={filters.valueMax}
                      onChange={(e) => updateFilter("valueMax", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Equity % Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min %"
                      value={filters.equityMin}
                      onChange={(e) => updateFilter("equityMin", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Max %"
                      value={filters.equityMax}
                      onChange={(e) => updateFilter("equityMax", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Year Built */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Year Built Range
                </label>
                <div className="flex gap-2 max-w-xs">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.yearBuiltMin}
                    onChange={(e) => updateFilter("yearBuiltMin", e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.yearBuiltMax}
                    onChange={(e) => updateFilter("yearBuiltMax", e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onSearch}
                  disabled={isSearching}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search Properties
                    </>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Property Card Component
// ---------------------------------------------------------------------------

function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  onViewDetail,
}: {
  property: PropertyResult
  isFavorite: boolean
  onToggleFavorite: () => void
  onViewDetail: () => void
}) {
  const badges = getDistressBadges(property)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden transition-all group hover:border-primary/30"
    >
      {/* Top Section with badges */}
      <div className="relative h-36 bg-secondary/30 flex items-center justify-center">
        <Building className="w-10 h-10 text-muted-foreground/30" />

        {/* Distress badges */}
        {badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {badges.slice(0, 3).map((b) => (
              <span key={b.label} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.color}`}>
                {b.label}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                +{badges.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Equity badge */}
        {property.equityPercent !== undefined && property.equityPercent !== null && (
          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              property.equityPercent >= 50
                ? "bg-green-500/20 text-green-400"
                : property.equityPercent >= 20
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}>
              {property.equityPercent.toFixed(0)}% Equity
            </span>
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={onToggleFavorite}
          className="absolute bottom-2.5 right-2.5 p-2 bg-background/50 hover:bg-background/70 rounded-full transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground/60"}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-0.5 truncate">{property.address}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {property.city}, {property.state} {property.zip}
          {property.county ? ` - ${property.county}` : ""}
        </p>

        {/* Property specs */}
        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
          {property.beds !== undefined && property.beds > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" /> {property.beds}
            </span>
          )}
          {property.baths !== undefined && property.baths > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {property.baths}
            </span>
          )}
          {property.sqft !== undefined && property.sqft > 0 && (
            <span className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5" /> {property.sqft.toLocaleString()}
            </span>
          )}
          {property.yearBuilt && (
            <span className="text-muted-foreground/60 text-xs">Built {property.yearBuilt}</span>
          )}
        </div>

        {/* Value row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(property.value || property.listPrice)}
            </p>
            <p className="text-xs text-muted-foreground">
              {property.listedForSale ? "List Price" : "Est. Value (AVM)"}
            </p>
          </div>
          {property.lastSalePrice && (
            <div className="text-right">
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(property.lastSalePrice)}
              </p>
              <p className="text-xs text-muted-foreground">
                Sold {property.lastSaleDate ? new Date(property.lastSaleDate).toLocaleDateString() : ""}
              </p>
            </div>
          )}
        </div>

        {/* Owner info */}
        {property.ownerName && (
          <div className="mb-3 px-3 py-2 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{property.ownerName}</span>
              {property.yearsOwned !== undefined && property.yearsOwned > 0 && (
                <span className="text-muted-foreground/60">({property.yearsOwned}yr owned)</span>
              )}
            </div>
          </div>
        )}

        {/* Type + price/sqft badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {property.propertyType && (
            <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
              {property.propertyType}
            </span>
          )}
          {property.sqft && property.value && property.sqft > 0 && property.value > 0 && (
            <span className="px-2.5 py-1 bg-primary/15 text-primary rounded-full text-xs font-medium">
              ${Math.round(property.value / property.sqft)}/sqft
            </span>
          )}
          {property.loanBalance !== undefined && property.loanBalance > 0 && (
            <span className="px-2.5 py-1 bg-secondary text-muted-foreground rounded-full text-xs font-medium">
              Loan: {formatCurrency(property.loanBalance)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onViewDetail}
            className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </button>
          <Link
            href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.value || 0}&arv=${property.value || 0}`}
            className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-primary font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            Analyze
          </Link>
          <Link
            href={`/apply?address=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`)}`}
            className="px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Capital
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Property Detail Modal
// ---------------------------------------------------------------------------

function PropertyDetailModal({
  property,
  onClose,
}: {
  property: PropertyResult
  onClose: () => void
}) {
  const badges = getDistressBadges(property)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{property.address}</h2>
            <p className="text-sm text-muted-foreground">
              {property.city}, {property.state} {property.zip}
              {property.radarId ? ` - Radar ID: ${property.radarId}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Distress Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b.label} className={`px-3 py-1 rounded-full text-sm font-semibold ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {/* Value & Equity */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DetailStat label="Est. Value (AVM)" value={formatCurrency(property.value)} highlight />
            <DetailStat label="Equity %" value={property.equityPercent !== undefined ? `${property.equityPercent.toFixed(1)}%` : "--"} />
            <DetailStat label="Equity $" value={formatCurrency(property.equity)} />
            <DetailStat label="Loan Balance" value={formatCurrency(property.loanBalance)} />
          </div>

          {/* Property Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary" />
              Property Details
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <DetailItem label="Type" value={property.propertyType || "--"} />
              <DetailItem label="Beds" value={property.beds?.toString() || "--"} />
              <DetailItem label="Baths" value={property.baths?.toString() || "--"} />
              <DetailItem label="Sq Ft" value={property.sqft?.toLocaleString() || "--"} />
              <DetailItem label="Lot Size" value={property.lotSize?.toLocaleString() || "--"} />
              <DetailItem label="Year Built" value={property.yearBuilt?.toString() || "--"} />
              <DetailItem label="Units" value={property.units?.toString() || "--"} />
              <DetailItem label="APN" value={property.apn || "--"} />
            </div>
          </div>

          {/* Owner Info */}
          {property.ownerName && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                Owner Information
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailItem label="Owner" value={property.ownerName} />
                <DetailItem label="Years Owned" value={property.yearsOwned?.toString() || "--"} />
                <DetailItem label="Mail Address" value={property.ownerAddress || "--"} />
                {property.ownerCity && (
                  <DetailItem label="Mail City/State" value={`${property.ownerCity}, ${property.ownerState || ""} ${property.ownerZip || ""}`} />
                )}
              </div>
            </div>
          )}

          {/* Transfer History */}
          {(property.lastSaleDate || property.transferDate) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                Transfer / Sale History
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailItem label="Last Sale Date" value={property.lastSaleDate ? new Date(property.lastSaleDate).toLocaleDateString() : "--"} />
                <DetailItem label="Last Sale Price" value={formatCurrency(property.lastSalePrice)} />
                <DetailItem label="Transfer Type" value={property.transferType || "--"} />
              </div>
            </div>
          )}

          {/* Loan Info */}
          {(property.loanBalance || property.loanRate || property.loanType) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-primary" />
                Loan Details
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailItem label="Balance" value={formatCurrency(property.loanBalance)} />
                <DetailItem label="Rate" value={property.loanRate ? `${property.loanRate}%` : "--"} />
                <DetailItem label="Type" value={property.loanType || "--"} />
              </div>
            </div>
          )}

          {/* Foreclosure Detail */}
          {property.foreclosureStatus && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Foreclosure Details
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailItem label="Status" value={property.foreclosureStatus} />
                <DetailItem label="Auction Date" value={property.foreclosureAuctionDate ? new Date(property.foreclosureAuctionDate).toLocaleDateString() : "--"} />
                <DetailItem label="Opening Bid" value={formatCurrency(property.foreclosureOpeningBid)} />
              </div>
            </div>
          )}

          {/* Tax Info */}
          {(property.assessedValue || property.annualTaxes || property.taxDefaultYears) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                Tax Information
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailItem label="Assessed Value" value={formatCurrency(property.assessedValue)} />
                <DetailItem label="Annual Taxes" value={formatCurrency(property.annualTaxes)} />
                {property.taxDefaultYears !== undefined && property.taxDefaultYears > 0 && (
                  <>
                    <DetailItem label="Tax Default Years" value={property.taxDefaultYears.toString()} />
                    <DetailItem label="Tax Default Amount" value={formatCurrency(property.taxDefaultAmount)} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Link
              href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.value || 0}&arv=${property.value || 0}`}
              className="flex-1 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-primary font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Run Deal Analysis
            </Link>
            <Link
              href={`/apply?address=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`)}`}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply for Capital
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DetailStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PropertySearchPage() {
  const [searchMode, setSearchMode] = useState<"area" | "address">("area")
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [addressQuery, setAddressQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<PropertyResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [resultCount, setResultCount] = useState(0)
  const [detailProperty, setDetailProperty] = useState<PropertyResult | null>(null)

  // Count active advanced filters (beyond city/state/zip)
  const activeFilterCount = [
    filters.propertyType,
    filters.foreclosure,
    filters.taxDelinquent,
    filters.bankruptcy,
    filters.divorce,
    filters.vacant,
    filters.deceased,
    filters.absenteeOwner,
    filters.listedForSale,
    filters.bedsMin,
    filters.bedsMax,
    filters.bathsMin,
    filters.bathsMax,
    filters.valueMin,
    filters.valueMax,
    filters.equityMin,
    filters.equityMax,
    filters.yearBuiltMin,
    filters.yearBuiltMax,
  ].filter(Boolean).length

  const handleAreaSearch = useCallback(async () => {
    if (!filters.city && !filters.zip) {
      setError("Please enter a city or zip code")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        state: filters.state || "CA",
        limit: 20,
        purchase: 1,
      }

      if (filters.city) body.city = filters.city
      if (filters.zip) body.zip = filters.zip
      if (filters.propertyType) body.propertyType = filters.propertyType
      if (filters.foreclosure) body.foreclosure = true
      if (filters.taxDelinquent) body.taxDelinquent = true
      if (filters.bankruptcy) body.bankruptcy = true
      if (filters.divorce) body.divorce = true
      if (filters.vacant) body.vacant = true
      if (filters.deceased) body.deceased = true
      if (filters.absenteeOwner) body.absenteeOwner = true
      if (filters.listedForSale) body.listedForSale = true
      if (filters.bedsMin) body.bedsMin = parseInt(filters.bedsMin)
      if (filters.bedsMax) body.bedsMax = parseInt(filters.bedsMax)
      if (filters.bathsMin) body.bathsMin = parseInt(filters.bathsMin)
      if (filters.bathsMax) body.bathsMax = parseInt(filters.bathsMax)
      if (filters.valueMin) body.valueMin = parseInt(filters.valueMin)
      if (filters.valueMax) body.valueMax = parseInt(filters.valueMax)
      if (filters.equityMin) body.equityMin = parseInt(filters.equityMin)
      if (filters.equityMax) body.equityMax = parseInt(filters.equityMax)
      if (filters.yearBuiltMin) body.yearBuiltMin = parseInt(filters.yearBuiltMin)
      if (filters.yearBuiltMax) body.yearBuiltMax = parseInt(filters.yearBuiltMax)

      const res = await fetch("/api/property-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || `Search failed (${res.status})`)
        setResults([])
        setResultCount(0)
      } else {
        setResults(data.properties || [])
        setResultCount(data.resultCount || 0)
      }

      setHasSearched(true)
    } catch (err) {
      console.error("Search error:", err)
      setError("Something went wrong. Please check your connection and try again.")
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [filters])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="SaintSal" width={32} height={32} className="rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Property<span className="text-primary">Radar</span> Search
                </h1>
                <p className="text-xs text-muted-foreground">250+ Criteria | Powered by PropertyRadar</p>
              </div>
            </div>
            <Link
              href="/apply"
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Apply for Capital
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Mode Tabs */}
        <div className="flex items-center gap-1 mb-6 max-w-2xl mx-auto bg-secondary/50 rounded-xl p-1">
          <button
            onClick={() => setSearchMode("area")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              searchMode === "area"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Area Search
          </button>
          <button
            onClick={() => setSearchMode("address")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              searchMode === "address"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-4 h-4" />
            Address Lookup
          </button>
        </div>

        {/* Area Search Mode */}
        {searchMode === "area" && (
          <div className="space-y-4 max-w-2xl mx-auto mb-8">
            {/* Location Inputs */}
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAreaSearch()}
                  placeholder="City (e.g. Los Angeles)"
                  className="w-full bg-input border border-border rounded-xl py-3.5 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="w-24">
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full bg-input border border-border rounded-xl py-3.5 px-3 text-foreground focus:outline-none focus:border-primary text-sm"
                >
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <input
                  type="text"
                  value={filters.zip}
                  onChange={(e) => setFilters({ ...filters, zip: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAreaSearch()}
                  placeholder="Zip"
                  className="w-full bg-input border border-border rounded-xl py-3.5 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleAreaSearch}
                disabled={isSearching}
                className="px-6 py-3.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Advanced Filters */}
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onSearch={handleAreaSearch}
              isSearching={isSearching}
              activeFilterCount={activeFilterCount}
            />
          </div>
        )}

        {/* Address Lookup Mode */}
        {searchMode === "address" && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Use the area search with address
                    if (addressQuery.trim()) {
                      setFilters({ ...filters, city: "", zip: "" })
                      // Parse simple city, state from address
                      const parts = addressQuery.split(",").map((p) => p.trim())
                      if (parts.length >= 2) {
                        const stateZip = parts[parts.length - 1].match(/([A-Z]{2})\s*(\d{5})?/i)
                        if (stateZip) {
                          setFilters((prev) => ({
                            ...prev,
                            city: parts.length >= 3 ? parts[1] : "",
                            state: stateZip[1].toUpperCase(),
                            zip: stateZip[2] || "",
                          }))
                        }
                      }
                      handleAreaSearch()
                    }
                  }
                }}
                placeholder="Enter address: 123 Main St, Austin, TX 78701"
                className="w-full bg-input border border-border rounded-xl py-3.5 pl-12 pr-32 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAreaSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quick Search Presets */}
        {!hasSearched && !isSearching && (
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-xs text-muted-foreground mb-3 text-center">Quick Searches</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Foreclosures in LA", city: "Los Angeles", state: "CA", foreclosure: true },
                { label: "Tax Default - Sacramento", city: "Sacramento", state: "CA", taxDelinquent: true },
                { label: "Absentee Owners - Phoenix", city: "Phoenix", state: "AZ", absenteeOwner: true },
                { label: "Vacant Properties - Miami", city: "Miami", state: "FL", vacant: true },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setSearchMode("area")
                    setFilters({
                      ...DEFAULT_FILTERS,
                      city: preset.city,
                      state: preset.state,
                      foreclosure: preset.foreclosure || false,
                      taxDelinquent: preset.taxDelinquent || false,
                      absenteeOwner: preset.absenteeOwner || false,
                      vacant: preset.vacant || false,
                    })
                    // Trigger search after state update
                    setTimeout(() => {
                      document.querySelector<HTMLButtonElement>("[data-search-trigger]")?.click()
                    }, 50)
                  }}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-w-2xl mx-auto flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* How It Works */}
        {!hasSearched && !isSearching && (
          <>
            <div className="mb-12 bg-primary/5 rounded-xl border border-primary/20 p-6 max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                How It Works
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {[
                  { num: "1", title: "Search", desc: "Search by city, zip, or address with 250+ criteria" },
                  { num: "2", title: "Filter", desc: "Foreclosures, distress, equity, owner type & more" },
                  { num: "3", title: "Analyze", desc: "Run numbers in the Deal Analyzer" },
                  { num: "4", title: "Submit", desc: "Apply for capital with 1 click" },
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                    {idx < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground/30 mt-2 hidden sm:block" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-card border border-border flex items-center justify-center">
                <Search className="w-10 h-10 text-primary/40" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 text-balance">
                Search 150M+ Properties Nationwide
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-pretty">
                Use PropertyRadar's 250+ search criteria to find foreclosures, distressed properties, motivated sellers, and hidden deals.
              </p>
            </motion.div>
          </>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Searching PropertyRadar...</h2>
            <p className="text-muted-foreground">Querying 150M+ property records with your criteria</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isSearching && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {resultCount} {resultCount === 1 ? "Property" : "Properties"} Found
                </h2>
                <p className="text-sm text-muted-foreground">
                  Real-time data from PropertyRadar
                  {activeFilterCount > 0 ? ` | ${activeFilterCount} filters active` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((property, idx) => (
                <PropertyCard
                  key={property.radarId || `pr-${idx}`}
                  property={property}
                  isFavorite={favorites.includes(property.radarId || `pr-${idx}`)}
                  onToggleFavorite={() => toggleFavorite(property.radarId || `pr-${idx}`)}
                  onViewDetail={() => setDetailProperty(property)}
                />
              ))}
            </div>
          </>
        )}

        {/* No Results */}
        {hasSearched && !isSearching && results.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-card border border-border flex items-center justify-center">
              <Home className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try broadening your search criteria, checking a different city, or removing some filters.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailProperty && (
          <PropertyDetailModal
            property={detailProperty}
            onClose={() => setDetailProperty(null)}
          />
        )}
      </AnimatePresence>

      {/* Hidden search trigger for quick presets */}
      <button data-search-trigger className="hidden" onClick={handleAreaSearch} />
    </div>
  )
}
