"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calculator,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Loader2,
  Search,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserDeal {
  id: string
  deal_name: string
  property_address: string
  purchase_price: number | null
  arv: number | null
  loan_amount: number | null
  total_profit: number | null
  roi: number | null
  created_at: string
  updated_at: string
}

interface Deal {
  id: string
  property_address: string
  stage: string
  saintsal_signal: string | null
  loan_amount: number | null
  borrower_name: string | null
  updated_at: string
  created_at: string
}

const stages = ["Acquire", "Analyze", "Fund", "Close"]

function mapStage(stage: string | null): string {
  if (!stage) return "Acquire"
  const normalized = stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase()
  if (stages.includes(normalized)) return normalized
  // Map common DB values
  if (stage === "submitted" || stage === "new") return "Acquire"
  if (stage === "analyzing" || stage === "underwriting") return "Analyze"
  if (stage === "approved" || stage === "funding") return "Fund"
  if (stage === "funded" || stage === "closed") return "Close"
  return "Acquire"
}

export function DashboardBorrower() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userDeals, setUserDeals] = useState<UserDeal[]>([])
  const [platformDeals, setPlatformDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Fetch profile name
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single()
          setUserName(profile?.full_name || user.email?.split("@")[0] || null)
        }

        // Fetch user's saved deals from API
        const [userDealsRes, dealsRes] = await Promise.all([
          fetch("/api/user-deals"),
          fetch("/api/deals"),
        ])

        if (userDealsRes.ok) {
          const data = await userDealsRes.json()
          setUserDeals(data.deals || [])
        }

        if (dealsRes.ok) {
          const data = await dealsRes.json()
          setPlatformDeals(data.deals || [])
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError("Unable to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Compute real stats
  const activeDealsCount = userDeals.length
  const fundedDeals = platformDeals.filter(
    (d) => d.stage === "funded" || d.stage === "closed" || d.stage === "Close"
  )
  const fundedCount = fundedDeals.length
  const totalVolume = platformDeals.reduce(
    (sum, d) => sum + (d.loan_amount || 0),
    0
  )
  const alerts = platformDeals.filter(
    (d) => d.saintsal_signal === "PASS" || d.saintsal_signal === "RENEGOTIATE"
  ).length

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    if (num === 0) return "$0"
    return `$${num.toLocaleString()}`
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Combine user_deals and platform deals for the active deals list
  const activeDealsList = [
    ...userDeals.map((d) => ({
      id: d.id,
      address: d.property_address || d.deal_name,
      stage: "Analyze" as string,
      signal: null as string | null,
      updated: d.updated_at || d.created_at,
    })),
    ...platformDeals.slice(0, 5).map((d) => ({
      id: d.id,
      address: d.property_address || "Unknown Address",
      stage: mapStage(d.stage),
      signal: d.saintsal_signal,
      updated: d.updated_at || d.created_at,
    })),
  ].slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">{"What's your next best move?"}</p>
      </div>

      {/* Quick action */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Start Deal Analyzer</h2>
              <p className="text-sm text-muted-foreground">Get a BUY/PASS/RENEGOTIATE signal in minutes</p>
            </div>
          </div>
          <Link href="/app/analyzer">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              New Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{activeDealsCount}</p>
                <p className="text-sm text-muted-foreground">Saved Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{fundedCount}</p>
                <p className="text-sm text-muted-foreground">Deals Funded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalVolume)}</p>
                <p className="text-sm text-muted-foreground">Total Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{alerts}</p>
                <p className="text-sm text-muted-foreground">
                  {alerts === 1 ? "Alert" : "Alerts"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Deals</CardTitle>
          <Link href="/app/portfolio">
            <Button variant="ghost" className="text-primary">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activeDealsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No deals yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Start by analyzing a property in the Deal Analyzer or search for opportunities.
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
            </div>
          ) : (
            <div className="space-y-4">
              {activeDealsList.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/app/deals/${deal.id}`}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{deal.address}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {timeAgo(deal.updated)}
                    </div>
                  </div>

                  {/* Stage tracker */}
                  <div className="flex items-center gap-1">
                    {stages.map((stage, index) => {
                      const stageIndex = stages.indexOf(deal.stage)
                      const isActive = index <= stageIndex
                      const isCurrent = stage === deal.stage
                      return (
                        <div key={stage} className="flex items-center">
                          <div
                            className={`flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                              isCurrent
                                ? "bg-primary text-primary-foreground"
                                : isActive
                                  ? "bg-primary/20 text-primary"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {stage}
                          </div>
                          {index < stages.length - 1 && (
                            <div
                              className={`mx-1 h-0.5 w-4 ${
                                index < stageIndex ? "bg-primary" : "bg-border"
                              }`}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Signal */}
                  {deal.signal && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        deal.signal === "BUY"
                          ? "bg-green-500/10 text-green-500"
                          : deal.signal === "PASS"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {deal.signal}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
