"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface RentCastResponse {
  price: number
  priceRangeLow: number
  priceRangeHigh: number
  pricePerSquareFoot: number
  latitude: number
  longitude: number
  comparables: RentCastComparable[]
  // Property details from AVM
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  formattedAddress?: string
}

interface RentCastComparable {
  id?: string
  formattedAddress: string
  addressLine1: string
  city: string
  state: string
  zipCode: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  squareFootage: number
  lotSize?: number
  yearBuilt?: number
  price: number
  lastSaleDate?: string
  lastSalePrice?: number
  distance?: number
  correlation?: number
}

interface DisplayProperty {
  id: string
  address: string
  city: string
  state: string
  zip: string
  propertyType: string
  beds: number
  baths: number
  sqft: number
  price: number
  yearBuilt?: number
  distance?: number
  correlation?: number
  lastSaleDate?: string
  lastSalePrice?: number
  isSubject?: boolean
}

function parseSearchQuery(query: string): { address: string; city: string; state: string; zip?: string } | null {
  const trimmed = query.trim()
  // Try to parse "address, city, state zip" format
  const parts = trimmed.split(",").map((p) => p.trim())

  if (parts.length >= 3) {
    const stateZipPart = parts[2].trim()
    const stateZipMatch = stateZipPart.match(/^([A-Za-z]{2})\s*(\d{5})?$/)
    if (stateZipMatch) {
      return {
        address: parts[0],
        city: parts[1],
        state: stateZipMatch[1].toUpperCase(),
        zip: stateZipMatch[2] || undefined,
      }
    }
    return {
      address: parts[0],
      city: parts[1],
      state: parts.slice(2).join(", "),
    }
  }

  if (parts.length === 2) {
    // Could be "address, city state zip"
    const cityStateZip = parts[1].trim()
    const match = cityStateZip.match(/^(.+?)\s+([A-Za-z]{2})\s*(\d{5})?$/)
    if (match) {
      return {
        address: parts[0],
        city: match[1].trim(),
        state: match[2].toUpperCase(),
        zip: match[3] || undefined,
      }
    }
  }

  return null
}

export default function PropertySearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<DisplayProperty[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showSaintSal, setShowSaintSal] = useState(false)
  const [saintSalInsight, setSaintSalInsight] = useState("")
  const [subjectValuation, setSubjectValuation] = useState<{
    price: number
    priceLow: number
    priceHigh: number
    pricePerSqft: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    const parsed = parseSearchQuery(searchQuery)
    if (!parsed) {
      setError("Please enter a full address in the format: 123 Main St, City, ST 12345")
      return
    }

    setIsSearching(true)
    setError(null)
    setSaintSalInsight("")
    setSubjectValuation(null)

    try {
      const params = new URLSearchParams({
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
      })
      if (parsed.zip) params.set("zip", parsed.zip)

      const response = await fetch(`/api/property-search?${params.toString()}`)
      const data: RentCastResponse | { error: string } = await response.json()

      if (!response.ok || "error" in data) {
        const errMsg = "error" in data ? data.error : `Search failed (${response.status})`
        setError(errMsg)
        setSearchResults([])
        setHasSearched(true)
        setIsSearching(false)
        return
      }

      const avmData = data as RentCastResponse

      // Build subject property
      const subject: DisplayProperty = {
        id: "subject",
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip || avmData.zipCode || "",
        propertyType: avmData.propertyType || "Single Family",
        beds: avmData.bedrooms || 0,
        baths: avmData.bathrooms || 0,
        sqft: avmData.squareFootage || 0,
        price: avmData.price || 0,
        isSubject: true,
      }

      setSubjectValuation({
        price: avmData.price,
        priceLow: avmData.priceRangeLow,
        priceHigh: avmData.priceRangeHigh,
        pricePerSqft: avmData.pricePerSquareFoot,
      })

      // Build comparable properties
      const comps: DisplayProperty[] = (avmData.comparables || []).map((comp, idx) => ({
        id: comp.id || `comp-${idx}`,
        address: comp.addressLine1,
        city: comp.city,
        state: comp.state,
        zip: comp.zipCode,
        propertyType: comp.propertyType || "Single Family",
        beds: comp.bedrooms || 0,
        baths: comp.bathrooms || 0,
        sqft: comp.squareFootage || 0,
        price: comp.price || 0,
        yearBuilt: comp.yearBuilt,
        distance: comp.distance,
        correlation: comp.correlation,
        lastSaleDate: comp.lastSaleDate,
        lastSalePrice: comp.lastSalePrice,
      }))

      const allResults = [subject, ...comps]
      setSearchResults(allResults)
      setHasSearched(true)

      // Generate real SaintSal insight from actual data
      const avgCompPrice = comps.length > 0
        ? comps.reduce((sum, c) => sum + c.price, 0) / comps.length
        : 0
      const compRange = comps.length > 0
        ? `${formatCurrency(Math.min(...comps.map((c) => c.price)))} - ${formatCurrency(Math.max(...comps.map((c) => c.price)))}`
        : "N/A"

      setSaintSalInsight(
        `Valuation for ${parsed.address}: estimated at ${formatCurrency(avmData.price)} (range: ${formatCurrency(avmData.priceRangeLow)} - ${formatCurrency(avmData.priceRangeHigh)}). ` +
        `${comps.length} comparable properties found with an average price of ${formatCurrency(avgCompPrice)} (${compRange}). ` +
        (avmData.pricePerSquareFoot ? `Price per sqft: $${avmData.pricePerSquareFoot.toFixed(0)}/sqft.` : "")
      )
    } catch (err) {
      console.error("Search error:", err)
      setError("Something went wrong. Please check your connection and try again.")
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  const formatCurrency = (num: number) => {
    if (!num || num === 0) return "$0"
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="SaintSal" width={32} height={32} className="rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Property<span className="text-amber-500">Search</span>
                </h1>
                <p className="text-xs text-gray-500">Powered by SaintSal &amp; RentCast</p>
              </div>
            </div>
            <Link
              href="/apply"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              Apply for Capital
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter a full address: 123 Main St, Austin, TX 78701"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-4 pl-12 pr-32 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 max-w-2xl mx-auto flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </div>

        {/* 4-Step Process Guide */}
        <div className="mb-12 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/30 p-6">
          <h2 className="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: "1", title: "Search", desc: "Look up any property by address" },
              { num: "2", title: "Valuate", desc: "Get real market valuations & comps" },
              { num: "3", title: "Analyze", desc: "Run numbers in Deal Analyzer" },
              { num: "4", title: "Submit", desc: "Apply for capital with 1 click" },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500 font-bold">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
                {idx < 3 && <ArrowRight className="w-4 h-4 text-gray-600 mt-2 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (before first search) */}
        {!hasSearched && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
              <Search className="w-10 h-10 text-amber-500/50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Search for a Property</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a full property address to get real-time valuations, comparable sales, and market data powered by RentCast.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-gray-600">Try:</span>
              {[
                "123 Main St, Austin, TX 78701",
                "456 Oak Ave, Miami, FL 33101",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setSearchQuery(example)
                  }}
                  className="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-amber-500 hover:border-amber-500/30 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-amber-500 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Looking up property data...</h2>
            <p className="text-gray-500">Fetching real-time valuations and comparables from RentCast</p>
          </div>
        )}

        {/* SaintSal Insight */}
        {saintSalInsight && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#1a1a1a] rounded-xl border border-amber-500/30"
          >
            <div className="flex items-start gap-3">
              <Image src="/logo.png" alt="SaintSal" width={40} height={40} className="rounded-full" />
              <div className="flex-1">
                <h4 className="text-amber-500 font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  SaintSal Analysis
                </h4>
                <p className="text-gray-300 text-sm mt-1">{saintSalInsight}</p>
              </div>
              <button
                onClick={() => setShowSaintSal(!showSaintSal)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Ask More
              </button>
            </div>
          </motion.div>
        )}

        {/* Subject Valuation Summary */}
        {subjectValuation && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
              <p className="text-xs text-gray-500 mb-1">Estimated Value</p>
              <p className="text-2xl font-bold text-amber-500">{formatCurrency(subjectValuation.price)}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
              <p className="text-xs text-gray-500 mb-1">Value Range Low</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(subjectValuation.priceLow)}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
              <p className="text-xs text-gray-500 mb-1">Value Range High</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(subjectValuation.priceHigh)}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
              <p className="text-xs text-gray-500 mb-1">Price / Sqft</p>
              <p className="text-2xl font-bold text-white">
                {subjectValuation.pricePerSqft ? `$${subjectValuation.pricePerSqft.toFixed(0)}` : "--"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {hasSearched && !isSearching && searchResults.length > 0 && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {searchResults.length === 1
                    ? "Subject Property"
                    : `Subject Property + ${searchResults.length - 1} Comparables`}
                </h2>
                <p className="text-sm text-gray-500">Real-time data from RentCast</p>
              </div>
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#1a1a1a] rounded-xl border overflow-hidden transition-all group ${
                    property.isSubject
                      ? "border-amber-500/50 ring-1 ring-amber-500/20"
                      : "border-[#2a2a2a] hover:border-amber-500/30"
                  }`}
                >
                  {/* Property Header */}
                  <div className="relative h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-700" />
                    </div>

                    {/* Subject Badge */}
                    {property.isSubject && (
                      <div className="absolute top-3 left-3">
                        <div className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500 text-black">
                          SUBJECT
                        </div>
                      </div>
                    )}

                    {/* Comp Badge */}
                    {!property.isSubject && property.correlation && (
                      <div className="absolute top-3 left-3">
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-[#2a2a2a] text-gray-300">
                          {(property.correlation * 100).toFixed(0)}% Match
                        </div>
                      </div>
                    )}

                    {/* Distance Badge */}
                    {!property.isSubject && property.distance !== undefined && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-[#2a2a2a] text-gray-300 text-sm font-medium rounded-full">
                        {property.distance.toFixed(1)} mi
                      </div>
                    )}

                    {/* Favorite */}
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(property.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Property Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-1">{property.address}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {property.city}, {property.state} {property.zip}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                      {property.beds > 0 && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-4 h-4" /> {property.beds}
                        </span>
                      )}
                      {property.baths > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-4 h-4" /> {property.baths}
                        </span>
                      )}
                      {property.sqft > 0 && (
                        <span className="flex items-center gap-1">
                          <Square className="w-4 h-4" /> {property.sqft.toLocaleString()}
                        </span>
                      )}
                      {property.yearBuilt && (
                        <span className="text-gray-500">Built {property.yearBuilt}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-amber-500">
                          {formatCurrency(property.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.isSubject ? "Estimated Value" : "Sale Price"}
                        </p>
                      </div>
                      {property.lastSalePrice && property.lastSaleDate && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            {formatCurrency(property.lastSalePrice)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Sold {new Date(property.lastSaleDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-[#2a2a2a] text-gray-300 rounded-full text-xs font-medium">
                        {property.propertyType}
                      </span>
                      {property.sqft > 0 && property.price > 0 && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                          ${Math.round(property.price / property.sqft)}/sqft
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.price}&arv=${property.price}&propertyId=${property.id}`}
                        className="px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-amber-500 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Calculator className="w-4 h-4" />
                        Analyze Deal
                      </Link>
                      <Link
                        href={`/apply?address=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`)}`}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Get Capital
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* No Results State */}
        {hasSearched && !isSearching && searchResults.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
              <Home className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We could not find data for that address. Make sure you enter a complete address with city and state.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
