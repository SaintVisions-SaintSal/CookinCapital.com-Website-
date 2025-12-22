"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Search, Filter, Sparkles, MapPin, ExternalLink, FileText, Phone } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const opportunities = [
  {
    id: "1",
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    strategy: "Flip",
    projectedROI: 24.3,
    yield: 12.5,
    purchasePrice: 185000,
    arv: 275000,
    rehabBudget: 35000,
    sqft: 1850,
    beds: 3,
    baths: 2,
    yearBuilt: 1985,
    verified: true,
    matchScore: 94,
    description:
      "Solid brick ranch in established neighborhood. Needs cosmetic updates - kitchen, baths, flooring. Strong rental demand in area.",
  },
  {
    id: "2",
    address: "456 Oak Ave",
    city: "Houston",
    state: "TX",
    strategy: "Rental",
    projectedROI: 18.7,
    yield: 8.2,
    purchasePrice: 165000,
    arv: 210000,
    rehabBudget: 20000,
    sqft: 1650,
    beds: 3,
    baths: 2,
    yearBuilt: 1992,
    verified: true,
    matchScore: 88,
    description: "Turn-key rental opportunity. Minor updates needed. Currently tenant-occupied with lease in place.",
  },
  {
    id: "3",
    address: "789 Pine Rd",
    city: "Dallas",
    state: "TX",
    strategy: "Commercial",
    projectedROI: 32.1,
    yield: 15.0,
    purchasePrice: 425000,
    arv: 650000,
    rehabBudget: 75000,
    sqft: 4500,
    beds: 0,
    baths: 2,
    yearBuilt: 1978,
    verified: true,
    matchScore: 82,
    description: "Mixed-use commercial property with 3 retail units. Value-add opportunity with below-market rents.",
  },
  {
    id: "4",
    address: "321 Elm St",
    city: "San Antonio",
    state: "TX",
    strategy: "Flip",
    projectedROI: 21.5,
    yield: 11.0,
    purchasePrice: 145000,
    arv: 195000,
    rehabBudget: 25000,
    sqft: 1400,
    beds: 3,
    baths: 1,
    yearBuilt: 1972,
    verified: true,
    matchScore: 79,
    description: "Classic flip opportunity. Full cosmetic rehab needed. Great school district.",
  },
  {
    id: "5",
    address: "555 Cedar Ln",
    city: "Fort Worth",
    state: "TX",
    strategy: "Rental",
    projectedROI: 16.2,
    yield: 7.8,
    purchasePrice: 195000,
    arv: 245000,
    rehabBudget: 15000,
    sqft: 1800,
    beds: 4,
    baths: 2,
    yearBuilt: 2001,
    verified: true,
    matchScore: 76,
    description: "Newer construction with minimal work needed. Strong rental market with low vacancy rates.",
  },
]

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [strategyFilter, setStrategyFilter] = useState("all")
  const [selectedOpp, setSelectedOpp] = useState<(typeof opportunities)[0] | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestedOpp, setRequestedOpp] = useState<(typeof opportunities)[0] | null>(null)

  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStrategy = strategyFilter === "all" || opp.strategy === strategyFilter
    return matchesSearch && matchesStrategy
  })

  const handleRequestAllocation = (opp: (typeof opportunities)[0]) => {
    setRequestedOpp(opp)
    setShowRequestDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Opportunities</h1>
          <p className="mt-1 text-muted-foreground">Vetted deals matched to your investment criteria</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          <span>SaintSal Verified Deals</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by address or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger className="w-40 bg-secondary border-0">
                  <SelectValue placeholder="All Strategies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strategies</SelectItem>
                  <SelectItem value="Flip">Flip</SelectItem>
                  <SelectItem value="Rental">Rental</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredOpps.map((opp) => (
          <Card key={opp.id} className="flex flex-col transition-all hover:border-primary/50 hover:shadow-lg">
            <CardContent className="flex-1 p-6">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="bg-secondary">
                  {opp.strategy}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {opp.matchScore}% match
                </div>
              </div>

              <div className="mt-4">
                <p className="text-lg font-semibold text-foreground">{opp.address}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {opp.city}, {opp.state}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Projected ROI</p>
                  <p className="text-2xl font-bold text-green-500">{opp.projectedROI}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Yield</p>
                  <p className="text-2xl font-bold text-foreground">{opp.yield}%</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Purchase</p>
                  <p className="font-medium text-foreground">${opp.purchasePrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ARV</p>
                  <p className="font-medium text-foreground">${opp.arv.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedOpp(opp)}>
                  View Details
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => handleRequestAllocation(opp)}
                >
                  Request Allocation
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOpps.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No opportunities found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedOpp} onOpenChange={() => setSelectedOpp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedOpp?.address}</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {selectedOpp?.city}, {selectedOpp?.state}
            </DialogDescription>
          </DialogHeader>

          {selectedOpp && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-secondary">
                  {selectedOpp.strategy}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {selectedOpp.matchScore}% SaintSal Match
                </div>
              </div>

              <p className="text-muted-foreground">{selectedOpp.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Purchase</p>
                  <p className="text-lg font-bold">${selectedOpp.purchasePrice.toLocaleString()}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Rehab</p>
                  <p className="text-lg font-bold">${selectedOpp.rehabBudget.toLocaleString()}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">ARV</p>
                  <p className="text-lg font-bold">${selectedOpp.arv.toLocaleString()}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Proj. ROI</p>
                  <p className="text-lg font-bold text-green-500">{selectedOpp.projectedROI}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sqft</p>
                  <p className="font-medium">{selectedOpp.sqft.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Beds/Baths</p>
                  <p className="font-medium">
                    {selectedOpp.beds} / {selectedOpp.baths}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year Built</p>
                  <p className="font-medium">{selectedOpp.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Yield</p>
                  <p className="font-medium">{selectedOpp.yield}%</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Link href="/app/analyzer" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    Analyze This Deal
                  </Button>
                </Link>
                <Button
                  className="flex-1 gap-2 bg-primary"
                  onClick={() => {
                    setSelectedOpp(null)
                    handleRequestAllocation(selectedOpp)
                  }}
                >
                  Request Allocation
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Allocation</DialogTitle>
            <DialogDescription>
              Express interest in {requestedOpp?.address}, {requestedOpp?.city}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Purchase Price</span>
                <span className="font-medium">${requestedOpp?.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Projected ROI</span>
                <span className="font-medium text-green-500">{requestedOpp?.projectedROI}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strategy</span>
                <span className="font-medium">{requestedOpp?.strategy}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              To request allocation on this deal, please contact our team directly or apply for funding.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/apply" className="w-full">
                <Button className="w-full gap-2 bg-primary">
                  <FileText className="h-4 w-4" />
                  Apply for Funding
                </Button>
              </Link>
              <a href="tel:+19499972097" className="w-full">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Phone className="h-4 w-4" />
                  Call 949-997-2097
                </Button>
              </a>
              <a
                href="mailto:support@cookin.io?subject=Deal Allocation Request: ${requestedOpp?.address}"
                className="w-full"
              >
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <ExternalLink className="h-4 w-4" />
                  Email support@cookin.io
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
