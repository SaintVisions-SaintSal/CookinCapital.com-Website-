"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Landmark,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  Search,
  BarChart3,
} from "lucide-react"

interface Deal {
  id: string
  property_address: string
  borrower_name: string | null
  loan_amount: number | null
  stage: string | null
  saintsal_signal: string | null
  saintsal_confidence: number | null
  updated_at: string
  created_at: string
}

interface Loan {
  id: string
  property_address: string
  borrower_name: string | null
  loan_amount: number | null
  interest_rate: number | null
  ltv_ratio: number | null
  status: string | null
  current_balance: number | null
  origination_date: string | null
  maturity_date: string | null
}

export function DashboardKLender() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
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
        console.error("KLender dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    if (num === 0) return "$0"
    return `$${num.toLocaleString()}`
  }

  // Compute real stats
  const newMatches = deals.filter(
    (d) => d.stage === "submitted" || d.stage === "new" || d.stage === "Acquire"
  )
  const pendingReview = deals.filter(
    (d) => d.stage === "analyzing" || d.stage === "underwriting" || d.stage === "Analyze"
  )
  const approvedDeals = deals.filter(
    (d) => d.stage === "approved" || d.stage === "funding" || d.stage === "Fund"
  )
  const activeLoansTotal = loans
    .filter((l) => l.status === "active" || l.status === "performing")
    .reduce((sum, l) => sum + (l.current_balance || l.loan_amount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Incoming deals for lender review
  const incomingDeals = deals.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">KLender Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {deals.length > 0
            ? "Deals matching your buy box criteria"
            : "No deals matching your criteria yet"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{newMatches.length}</p>
                <p className="text-sm text-muted-foreground">New Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{pendingReview.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
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
                <p className="text-2xl font-semibold text-foreground">{approvedDeals.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {activeLoansTotal > 0 ? formatCurrency(activeLoansTotal) : "--"}
                </p>
                <p className="text-sm text-muted-foreground">Active Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incoming Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deals Matching Your Box</CardTitle>
          <Link href="/app/opportunities">
            <Button variant="ghost" className="text-primary">
              Update Buy Box
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {incomingDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No deals matching your buy box yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Deals will appear here as borrowers submit applications that match your lending criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-5 transition-colors hover:bg-secondary/30 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {deal.property_address || "Address Pending"}
                      </p>
                      {deal.saintsal_confidence && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Sparkles className="h-3 w-3" />
                          {deal.saintsal_confidence}% match
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Borrower: {deal.borrower_name || "Pending"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Loan Amount</p>
                      <p className="font-semibold text-foreground">
                        {deal.loan_amount ? formatCurrency(deal.loan_amount) : "--"}
                      </p>
                    </div>
                    {deal.saintsal_signal && (
                      <div>
                        <p className="text-xs text-muted-foreground">Signal</p>
                        <p className={`font-semibold ${
                          deal.saintsal_signal === "BUY"
                            ? "text-green-500"
                            : deal.saintsal_signal === "PASS"
                              ? "text-red-500"
                              : "text-yellow-500"
                        }`}>
                          {deal.saintsal_signal}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/app/deals/${deal.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Packet
                      </Button>
                    </Link>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Pass
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Servicing */}
      <Card>
        <CardHeader>
          <CardTitle>Active Servicing</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your active loan servicing dashboard will populate as you fund deals.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {loans.slice(0, 5).map((loan) => (
                <div
                  key={loan.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{loan.property_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.borrower_name || "Borrower"} -- {loan.status || "active"}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(loan.current_balance || loan.loan_amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="font-semibold text-foreground">
                        {loan.interest_rate ? `${loan.interest_rate}%` : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LTV</p>
                      <p className="font-semibold text-foreground">
                        {loan.ltv_ratio ? `${loan.ltv_ratio}%` : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
