import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react"

const cases = [
  {
    id: "1",
    address: "456 Oak Ave, Houston, TX",
    type: "Foreclosure Prevention",
    status: "in-progress",
    viability: "likely",
    submitted: "Jan 10, 2024",
    nextAction: "Bank negotiation scheduled",
  },
  {
    id: "2",
    address: "789 Pine Rd, Dallas, TX",
    type: "Arrears Roll-in",
    status: "review",
    viability: "possible",
    submitted: "Jan 15, 2024",
    nextAction: "Awaiting lender response",
  },
  {
    id: "3",
    address: "321 Elm St, San Antonio, TX",
    type: "Bankruptcy Workout",
    status: "completed",
    viability: "likely",
    submitted: "Dec 20, 2023",
    nextAction: "Case closed successfully",
  },
]

export function RescueCases() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Legal Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-border p-5 transition-colors hover:bg-secondary/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-foreground">{c.address}</p>
                    <Badge
                      variant="outline"
                      className={
                        c.status === "completed"
                          ? "bg-green-500/10 text-green-500 border-green-500/30"
                          : c.status === "in-progress"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                      }
                    >
                      {c.status === "completed"
                        ? "Completed"
                        : c.status === "in-progress"
                          ? "In Progress"
                          : "Under Review"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.type}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Submitted {c.submitted}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Resolution {c.viability}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next Action</p>
                    <p className="text-sm font-medium text-foreground">{c.nextAction}</p>
                  </div>
                  <Button variant="outline">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Viability legend */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            SaintSal Resolution Ratings
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Likely - High success probability</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Possible - Requires negotiation</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Unlikely - Limited options</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
