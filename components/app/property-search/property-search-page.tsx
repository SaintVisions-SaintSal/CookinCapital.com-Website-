"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  MapPin,
  Home,
  Filter,
  Eye,
  Zap,
  Clock,
  Heart,
  Bookmark,
  Grid3X3,
  List,
  Download,
  Bell,
  BellRing,
  Save,
  Bath,
  BedDouble,
  Square,
  Calculator,
  Banknote,
  FileText,
  RefreshCw,
  Layers,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Types
interface SavedSearch {
  id: string
  name: string
  criteria: Record<string, any>
  alertsEnabled: boolean
  alertFrequency: string
  lastRun: string
  newMatches: number
  totalMatches: number
}

interface PortfolioProperty {
  id: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  arv: number
  equity: number
  beds: number
  baths: number
  sqft: number
  propertyType: string
  motivation: string
  leadSource: string
  status: string
  savedDate: string
  notes: string
  lendingStatus: string | null
  estimatedRehab: number
  estimatedProfit: number
}

// Property types
const propertyTypes = [
  "Single Family",
  "Multi-Family",
  "Condo/Townhouse",
  "Commercial",
  "Land",
  "Mixed Use",
  "Industrial",
  "Mobile Home",
]

// Lead sources / Motivation indicators
const leadSources = [
  "Pre-Foreclosure",
  "Probate",
  "Divorce",
  "Tax Lien",
  "Absentee Owner",
  "Vacant",
  "High Equity",
  "Code Violation",
  "Tired Landlord",
  "Inherited",
  "REO/Bank Owned",
  "Short Sale",
  "Auction",
]

// Mock saved searches
const mockSavedSearches: SavedSearch[] = [
  {
    id: "1",
    name: "Orange County High Equity",
    criteria: {
      location: "Orange County, CA",
      minEquity: 30,
      propertyTypes: ["Single Family"],
      leadSources: ["High Equity"],
    },
    alertsEnabled: true,
    alertFrequency: "daily",
    lastRun: "2 hours ago",
    newMatches: 12,
    totalMatches: 156,
  },
  {
    id: "2",
    name: "LA Multi-Family Under $2M",
    criteria: { location: "Los Angeles, CA", maxPrice: 2000000, propertyTypes: ["Multi-Family"], minEquity: 20 },
    alertsEnabled: true,
    alertFrequency: "instant",
    lastRun: "1 day ago",
    newMatches: 5,
    totalMatches: 89,
  },
  {
    id: "3",
    name: "San Diego Pre-Foreclosure",
    criteria: { location: "San Diego, CA", leadSources: ["Pre-Foreclosure", "Tax Lien"], minEquity: 25 },
    alertsEnabled: false,
    alertFrequency: "weekly",
    lastRun: "3 days ago",
    newMatches: 0,
    totalMatches: 42,
  },
  {
    id: "4",
    name: "Riverside Investment Grade",
    criteria: { location: "Riverside, CA", minEquity: 25, maxPrice: 800000, propertyTypes: ["Single Family"] },
    alertsEnabled: true,
    alertFrequency: "daily",
    lastRun: "5 hours ago",
    newMatches: 8,
    totalMatches: 234,
  },
  {
    id: "5",
    name: "OC Probate Deals",
    criteria: { location: "Orange County, CA", leadSources: ["Probate", "Inherited"], minEquity: 40 },
    alertsEnabled: true,
    alertFrequency: "instant",
    lastRun: "30 minutes ago",
    newMatches: 3,
    totalMatches: 67,
  },
]

// Mock portfolio properties
const mockPortfolio: PortfolioProperty[] = [
  {
    id: "PF001",
    address: "1234 Palm Ave",
    city: "Newport Beach",
    state: "CA",
    zip: "92660",
    price: 1250000,
    arv: 1650000,
    equity: 32,
    beds: 4,
    baths: 3,
    sqft: 2850,
    propertyType: "Single Family",
    motivation: "high",
    leadSource: "Pre-Foreclosure",
    status: "favorite",
    savedDate: "2024-01-02",
    notes: "Great flip opportunity - cosmetic rehab only",
    lendingStatus: null,
    estimatedRehab: 125000,
    estimatedProfit: 275000,
  },
  {
    id: "PF002",
    address: "567 Ocean Blvd",
    city: "Huntington Beach",
    state: "CA",
    zip: "92648",
    price: 2100000,
    arv: 2800000,
    equity: 28,
    beds: 5,
    baths: 4,
    sqft: 3500,
    propertyType: "Single Family",
    motivation: "medium",
    leadSource: "Probate",
    status: "submitted",
    savedDate: "2024-01-01",
    notes: "Submitted for Fix & Flip financing",
    lendingStatus: "Under Review",
    estimatedRehab: 350000,
    estimatedProfit: 350000,
  },
  {
    id: "PF003",
    address: "890 Sunset Dr",
    city: "Laguna Beach",
    state: "CA",
    zip: "92651",
    price: 3500000,
    arv: 4200000,
    equity: 45,
    beds: 6,
    baths: 5,
    sqft: 4500,
    propertyType: "Single Family",
    motivation: "high",
    leadSource: "High Equity",
    status: "approved",
    savedDate: "2023-12-28",
    notes: "Financing approved - closing Jan 15",
    lendingStatus: "Approved",
    estimatedRehab: 200000,
    estimatedProfit: 500000,
  },
  {
    id: "PF004",
    address: "456 Coast Hwy",
    city: "Dana Point",
    state: "CA",
    zip: "92629",
    price: 1850000,
    arv: 2400000,
    equity: 38,
    beds: 4,
    baths: 3,
    sqft: 2800,
    propertyType: "Single Family",
    motivation: "high",
    leadSource: "Divorce",
    status: "analyzing",
    savedDate: "2024-01-03",
    notes: "Running deal analysis",
    lendingStatus: null,
    estimatedRehab: 175000,
    estimatedProfit: 375000,
  },
]

// Mock search results
const mockSearchResults = [
  {
    id: "SR001",
    address: "1234 Oak Street",
    city: "Costa Mesa",
    state: "CA",
    zip: "92627",
    propertyType: "Single Family",
    beds: 4,
    baths: 3,
    sqft: 2850,
    yearBuilt: 1995,
    avm: 1250000,
    arv: 1500000,
    equity: 450000,
    equityPercent: 36,
    ownerName: "John Smith",
    ownerType: "Individual",
    phone: "(555) 123-4567",
    email: "jsmith@email.com",
    mailingAddress: "1234 Oak Street, Costa Mesa, CA 92627",
    vacant: false,
    absenteeOwner: false,
    foreclosure: false,
    taxDelinquent: false,
    lastSaleDate: "2018-05-15",
    lastSalePrice: 850000,
    motivation: "medium",
    leadSource: "High Equity",
    daysOnMarket: 15,
    image: null,
    saintSalRating: "B",
  },
  {
    id: "SR002",
    address: "5678 Palm Ave",
    city: "Newport Beach",
    state: "CA",
    zip: "92660",
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1650,
    yearBuilt: 1988,
    avm: 985000,
    arv: 1250000,
    equity: 620000,
    equityPercent: 63,
    ownerName: "Maria Garcia",
    ownerType: "Individual",
    phone: "(555) 234-5678",
    email: "mgarcia@email.com",
    mailingAddress: "9876 Different St, Phoenix, AZ 85001",
    vacant: true,
    absenteeOwner: true,
    foreclosure: false,
    taxDelinquent: true,
    lastSaleDate: "2012-03-20",
    lastSalePrice: 380000,
    motivation: "high",
    leadSource: "Absentee Owner",
    daysOnMarket: 7,
    image: null,
    saintSalRating: "A",
  },
  {
    id: "SR003",
    address: "910 Sunset Blvd",
    city: "Huntington Beach",
    state: "CA",
    zip: "92648",
    propertyType: "Single Family",
    beds: 5,
    baths: 4,
    sqft: 3200,
    yearBuilt: 2005,
    avm: 1895000,
    arv: 2350000,
    equity: 785000,
    equityPercent: 41,
    ownerName: "Robert Chen",
    ownerType: "Trust",
    phone: "(555) 345-6789",
    email: "rchen@email.com",
    mailingAddress: "910 Sunset Blvd, Huntington Beach, CA 92648",
    vacant: false,
    absenteeOwner: false,
    foreclosure: true,
    taxDelinquent: false,
    lastSaleDate: "2020-08-10",
    lastSalePrice: 1450000,
    motivation: "high",
    leadSource: "Pre-Foreclosure",
    daysOnMarket: 3,
    image: null,
    saintSalRating: "A",
  },
  {
    id: "SR004",
    address: "2200 Harbor View",
    city: "Newport Beach",
    state: "CA",
    zip: "92663",
    propertyType: "Single Family",
    beds: 5,
    baths: 4,
    sqft: 3200,
    yearBuilt: 2005,
    avm: 2450000,
    arv: 2900000,
    equity: 890000,
    equityPercent: 42,
    ownerName: "Estate of Mary Johnson",
    ownerType: "Estate",
    phone: "(714) 555-0456",
    email: null,
    mailingAddress: "123 Attorney Way, Irvine, CA 92612",
    vacant: true,
    absenteeOwner: true,
    foreclosure: false,
    taxDelinquent: false,
    lastSaleDate: "2008-04-15",
    lastSalePrice: 1100000,
    motivation: "high",
    leadSource: "Probate",
    daysOnMarket: 21,
    image: null,
    saintSalRating: "A",
  },
  {
    id: "SR005",
    address: "456 Beach Blvd",
    city: "Laguna Beach",
    state: "CA",
    zip: "92651",
    propertyType: "Multi-Family",
    beds: 8,
    baths: 4,
    sqft: 4800,
    yearBuilt: 1975,
    avm: 2850000,
    arv: 3600000,
    equity: 1800000,
    equityPercent: 63,
    ownerName: "ABC Properties LLC",
    ownerType: "LLC",
    phone: "(562) 555-0789",
    email: "info@abcprops.com",
    mailingAddress: "789 Business Park, Torrance, CA 90501",
    vacant: false,
    absenteeOwner: true,
    foreclosure: false,
    taxDelinquent: false,
    lastSaleDate: "2005-11-20",
    lastSalePrice: 650000,
    motivation: "medium",
    leadSource: "Tired Landlord",
    daysOnMarket: 45,
    image: null,
    saintSalRating: "B",
  },
  {
    id: "SR006",
    address: "789 Main St",
    city: "Irvine",
    state: "CA",
    zip: "92614",
    propertyType: "Single Family",
    beds: 4,
    baths: 3,
    sqft: 2200,
    yearBuilt: 2010,
    avm: 1350000,
    arv: 1600000,
    equity: 550000,
    equityPercent: 41,
    ownerName: "David Williams",
    ownerType: "Individual",
    phone: "(949) 555-1234",
    email: "dwilliams@email.com",
    mailingAddress: "789 Main St, Irvine, CA 92614",
    vacant: false,
    absenteeOwner: false,
    foreclosure: false,
    taxDelinquent: false,
    lastSaleDate: "2015-06-01",
    lastSalePrice: 800000,
    motivation: "medium",
    leadSource: "Divorce",
    daysOnMarket: 10,
    image: null,
    saintSalRating: "C",
  },
  {
    id: "SR007",
    address: "321 Pacific Coast Hwy",
    city: "San Clemente",
    state: "CA",
    zip: "92672",
    propertyType: "Single Family",
    beds: 6,
    baths: 5,
    sqft: 4200,
    yearBuilt: 2000,
    avm: 3200000,
    arv: 3900000,
    equity: 1400000,
    equityPercent: 44,
    ownerName: "Michael Torres",
    ownerType: "Individual",
    phone: "(949) 555-5678",
    email: "m.torres@email.com",
    mailingAddress: "321 PCH, San Clemente, CA 92672",
    vacant: false,
    absenteeOwner: false,
    foreclosure: false,
    taxDelinquent: true,
    lastSaleDate: "2017-09-15",
    lastSalePrice: 2100000,
    motivation: "high",
    leadSource: "Tax Lien",
    daysOnMarket: 5,
    image: null,
    saintSalRating: "A",
  },
  {
    id: "SR008",
    address: "555 Coastline Dr",
    city: "Dana Point",
    state: "CA",
    zip: "92629",
    propertyType: "Condo",
    beds: 3,
    baths: 2,
    sqft: 1800,
    yearBuilt: 2015,
    avm: 1150000,
    arv: 1400000,
    equity: 450000,
    equityPercent: 39,
    ownerName: "Jennifer Lee",
    ownerType: "Individual",
    phone: "(714) 555-9012",
    email: "jlee@email.com",
    mailingAddress: "555 Coastline Dr #401, Dana Point, CA 92629",
    vacant: true,
    absenteeOwner: false,
    foreclosure: false,
    taxDelinquent: false,
    lastSaleDate: "2019-03-20",
    lastSalePrice: 875000,
    motivation: "medium",
    leadSource: "Vacant",
    daysOnMarket: 30,
    image: null,
    saintSalRating: "B",
  },
]

// SaintSal Rating Badge Component
const SaintSalRating = ({ rating }: { rating: string }) => {
  const colors = {
    A: "bg-green-500 text-white",
    B: "bg-amber-500 text-black",
    C: "bg-orange-500 text-white",
    D: "bg-red-500 text-white",
  }
  return (
    <div
      className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${colors[rating as keyof typeof colors] || "bg-gray-500 text-white"}`}
    >
      <Image src="/logo.png" alt="SaintSal" width={12} height={12} className="rounded-full" />
      {rating}
    </div>
  )
}

export default function PropertySearchPage() {
  // View state
  const [activeTab, setActiveTab] = useState<"search" | "saved" | "portfolio">("search")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [showFilters, setShowFilters] = useState(true)

  // Modal states
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false)
  const [showPropertyModal, setShowPropertyModal] = useState<string | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSaintSalChat, setShowSaintSalChat] = useState(false)

  // Data states
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(mockSavedSearches)
  const [portfolio, setPortfolio] = useState<PortfolioProperty[]>(mockPortfolio)
  const [searchResults, setSearchResults] = useState(mockSearchResults)
  const [favorites, setFavorites] = useState<string[]>(["SR002", "SR004"])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [saintSalInsight, setSaintSalInsight] = useState<string | null>(null)

  // Filter states
  const [filters, setFilters] = useState({
    location: "",
    radius: 25,
    minPrice: "",
    maxPrice: "",
    minEquity: "",
    maxEquity: "",
    minBeds: "",
    maxBeds: "",
    minBaths: "",
    maxBaths: "",
    minSqft: "",
    maxSqft: "",
    propertyTypes: [] as string[],
    leadSources: [] as string[],
    motivationLevels: [] as string[],
    ownerTypes: [] as string[],
    showVacant: false,
    showAbsentee: false,
    showForeclosure: false,
    showTaxDelinquent: false,
  })

  // New search name for saving
  const [newSearchName, setNewSearchName] = useState("")
  const [newSearchAlerts, setNewSearchAlerts] = useState(true)

  // Format currency
  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  // Toggle favorite
  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
  }

  // Handle search with SaintSal
  const handleSearch = async () => {
    setIsSearching(true)
    setSaintSalInsight(null)

    // Simulate SaintSal analysis
    setTimeout(() => {
      setSaintSalInsight(
        `Found ${searchResults.length} properties matching your criteria. ${searchResults.filter((p) => p.saintSalRating === "A").length} are rated A-grade with high profit potential. I recommend focusing on pre-foreclosure and probate leads in Newport Beach - they're showing 40%+ equity positions.`,
      )
      setIsSearching(false)
    }, 1500)
  }

  // Save current search
  const saveSearch = () => {
    if (!newSearchName.trim()) return
    const newSearch: SavedSearch = {
      id: `${Date.now()}`,
      name: newSearchName,
      criteria: { ...filters },
      alertsEnabled: newSearchAlerts,
      alertFrequency: "daily",
      lastRun: "Just now",
      newMatches: 0,
      totalMatches: searchResults.length,
    }
    setSavedSearches((prev) => [newSearch, ...prev])
    setShowSaveSearchModal(false)
    setNewSearchName("")
  }

  // Property Card Component
  const PropertyCard = ({ property, isGridView = true }: { property: any; isGridView?: boolean }) => {
    const isFavorite = favorites.includes(property.id)

    if (!isGridView) {
      // List view
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center gap-4">
            {/* Property Image/Placeholder */}
            <div className="w-32 h-24 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-[#2a2a2a]">
              <Home className="w-8 h-8 text-gray-600" />
              {property.motivation === "high" && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                  HOT
                </div>
              )}
              <div className="absolute top-1 right-1">
                <SaintSalRating rating={property.saintSalRating} />
              </div>
            </div>

            {/* Property Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold truncate">{property.address}</h3>
                  <p className="text-gray-500 text-sm">
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-500">{formatCurrency(property.avm || property.price)}</p>
                  <p className="text-sm text-green-500">ARV: {formatCurrency(property.arv)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4" /> {property.beds}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4" /> {property.baths}
                </span>
                <span className="flex items-center gap-1">
                  <Square className="w-4 h-4" /> {property.sqft?.toLocaleString()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    property.motivation === "high"
                      ? "bg-green-500/20 text-green-400"
                      : property.motivation === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {property.motivation?.charAt(0).toUpperCase() + property.motivation?.slice(1)} Motivation
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
                  {property.equityPercent || property.equity}% Equity
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleFavorite(property.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? "bg-red-500/20 text-red-500" : "bg-[#2a2a2a] text-gray-400 hover:text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => setShowPropertyModal(property.id)}
                className="p-2 bg-[#2a2a2a] text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
              <Link
                href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.avm}&arv=${property.arv}`}
                className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-amber-500 font-medium rounded-lg text-sm transition-colors flex items-center gap-1"
              >
                <Calculator className="w-4 h-4" />
                Analyze
              </Link>
              <button
                onClick={() => setShowSubmitModal(property.id)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors"
              >
                Apply for Capital
              </button>
            </div>
          </div>
        </motion.div>
      )
    }

    // Grid view
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden hover:border-amber-500/30 transition-all group"
      >
        {/* Property Image */}
        <div className="relative h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-700" />
          </div>

          {/* SaintSal Rating Badge */}
          <div className="absolute top-3 left-3">
            <SaintSalRating rating={property.saintSalRating} />
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-12 flex gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                property.motivation === "high"
                  ? "bg-green-500 text-white"
                  : property.motivation === "medium"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-600 text-white"
              }`}
            >
              {property.motivation === "high" ? "HOT" : property.motivation?.toUpperCase()}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(property.id)
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              isFavorite ? "bg-red-500 text-white" : "bg-black/50 text-white hover:bg-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          {/* Lead Source & Days */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between">
            <span className="px-2 py-1 bg-black/70 text-amber-400 rounded text-xs font-medium">
              {property.leadSource}
            </span>
            <span className="px-2 py-1 bg-black/70 text-white rounded text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {property.daysOnMarket}d
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{property.address}</h3>
              <p className="text-gray-500 text-sm">
                {property.city}, {property.state}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-2xl font-bold text-amber-500">{formatCurrency(property.avm || property.price)}</p>
            <p className="text-sm text-green-500">ARV: {formatCurrency(property.arv)}</p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" /> {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" /> {property.baths}
            </span>
            <span className="flex items-center gap-1">
              <Square className="w-4 h-4" /> {property.sqft?.toLocaleString()}
            </span>
          </div>

          {/* Equity Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
              {property.equityPercent}% Equity
            </span>
            <span className="text-xs text-gray-500">
              Est. Profit:{" "}
              <span className="text-green-500 font-semibold">
                {formatCurrency((property.arv - property.avm) * 0.6)}
              </span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.avm}&arv=${property.arv}`}
              className="flex-1 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-amber-500 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
            >
              <Calculator className="w-4 h-4" />
              Analyze
            </Link>
            <button
              onClick={() => setShowSubmitModal(property.id)}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors"
            >
              Apply for Capital
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="CookinCap" width={32} height={32} className="rounded-lg" />
                <span className="text-xl font-bold">
                  Property<span className="text-amber-500">Search</span>
                </span>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by SaintSal™
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1">
              {[
                { id: "search", label: "Search", icon: Search },
                { id: "saved", label: "Saved Searches", icon: Bookmark },
                { id: "portfolio", label: "My Portfolio", icon: Layers },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "saved" && savedSearches.filter((s) => s.newMatches > 0).length > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {savedSearches.filter((s) => s.newMatches > 0).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <Link
                href="/apply"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Banknote className="w-4 h-4" />
                Apply for Capital
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {activeTab === "search" && (
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-80 flex-shrink-0"
                >
                  <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Filter className="w-4 h-4 text-amber-500" />
                        Search Filters
                      </h3>
                      <button
                        onClick={() =>
                          setFilters({
                            location: "",
                            radius: 25,
                            minPrice: "",
                            maxPrice: "",
                            minEquity: "",
                            maxEquity: "",
                            minBeds: "",
                            maxBeds: "",
                            minBaths: "",
                            maxBaths: "",
                            minSqft: "",
                            maxSqft: "",
                            propertyTypes: [],
                            leadSources: [],
                            motivationLevels: [],
                            ownerTypes: [],
                            showVacant: false,
                            showAbsentee: false,
                            showForeclosure: false,
                            showTaxDelinquent: false,
                          })
                        }
                        className="text-xs text-amber-500 hover:text-amber-400"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-1 block">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="City, County, or ZIP"
                          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-1 block">Price Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={filters.minPrice}
                          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                          placeholder="Min"
                          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg py-2 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-gray-600">-</span>
                        <input
                          type="text"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                          placeholder="Max"
                          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg py-2 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Equity Range */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-1 block">Equity %</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={filters.minEquity}
                          onChange={(e) => setFilters((prev) => ({ ...prev, minEquity: e.target.value }))}
                          placeholder="Min %"
                          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg py-2 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-gray-600">-</span>
                        <input
                          type="text"
                          value={filters.maxEquity}
                          onChange={(e) => setFilters((prev) => ({ ...prev, maxEquity: e.target.value }))}
                          placeholder="Max %"
                          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg py-2 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Property Types */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-2 block">Property Types</label>
                      <div className="flex flex-wrap gap-1">
                        {propertyTypes.slice(0, 4).map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                propertyTypes: prev.propertyTypes.includes(type)
                                  ? prev.propertyTypes.filter((t) => t !== type)
                                  : [...prev.propertyTypes, type],
                              }))
                            }
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              filters.propertyTypes.includes(type)
                                ? "bg-amber-500 text-black"
                                : "bg-[#0f0f0f] text-gray-400 hover:text-white border border-[#2a2a2a]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lead Sources */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-2 block">Lead Sources</label>
                      <div className="flex flex-wrap gap-1">
                        {leadSources.slice(0, 6).map((source) => (
                          <button
                            key={source}
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                leadSources: prev.leadSources.includes(source)
                                  ? prev.leadSources.filter((s) => s !== source)
                                  : [...prev.leadSources, source],
                              }))
                            }
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              filters.leadSources.includes(source)
                                ? "bg-amber-500 text-black"
                                : "bg-[#0f0f0f] text-gray-400 hover:text-white border border-[#2a2a2a]"
                            }`}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-2 block">Quick Filters</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "showVacant", label: "Vacant" },
                          { key: "showAbsentee", label: "Absentee" },
                          { key: "showForeclosure", label: "Foreclosure" },
                          { key: "showTaxDelinquent", label: "Tax Lien" },
                        ].map((filter) => (
                          <button
                            key={filter.key}
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, [filter.key]: !prev[filter.key as keyof typeof prev] }))
                            }
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              filters[filter.key as keyof typeof filters]
                                ? "bg-amber-500 text-black"
                                : "bg-[#0f0f0f] text-gray-400 hover:text-white border border-[#2a2a2a]"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSearching ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Search Properties
                        </>
                      )}
                    </button>

                    {/* Save Search */}
                    <button
                      onClick={() => setShowSaveSearchModal(true)}
                      className="w-full mt-2 py-2 bg-[#0f0f0f] hover:bg-[#2a2a2a] text-amber-500 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border border-[#2a2a2a]"
                    >
                      <Save className="w-4 h-4" />
                      Save This Search
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* SaintSal Insight Banner */}
            {saintSalInsight && activeTab === "search" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Image src="/logo.png" alt="SaintSal" width={24} height={24} className="rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-amber-500 font-semibold text-sm flex items-center gap-1">SaintSal™ Analysis</h4>
                    <p className="text-gray-300 text-sm mt-1">{saintSalInsight}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search Results Header */}
            {activeTab === "search" && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded-lg transition-colors lg:hidden"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white">{searchResults.length} Properties Found</h2>
                    <p className="text-sm text-gray-500">
                      {searchResults.filter((p) => p.saintSalRating === "A").length} A-Rated{" "}
                      {searchResults.filter((p) => p.motivation === "high").length} High Motivation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1">
                    {[
                      { id: "grid", icon: Grid3X3 },
                      { id: "list", icon: List },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === mode.id ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <mode.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid/List */}
            {activeTab === "search" && (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}
              >
                {searchResults.map((property) => (
                  <PropertyCard key={property.id} property={property} isGridView={viewMode === "grid"} />
                ))}
              </div>
            )}

            {/* Saved Searches Tab */}
            {activeTab === "saved" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Saved Searches</h2>
                {savedSearches.map((search) => (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            search.alertsEnabled ? "bg-amber-500/20" : "bg-[#2a2a2a]"
                          }`}
                        >
                          {search.alertsEnabled ? (
                            <BellRing className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Bell className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{search.name}</h3>
                          <p className="text-sm text-gray-500">Last run: {search.lastRun}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {search.newMatches > 0 && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            {search.newMatches} New
                          </span>
                        )}
                        <span className="text-gray-400 text-sm">{search.totalMatches} total</span>
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors">
                          Run Search
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === "portfolio" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">My Portfolio</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="px-4 py-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                      <span className="text-gray-500">Total Value:</span>
                      <span className="text-amber-500 font-bold ml-2">
                        {formatCurrency(portfolio.reduce((sum, p) => sum + p.price, 0))}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                      <span className="text-gray-500">Est. Profit:</span>
                      <span className="text-green-500 font-bold ml-2">
                        {formatCurrency(portfolio.reduce((sum, p) => sum + p.estimatedProfit, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.map((property) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{property.address}</h3>
                          <p className="text-sm text-gray-500">
                            {property.city}, {property.state} {property.zip}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            property.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : property.status === "submitted"
                                ? "bg-amber-500/20 text-amber-400"
                                : property.status === "analyzing"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {property.lendingStatus || property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-[#0f0f0f] rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Purchase</p>
                          <p className="text-amber-500 font-bold">{formatCurrency(property.price)}</p>
                        </div>
                        <div className="bg-[#0f0f0f] rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">ARV</p>
                          <p className="text-green-500 font-bold">{formatCurrency(property.arv)}</p>
                        </div>
                        <div className="bg-[#0f0f0f] rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Est. Profit</p>
                          <p className="text-white font-bold">{formatCurrency(property.estimatedProfit)}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-3">{property.notes}</p>

                      <div className="flex gap-2">
                        <Link
                          href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.price}&arv=${property.arv}`}
                          className="flex-1 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-amber-500 font-medium rounded-lg text-sm transition-colors text-center"
                        >
                          View Analysis
                        </Link>
                        <Link
                          href="/apply"
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors text-center"
                        >
                          Apply for Capital
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Search Modal */}
      <AnimatePresence>
        {showSaveSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveSearchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Save This Search</h3>
              <input
                type="text"
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
                placeholder="Search name..."
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 mb-4"
              />
              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSearchAlerts}
                  onChange={(e) => setNewSearchAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0f0f0f] text-amber-500 focus:ring-amber-500"
                />
                <span className="text-gray-300">Enable alerts for new matches</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveSearchModal(false)}
                  className="flex-1 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSearch}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
                >
                  Save Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit to Lending Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Apply for Capital</h3>
                  <p className="text-gray-500 text-sm">Get funding for this property</p>
                </div>
              </div>

              <div className="bg-[#0f0f0f] rounded-lg p-4 mb-4 border border-[#2a2a2a]">
                <p className="text-gray-400 text-sm mb-2">Selected Property:</p>
                <p className="text-white font-semibold">
                  {searchResults.find((p) => p.id === showSubmitModal)?.address}
                </p>
                <p className="text-gray-500 text-sm">
                  {searchResults.find((p) => p.id === showSubmitModal)?.city},{" "}
                  {searchResults.find((p) => p.id === showSubmitModal)?.state}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <Link
                  href="/apply"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Full Application
                </Link>
                <Link
                  href="/prequal"
                  className="w-full py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#3a3a3a]"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Pre-Qualification
                </Link>
              </div>

              <button
                onClick={() => setShowSubmitModal(null)}
                className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
