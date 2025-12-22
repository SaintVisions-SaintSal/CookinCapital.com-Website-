import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Landmark, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"
import type { Deal } from "./deal-room"

interface Props {
  deal: Deal
}

const lenderMatches = [
  {
    id: "1",
    name: "Hard Money Fund A",
    type: "Hard Money",
    matchScore: 96,
    rate: "11.5%",
    points: "2 pts",
    ltv: "75%",
    term: "12 mo",
    status: "recommended",
  },
  {
    id: "2",
    name: "Private Lender B",
    type: "Private Money",
    matchScore: 91,
    rate: "12%",
    points: "1.5 pts",
    ltv: "70%",
    term: "18 mo",
    status: "available",
  },
  {
    id: "3",
    name: "Bridge Lending Co",
    type: "Bridge",
    matchScore: 84,
    rate: "10.5%",
    points: "2.5 pts",
    ltv: "80%",
    term: "24 mo",
    status: "available",
  },
]

export function DealRoomFunding({ deal }: Props) {
  return (
    <div className="space-y-6">
      {/* Current funding status */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs text-muted-foreground">Loan Amount Needed</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">$148,000</p>
              <p className="text-xs text-muted-foreground">80% of purchase price</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs text-muted-foreground">Down Payment</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">$37,000</p>
              <p className="text-xs text-muted-foreground">20% equity required</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs text-muted-foreground">Cash to Close</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">$92,500</p>
              <p className="text-xs text-muted-foreground">Including rehab budget</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lender matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Matched Lenders</CardTitle>
          <div className="flex items-center gap-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" />
            SaintSal Matched
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lenderMatches.map((lender) => (
              <div
                key={lender.id}
                className={`rounded-xl border p-5 transition-colors ${
                  lender.status === "recommended"
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                      <Landmark className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{lender.name}</p>
                        {lender.status === "recommended" && (
                          <Badge className="bg-primary text-primary-foreground">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{lender.type}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Match</p>
                      <p className="font-semibold text-primary">{lender.matchScore}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="font-semibold text-foreground">{lender.rate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Points</p>
                      <p className="font-semibold text-foreground">{lender.points}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">LTV</p>
                      <p className="font-semibold text-foreground">{lender.ltv}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Term</p>
                      <p className="font-semibold text-foreground">{lender.term}</p>
                    </div>
                  </div>

                  <Button className={lender.status === "recommended" ? "bg-primary text-primary-foreground" : ""}>
                    Request Intro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
