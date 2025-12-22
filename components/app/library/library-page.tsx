"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Search,
  Trash2,
  Download,
  Building,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  FolderOpen,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SavedDeal {
  id: string
  deal_name: string
  property_address: string
  property_type: string
  purchase_price: number
  arv: number
  rehab_cost: number
  loan_amount: number
  total_profit: number
  roi: number
  created_at: string
  deal_data: any
}

const LibraryPage = () => {
  const [deals, setDeals] = useState<SavedDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/user-deals")

      if (!response.ok) {
        throw new Error("Failed to fetch deals")
      }

      const { deals: fetchedDeals } = await response.json()
      setDeals(fetchedDeals || [])
    } catch (err) {
      console.error("Error fetching deals:", err)
      // Fallback to localStorage if API fails
      const localDeals = localStorage.getItem("cookincap_deals")
      if (localDeals) {
        setDeals(JSON.parse(localDeals))
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteDeal = async (id: string) => {
    if (!confirm("Delete this deal?")) return

    try {
      const response = await fetch(`/api/user-deals?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete deal")
      }

      setDeals((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      console.error("Error deleting deal:", err)
      alert("Failed to delete deal. Please try again.")
    }
  }

  const downloadDeal = (deal: SavedDeal) => {
    const content = `COOKINCAPITAL DEAL WORKSHEET\n\nDEAL: ${deal.deal_name || "Untitled"}\nAddress: ${deal.property_address || "N/A"}\nPurchase: $${(deal.purchase_price || 0).toLocaleString()}\nARV: $${(deal.arv || 0).toLocaleString()}\nProfit: $${(deal.total_profit || 0).toLocaleString()}\nROI: ${(deal.roi || 0).toFixed(1)}%`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${deal.deal_name?.replace(/[^a-z0-9]/gi, "-") || "deal"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.deal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.property_address?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || deal.property_type === filterType
    return matchesSearch && matchesType
  })

  const propertyTypes = ["all", ...new Set(deals.map((d) => d.property_type).filter(Boolean))]
  const totalValue = deals.reduce((sum, d) => sum + (d.arv || 0), 0)
  const totalProfit = deals.reduce((sum, d) => sum + (d.total_profit || 0), 0)
  const avgROI = deals.length > 0 ? deals.reduce((sum, d) => sum + (d.roi || 0), 0) / deals.length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Deals</h1>
          <p className="text-muted-foreground">Your saved deal analyses</p>
        </div>
        <Link href="/app/analyzer">
          <Button className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Analyze New Deal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Deals</p>
                <p className="text-xl font-bold text-foreground">{deals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
                <p className="text-xl font-bold text-foreground">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="text-xl font-bold text-foreground">${(totalProfit / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Calculator className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg ROI</p>
                <p className="text-xl font-bold text-foreground">{avgROI.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {propertyTypes.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={cn(filterType !== type && "bg-transparent")}
            >
              {type === "all" ? "All Types" : type}
            </Button>
          ))}
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No deals yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Start analyzing deals to build your library.
            </p>
            <Link href="/app/analyzer">
              <Button>
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Your First Deal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{deal.deal_name || "Untitled Deal"}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">{deal.property_address || "No address"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {deal.property_type || "Unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary p-2.5">
                    <p className="text-xs text-muted-foreground">Purchase</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${((deal.purchase_price || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2.5">
                    <p className="text-xs text-muted-foreground">ARV</p>
                    <p className="text-sm font-semibold text-foreground">${((deal.arv || 0) / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Profit</p>
                    <p className="text-lg font-bold text-primary">${((deal.total_profit || 0) / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        (deal.roi || 0) >= 20
                          ? "text-green-500"
                          : (deal.roi || 0) >= 10
                            ? "text-amber-500"
                            : "text-red-500",
                      )}
                    >
                      {(deal.roi || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(deal.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadDeal(deal)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteDeal(deal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LibraryPage
