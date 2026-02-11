"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Calculator,
  Search,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface UserDeal {
  id: string
  deal_name: string
  property_address: string
  property_type: string | null
  purchase_price: number | null
  arv: number | null
  loan_amount: number | null
  rehab_cost: number | null
  total_profit: number | null
  roi: number | null
  cash_on_cash: number | null
  interest_rate: number | null
  created_at: string
  updated_at: string
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 71%, 45%)",
  "hsl(47, 96%, 53%)",
  "hsl(200, 74%, 52%)",
  "hsl(280, 65%, 60%)",
  "hsl(350, 65%, 55%)",
]

export default function PortfolioPage() {
  const [deals, setDeals] = useState<UserDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch("/api/user-deals")
        if (res.ok) {
          const data = await res.json()
          setDeals(data.deals || [])
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  const formatCurrency = (num: number | null) => {
    if (!num || num === 0) return "$0"
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  // Compute real stats
  const totalProperties = deals.length
  const portfolioValue = deals.reduce((sum, d) => sum + (d.arv || d.purchase_price || 0), 0)
  const avgROI = deals.length > 0
    ? deals.reduce((sum, d) => sum + (d.roi || 0), 0) / deals.length
    : 0
  const riskAlerts = deals.filter((d) => (d.roi || 0) < 0).length

  // Chart data: deal values bar chart
  const dealValuesData = deals.slice(0, 8).map((d) => {
    const addr = d.property_address || d.deal_name || "Deal"
    const shortAddr = addr.length > 20 ? addr.substring(0, 20) + "..." : addr
    return {
      name: shortAddr,
      purchase: d.purchase_price || 0,
      arv: d.arv || 0,
      profit: d.total_profit || 0,
    }
  })

  // Chart data: property type allocation
  const typeCountMap: Record<string, number> = {}
  deals.forEach((d) => {
    const t = d.property_type || "Residential"
    typeCountMap[t] = (typeCountMap[t] || 0) + 1
  })
  const allocationData = Object.entries(typeCountMap).map(([name, value]) => ({
    name,
    value,
  }))

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
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Portfolio Command</h1>
        <p className="mt-1 text-muted-foreground">
          {totalProperties > 0
            ? `Tracking ${totalProperties} saved deal${totalProperties > 1 ? "s" : ""}`
            : "Track and manage your real estate portfolio"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalProperties}</p>
                <p className="text-sm text-muted-foreground">Total Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {portfolioValue > 0 ? formatCurrency(portfolioValue) : "--"}
                </p>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {avgROI > 0 ? `${avgROI.toFixed(1)}%` : "--"}
                </p>
                <p className="text-sm text-muted-foreground">Avg. ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${riskAlerts > 0 ? "bg-yellow-500/10" : "bg-secondary"}`}>
                <AlertTriangle className={`h-6 w-6 ${riskAlerts > 0 ? "text-yellow-500" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{riskAlerts}</p>
                <p className="text-sm text-muted-foreground">
                  Risk {riskAlerts === 1 ? "Alert" : "Alerts"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {deals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Your portfolio is empty</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Analyze and save deals to build your portfolio. Your saved deals will show up here with performance tracking.
            </p>
            <div className="flex gap-3">
              <Link href="/app/analyzer">
                <Button variant="outline" size="sm">
                  <Calculator className="mr-2 h-4 w-4" />
                  Deal Analyzer
                </Button>
              </Link>
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

      {/* Properties Table */}
      {deals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Saved Deals</CardTitle>
            <Link href="/app/library">
              <Button variant="ghost" className="text-primary">
                View Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Property
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Purchase
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      ARV
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Est. Profit
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer"
                    >
                      <td className="py-4">
                        <p className="font-medium text-foreground">
                          {deal.deal_name || deal.property_address || "Untitled Deal"}
                        </p>
                        {deal.property_address && deal.deal_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">{deal.property_address}</p>
                        )}
                      </td>
                      <td className="py-4 text-right text-foreground">
                        {deal.purchase_price ? formatCurrency(deal.purchase_price) : "--"}
                      </td>
                      <td className="py-4 text-right text-foreground">
                        {deal.arv ? formatCurrency(deal.arv) : "--"}
                      </td>
                      <td className={`py-4 text-right font-medium ${
                        (deal.total_profit || 0) > 0 ? "text-green-500" : (deal.total_profit || 0) < 0 ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {deal.total_profit ? formatCurrency(deal.total_profit) : "--"}
                      </td>
                      <td className={`py-4 text-right font-medium ${
                        (deal.roi || 0) > 0 ? "text-primary" : (deal.roi || 0) < 0 ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {deal.roi ? `${deal.roi.toFixed(1)}%` : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {deals.length >= 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deal Values Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Values Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dealValuesData} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="purchase" name="Purchase Price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="arv" name="ARV" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Allocation Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Property Type Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {allocationData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Save deals with property types to see allocation breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts empty state for 0-1 deals */}
      {deals.length === 1 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Save at least 2 deals to see performance charts and comparisons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
