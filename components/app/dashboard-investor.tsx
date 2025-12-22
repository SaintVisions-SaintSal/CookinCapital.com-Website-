import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ArrowRight, Sparkles, DollarSign, PieChart, Clock } from "lucide-react"

const newMatches = [
  {
    id: "1",
    address: "123 Main St, Austin, TX",
    strategy: "Flip",
    projectedROI: "24.3%",
    yield: "12.5%",
    verified: true,
  },
  {
    id: "2",
    address: "456 Oak Ave, Houston, TX",
    strategy: "Rental",
    projectedROI: "18.7%",
    yield: "8.2%",
    verified: true,
  },
  {
    id: "3",
    address: "789 Pine Rd, Dallas, TX",
    strategy: "Commercial",
    projectedROI: "32.1%",
    yield: "15.0%",
    verified: true,
  },
]

export function DashboardInvestor() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Investor Dashboard</h1>
        <p className="mt-1 text-muted-foreground">New opportunities matched to your criteria</p>
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
                <p className="text-2xl font-semibold text-foreground">3</p>
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
                <p className="text-2xl font-semibold text-foreground">$450K</p>
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
                <p className="text-2xl font-semibold text-foreground">18.4%</p>
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
                <p className="text-2xl font-semibold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Matches - Made all buttons functional */}
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
          <div className="grid gap-4 lg:grid-cols-3">
            {newMatches.map((deal) => (
              <div
                key={deal.id}
                className="rounded-xl border border-border p-5 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {deal.strategy}
                  </span>
                  {deal.verified && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Sparkles className="h-3 w-3" />
                      SaintSal™ Verified
                    </div>
                  )}
                </div>

                <p className="mt-4 font-medium text-foreground">{deal.address}</p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Projected ROI</p>
                    <p className="text-lg font-semibold text-foreground">{deal.projectedROI}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Yield</p>
                    <p className="text-lg font-semibold text-foreground">{deal.yield}</p>
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
        </CardContent>
      </Card>

      {/* Yield Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>Portfolio charts and performance metrics will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
