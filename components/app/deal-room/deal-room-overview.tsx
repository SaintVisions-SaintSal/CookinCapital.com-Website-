import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Percent, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react"
import type { Deal } from "./deal-room"

interface Props {
  deal: Deal
}

export function DealRoomOverview({ deal }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Key Numbers */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projected Profit</p>
                  <p className="text-xl font-semibold text-foreground">${deal.projectedProfit.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className="text-xl font-semibold text-foreground">{deal.roi}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Price</p>
                  <p className="text-xl font-semibold text-foreground">${deal.purchasePrice.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ARV</p>
                  <p className="text-xl font-semibold text-foreground">${deal.arv.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deal Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              SaintSal Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Strong flip opportunity with 24.3% projected ROI. Clear title, no liens, property is 32.7% below ARV.
              Foundation is solid, roof replaced in 2019. Recommend proceeding with standard due diligence and
              submitting offer at current purchase price.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Top Reasons</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Property priced 32.7% below ARV</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Clear title, no outstanding liens</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Strong rental market if exit delayed</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Risk Flags</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                    <span className="text-muted-foreground">Foundation inspection recommended</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Purchase Price</span>
                <span className="font-medium text-foreground">${deal.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Rehab Budget</span>
                <span className="font-medium text-foreground">${deal.rehabBudget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Holding Costs (6 mo)</span>
                <span className="font-medium text-foreground">$4,200</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Financing Costs</span>
                <span className="font-medium text-foreground">$8,300</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Selling Costs</span>
                <span className="font-medium text-foreground">$16,500</span>
              </div>
              <div className="flex items-center justify-between py-2 text-lg">
                <span className="font-semibold text-foreground">Projected Profit</span>
                <span className="font-bold text-green-500">${deal.projectedProfit.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Next Best Moves */}
      <div className="space-y-6">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Next Best Moves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Submit offer at $185,000</p>
                <p className="text-xs text-muted-foreground mt-0.5">Based on market analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Order foundation inspection</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mitigate risk flag</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Lock in financing at 12%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Matched to 3 lenders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confidence Level</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-[85%] rounded-full bg-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">High</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Sources Used</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• PropertyRadar ownership data</li>
              <li>• County tax records</li>
              <li>• MLS comparable sales</li>
              <li>• Title search results</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
