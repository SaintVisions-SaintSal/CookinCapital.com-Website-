"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  DollarSign,
  PieChart,
  Clock,
  Loader2,
  Search,
  BarChart3,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Deal {
  id: string
  property_address: string
  property_type: string | null
  stage: string | null
  saintsal_signal: string | null
  saintsal_confidence: number | null
  loan_amount: number | null
  borrower_name: string | null
  updated_at: string
  created_at: string
}

interface Loan {
  id: string
  property_address: string
  loan_amount: number | null
  interest_rate: number | null
  status: string | null
  ltv_ratio: number | null
  saintsal_signal: string | null
  origination_date: string | null
  maturity_date: string | null
}

export function DashboardInvestor() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single()
          setUserName(profile?.full_name || null)
        }

        const [dealsRes, loansRes] = await Promise.all([
          fetch("/api/deals"),
          fetch("/api/loans"),
        ])

        if (dealsRes.ok) {
          const data = await dealsRes.json()
          setDeals(data.deals || [])
        }

        if (loansRes.ok) {
          const data = await loansRes.json()
          setLoans(data.loans || [])
        }
      } catch (err) {
        console.error("Investor dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Compute real stats from data
  const newDeals = deals.filter(
    (d) => d.stage === "submitted" || d.stage === "new" || d.stage === "Acquire"
  )
  const deployedCapital = loans.reduce(
    (sum, l) => sum + (l.loan_amount || 0),
    0
  )
  const avgYield = loans.length > 0
    ? loans.reduce((sum, l) => sum + (l.interest_rate || 0), 0) / loans.length
    : 0
  const pendingDeals = deals.filter(
    (d) => d.stage === "analyzing" || d.stage === "underwriting" || d.stage === "Analyze"
  )

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    if (num === 0) return "$0"
    return `$${num.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Use real deals for the top deals list
  const topDeals = deals.slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">
          Investor Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          {deals.length > 0
            ? `${newDeals.length} new opportunities matched to your criteria`
            : "Explore opportunities to get started"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{newDeals.length}</p>
                <p className="text-sm text-muted-foreground">New Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {deployedCapital > 0 ? formatCurrency(deployedCapital) : "--"}
                </p>
                <p className="text-sm text-muted-foreground">Deployed Capital</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {avgYield > 0 ? `${avgYield.toFixed(1)}%` : "--"}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Yield</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{pendingDeals.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Deals This Week</CardTitle>
          <Link href="/app/opportunities">
            <Button variant="ghost" className="text-primary">
              View All Opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {topDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No matched opportunities yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Deals will appear here as they match your investment criteria. Browse opportunities to explore what is available.
              </p>
              <Link href="/app/opportunities">
                <Button size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Opportunities
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {topDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-xl border border-border p-5 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {deal.property_type || "Residential"}
                    </span>
                    {deal.saintsal_signal && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        {deal.saintsal_signal}
                      </div>
                    )}
                  </div>

                  <p className="mt-4 font-medium text-foreground">
                    {deal.property_address || "Address Pending"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Loan Amount</p>
                      <p className="text-lg font-semibold text-foreground">
                        {deal.loan_amount ? formatCurrency(deal.loan_amount) : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="text-lg font-semibold text-foreground">
                        {deal.saintsal_confidence ? `${deal.saintsal_confidence}%` : "--"}
                      </p>
                    </div>
                  </div>

                  <Link href={`/app/deals/${deal.id}`}>
                    <Button className="mt-4 w-full bg-transparent" variant="outline">
                      Open Deal Room
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Complete your first investment to see portfolio performance data here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {loans.filter((l) => l.status === "active" || l.status === "performing").length}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Total Deployed</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {formatCurrency(deployedCapital)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Weighted Avg Rate</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {avgYield > 0 ? `${avgYield.toFixed(1)}%` : "--"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
