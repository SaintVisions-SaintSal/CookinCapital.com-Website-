import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ArrowRight, Clock, CheckCircle2, AlertTriangle, FileText, TrendingUp } from "lucide-react"

const activeDeals = [
  {
    id: "1",
    address: "123 Main St, Austin, TX",
    status: "analyzing",
    stage: "Analyze",
    signal: null,
    updated: "2 hours ago",
  },
  {
    id: "2",
    address: "456 Oak Ave, Houston, TX",
    status: "funded",
    stage: "Fund",
    signal: "BUY",
    updated: "1 day ago",
  },
  {
    id: "3",
    address: "789 Pine Rd, Dallas, TX",
    status: "pending",
    stage: "Acquire",
    signal: "RENEGOTIATE",
    updated: "3 days ago",
  },
]

const stages = ["Acquire", "Analyze", "Fund", "Close"]

export function DashboardBorrower() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Welcome back, John</h1>
        <p className="mt-1 text-muted-foreground">What's your next best move?</p>
      </div>

      {/* Quick action - Made button functional */}
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
                <p className="text-2xl font-semibold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Active Deals</p>
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
                <p className="text-2xl font-semibold text-foreground">8</p>
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
                <p className="text-2xl font-semibold text-foreground">$1.2M</p>
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
                <p className="text-2xl font-semibold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">Legal Alert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deals - Made View All and deal items clickable */}
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
          <div className="space-y-4">
            {activeDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/app/deals/${deal.id}`}
                className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{deal.address}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {deal.updated}
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
                          <div className={`mx-1 h-0.5 w-4 ${index < stageIndex ? "bg-primary" : "bg-border"}`} />
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
        </CardContent>
      </Card>
    </div>
  )
}
