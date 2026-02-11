"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  MapPin,
  ExternalLink,
  FileText,
  Phone,
  Loader2,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Deal {
  id: string
  deal_number: string | null
  property_address: string | null
  property_type: string | null
  stage: string | null
  saintsal_signal: string | null
  saintsal_confidence: number | null
  saintsal_risk_score: number | null
  saintsal_flags: string[] | null
  loan_amount: number | null
  borrower_name: string | null
  borrower_email: string | null
  notes: string | null
  submitted_date: string | null
  created_at: string
  updated_at: string
}

function parseAddress(fullAddress: string | null): { street: string; city: string; state: string } {
  if (!fullAddress) return { street: "Address Pending", city: "", state: "" }
  const parts = fullAddress.split(",").map((p) => p.trim())
  if (parts.length >= 3) {
    return { street: parts[0], city: parts[1], state: parts[2].split(" ")[0] || "" }
  }
  if (parts.length === 2) {
    return { street: parts[0], city: parts[1], state: "" }
  }
  return { street: fullAddress, city: "", state: "" }
}

export default function OpportunitiesPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestedDeal, setRequestedDeal] = useState<Deal | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch("/api/deals")
        if (res.ok) {
          const data = await res.json()
          setDeals(data.deals || [])
        }
      } catch (err) {
        console.error("Failed to fetch opportunities:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  const filteredDeals = deals.filter((deal) => {
    const addr = (deal.property_address || "").toLowerCase()
    const matchesSearch =
      addr.includes(searchQuery.toLowerCase()) ||
      (deal.borrower_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.property_type || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStage = stageFilter === "all" || deal.stage === stageFilter
    return matchesSearch && matchesStage
  })

  const uniqueStages = [...new Set(deals.map((d) => d.stage).filter(Boolean))] as string[]

  const formatCurrency = (num: number | null) => {
    if (!num || num === 0) return "--"
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  const handleRequestAllocation = (deal: Deal) => {
    setRequestedDeal(deal)
    setShowRequestDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Opportunities</h1>
          <p className="mt-1 text-muted-foreground">
            {deals.length > 0
              ? `${deals.length} verified deals on the platform`
              : "Verified deals will appear here as they become available"}
          </p>
        </div>
        {deals.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>SaintSal Verified Deals</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by address, borrower, or property type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>
            {uniqueStages.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-40 bg-secondary border-0">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {uniqueStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {deals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No verified opportunities available right now
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Our team is actively sourcing and vetting deals. Check back soon or contact us to discuss your investment criteria.
            </p>
            <div className="flex gap-3">
              <a href="tel:+19499972097">
                <Button variant="outline" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </Button>
              </a>
              <Link href="/app/properties">
                <Button size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Search Properties
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deals Grid */}
      {filteredDeals.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDeals.map((deal) => {
            const parsed = parseAddress(deal.property_address)
            return (
              <Card
                key={deal.id}
                className="flex flex-col transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardContent className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="bg-secondary">
                      {deal.property_type || "Residential"}
                    </Badge>
                    {deal.saintsal_confidence && (
                      <div className="flex items-center gap-1 text-sm text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        {deal.saintsal_confidence}% confidence
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-lg font-semibold text-foreground">{parsed.street}</p>
                    {(parsed.city || parsed.state) && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[parsed.city, parsed.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Loan Amount</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(deal.loan_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Signal</p>
                      <p className={`text-2xl font-bold ${
                        deal.saintsal_signal === "BUY"
                          ? "text-green-500"
                          : deal.saintsal_signal === "PASS"
                            ? "text-red-500"
                            : deal.saintsal_signal === "RENEGOTIATE"
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                      }`}>
                        {deal.saintsal_signal || "--"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Stage</p>
                      <p className="font-medium text-foreground">
                        {deal.stage
                          ? deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)
                          : "New"}
                      </p>
                    </div>
                    {deal.submitted_date && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="font-medium text-foreground">
                          {new Date(deal.submitted_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {deal.saintsal_flags && deal.saintsal_flags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {deal.saintsal_flags.slice(0, 3).map((flag, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground"
                      onClick={() => handleRequestAllocation(deal)}
                    >
                      Request Allocation
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* No search results */}
      {deals.length > 0 && filteredDeals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No opportunities found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Deal Detail Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {parseAddress(selectedDeal?.property_address || null).street}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {(() => {
                const p = parseAddress(selectedDeal?.property_address || null)
                return [p.city, p.state].filter(Boolean).join(", ") || "Location pending"
              })()}
            </DialogDescription>
          </DialogHeader>

          {selectedDeal && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-secondary">
                  {selectedDeal.property_type || "Residential"}
                </Badge>
                {selectedDeal.saintsal_signal && (
                  <Badge className={`${
                    selectedDeal.saintsal_signal === "BUY"
                      ? "bg-green-500/10 text-green-500"
                      : selectedDeal.saintsal_signal === "PASS"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {selectedDeal.saintsal_signal}
                  </Badge>
                )}
                {selectedDeal.saintsal_confidence && (
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {selectedDeal.saintsal_confidence}% Confidence
                  </div>
                )}
              </div>

              {selectedDeal.notes && (
                <p className="text-muted-foreground">{selectedDeal.notes}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedDeal.loan_amount)}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <p className="text-lg font-bold">
                    {selectedDeal.stage
                      ? selectedDeal.stage.charAt(0).toUpperCase() + selectedDeal.stage.slice(1)
                      : "New"}
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-bold">
                    {selectedDeal.saintsal_risk_score || "--"}
                  </p>
                </div>
              </div>

              {selectedDeal.saintsal_flags && selectedDeal.saintsal_flags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">SaintSal Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeal.saintsal_flags.map((flag, i) => (
                      <Badge key={i} variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <Link
                  href={`/app/analyzer?address=${encodeURIComponent(selectedDeal.property_address || "")}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    Analyze This Deal
                  </Button>
                </Link>
                <Button
                  className="flex-1 gap-2 bg-primary"
                  onClick={() => {
                    setSelectedDeal(null)
                    handleRequestAllocation(selectedDeal)
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

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Allocation</DialogTitle>
            <DialogDescription>
              Express interest in {parseAddress(requestedDeal?.property_address || null).street}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-medium">{formatCurrency(requestedDeal?.loan_amount || null)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Signal</span>
                <span className={`font-medium ${
                  requestedDeal?.saintsal_signal === "BUY"
                    ? "text-green-500"
                    : requestedDeal?.saintsal_signal === "PASS"
                      ? "text-red-500"
                      : "text-yellow-500"
                }`}>
                  {requestedDeal?.saintsal_signal || "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Type</span>
                <span className="font-medium">{requestedDeal?.property_type || "Residential"}</span>
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
                href={`mailto:support@cookin.io?subject=Deal Allocation Request: ${parseAddress(requestedDeal?.property_address || null).street}`}
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
