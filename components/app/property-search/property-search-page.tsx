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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Property {
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
  arv: number
  equity: number
  equityPercent: number
  motivation: "high" | "medium" | "low"
  saintSalRating: "A" | "B" | "C"
  estimatedProfit: number
}

const mockSearchResults: Property[] = [
  {
    id: "1",
    address: "1234 Oak Street",
    city: "Costa Mesa",
    state: "CA",
    zip: "92627",
    propertyType: "Single Family",
    beds: 4,
    baths: 3,
    sqft: 2850,
    price: 1300000,
    arv: 1500000,
    equity: 450000,
    equityPercent: 36,
    motivation: "high",
    saintSalRating: "B",
    estimatedProfit: 150000,
  },
  {
    id: "2",
    address: "5678 Palm Ave",
    city: "Newport Beach",
    state: "CA",
    zip: "92660",
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1650,
    price: 985000,
    arv: 1300000,
    equity: 620000,
    equityPercent: 63,
    motivation: "high",
    saintSalRating: "A",
    estimatedProfit: 159000,
  },
  {
    id: "3",
    address: "910 Sunset Blvd",
    city: "Huntington Beach",
    state: "CA",
    zip: "92648",
    propertyType: "Single Family",
    beds: 4,
    baths: 3,
    sqft: 2200,
    price: 1025000,
    arv: 1200000,
    equity: 380000,
    equityPercent: 38,
    motivation: "medium",
    saintSalRating: "A",
    estimatedProfit: 88000,
  },
  {
    id: "4",
    address: "2200 Harbor View",
    city: "Newport Beach",
    state: "CA",
    zip: "92661",
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1850,
    price: 875000,
    arv: 1050000,
    equity: 420000,
    equityPercent: 48,
    motivation: "high",
    saintSalRating: "B",
    estimatedProfit: 95000,
  },
]

export default function PropertySearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Property[]>(mockSearchResults)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showSaintSal, setShowSaintSal] = useState(false)
  const [saintSalInsight, setSaintSalInsight] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Simulate search
    setTimeout(() => {
      setIsSearching(false)
      setSaintSalInsight(
        `I found ${searchResults.length} high-potential properties in ${searchQuery}. ${searchResults.filter((p) => p.saintSalRating === "A").length} are A-rated with strong profit margins. The best opportunities are pre-foreclosures with 40%+ equity.`,
      )
    }, 1500)
  }

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
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
                <p className="text-xs text-gray-500">Powered by SaintSal™</p>
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
              placeholder="Search by City, County, or ZIP code..."
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-4 pl-12 pr-32 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* 4-Step Process Guide */}
        <div className="mb-12 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/30 p-6">
          <h2 className="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: "1", title: "Search", desc: "Find properties with high equity" },
              { num: "2", title: "Ask SaintSal", desc: "Get AI-powered deal insights" },
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

        {/* SaintSal Insight */}
        {saintSalInsight && (
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
                  SaintSal™ Analysis
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

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{searchResults.length} Properties Found</h2>
            <p className="text-sm text-gray-500">
              {searchResults.filter((p) => p.saintSalRating === "A").length} A-Rated •{" "}
              {searchResults.filter((p) => p.motivation === "high").length} High Motivation
            </p>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {searchResults.map((property) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden hover:border-amber-500/30 transition-all group"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="w-12 h-12 text-gray-700" />
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 left-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      property.saintSalRating === "A"
                        ? "bg-green-500 text-white"
                        : property.saintSalRating === "B"
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-500 text-white"
                    }`}
                  >
                    {property.saintSalRating}
                  </div>
                </div>

                {/* Hot Badge */}
                {property.motivation === "high" && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                    HOT
                  </div>
                )}

                {/* Favorite */}
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.includes(property.id) ? "fill-red-500 text-red-500" : "text-white"}`}
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
                  <span className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4" /> {property.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" /> {property.baths}
                  </span>
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" /> {property.sqft.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{formatCurrency(property.price)}</p>
                    <p className="text-xs text-green-500">ARV: {formatCurrency(property.arv)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatCurrency(property.estimatedProfit)}</p>
                    <p className="text-xs text-gray-500">Est. Profit</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                    {property.equityPercent}% Equity
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.motivation === "high"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {property.motivation.charAt(0).toUpperCase() + property.motivation.slice(1)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.price}&arv=${property.arv}&propertyId=${property.id}`}
                    className="px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-amber-500 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    Analyze Deal
                  </Link>
                  <Link
                    href={`/apply?propertyId=${property.id}&address=${encodeURIComponent(property.address)}`}
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
      </div>
    </div>
  )
}
