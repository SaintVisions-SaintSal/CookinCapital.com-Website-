import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Landmark, ArrowRight, Sparkles, CheckCircle2, XCircle, Clock, FileText, AlertCircle } from "lucide-react"

const incomingDeals = [
  {
    id: "1",
    address: "123 Main St, Austin, TX",
    borrower: "John D.",
    loanAmount: "$285,000",
    ltv: "72%",
    matchScore: 94,
    status: "pending",
  },
  {
    id: "2",
    address: "456 Oak Ave, Houston, TX",
    borrower: "Sarah M.",
    loanAmount: "$425,000",
    ltv: "68%",
    matchScore: 88,
    status: "pending",
  },
  {
    id: "3",
    address: "789 Pine Rd, Dallas, TX",
    borrower: "Mike R.",
    loanAmount: "$195,000",
    ltv: "75%",
    matchScore: 82,
    status: "pending",
  },
]

export function DashboardKLender() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">KLender Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Deals matching your buy box criteria</p>
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
                <p className="text-2xl font-semibold text-foreground">5</p>
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
                <p className="text-2xl font-semibold text-foreground">3</p>
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
                <p className="text-2xl font-semibold text-foreground">12</p>
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
                <p className="text-2xl font-semibold text-foreground">$2.4M</p>
                <p className="text-sm text-muted-foreground">Active Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incoming Deals - Made all buttons functional */}
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
          <div className="space-y-4">
            {incomingDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex flex-col gap-4 rounded-lg border border-border p-5 transition-colors hover:bg-secondary/30 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{deal.address}</p>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Sparkles className="h-3 w-3" />
                      {deal.matchScore}% match
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Borrower: {deal.borrower}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="font-semibold text-foreground">{deal.loanAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LTV</p>
                    <p className="font-semibold text-foreground">{deal.ltv}</p>
                  </div>
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
        </CardContent>
      </Card>

      {/* Servicing */}
      <Card>
        <CardHeader>
          <CardTitle>Active Servicing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>Loan servicing and monitoring dashboard will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
