"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Percent,
  Calculator,
} from "lucide-react"
import type { DealData, Calculations } from "./types"

interface Props {
  data: DealData
  calculations: Calculations
}

const defaultCalculations: Calculations = {
  totalProfit: 0,
  roi: 0,
  cashNeeded: 0,
  equityAtPurchase: 0,
  totalRehabCost: 0,
  maxAllowableOffer: 0,
  percentOfArv: 0,
  totalInvestment: 0,
  totalHoldingCosts: 0,
  totalBuyingCosts: 0,
  totalSellingCosts: 0,
  monthlyHolding: 0,
}

export function AnalyzerResultsPanel({ data, calculations }: Props) {
  const safeCalculations = calculations || defaultCalculations

  const {
    totalProfit,
    roi,
    cashNeeded,
    equityAtPurchase,
    totalRehabCost,
    maxAllowableOffer,
    percentOfArv,
    totalInvestment,
    totalHoldingCosts,
    totalBuyingCosts,
    totalSellingCosts,
    monthlyHolding,
  } = safeCalculations

  const getSignal = () => {
    if (roi >= 25) return { signal: "STRONG BUY", color: "text-green-400", bg: "bg-green-500/10", icon: TrendingUp }
    if (roi >= 15) return { signal: "BUY", color: "text-green-500", bg: "bg-green-500/10", icon: TrendingUp }
    if (roi >= 10) return { signal: "CONSIDER", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Target }
    if (roi >= 0)
      return { signal: "RENEGOTIATE", color: "text-orange-500", bg: "bg-orange-500/10", icon: AlertTriangle }
    return { signal: "PASS", color: "text-red-500", bg: "bg-red-500/10", icon: TrendingDown }
  }

  const signalData = getSignal()
  const SignalIcon = signalData.icon

  // Always show data - even with zeros
  const formatNumber = (num: number) => {
    return `$${num.toLocaleString()}`
  }

  const handleRunSaintSal = () => {
    if (typeof window !== "undefined" && (window as any).openSaintSalDock) {
      ;(window as any).openSaintSalDock()
    }
  }

  return (
    <div className="w-full lg:w-96 shrink-0 space-y-4">
      {/* Main Profit Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>SaintSal™ Real-time Analysis</span>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Estimated Profit</p>
            <p className={`text-4xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatNumber(totalProfit)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-background/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Percent className="h-3.5 w-3.5" />
                <p className="text-xs">Return on Investment</p>
              </div>
              <p
                className={`text-2xl font-bold mt-1 ${roi >= 15 ? "text-green-500" : roi >= 0 ? "text-foreground" : "text-red-500"}`}
              >
                {roi.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-background/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <p className="text-xs">Cash Required</p>
              </div>
              <p className="text-2xl font-bold mt-1 text-foreground">{formatNumber(cashNeeded)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal Card - Always visible */}
      <Card>
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preliminary Signal</p>
          <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 ${signalData.bg}`}>
            <SignalIcon className={`h-5 w-5 ${signalData.color}`} />
            <span className={`text-xl font-bold ${signalData.color}`}>{signalData.signal}</span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            {roi >= 25 && "Excellent margins. This deal exceeds typical institutional thresholds."}
            {roi >= 15 && roi < 25 && "Solid returns with healthy margin for unexpected costs."}
            {roi >= 10 && roi < 15 && "Acceptable returns but tight margins. Verify all costs."}
            {roi >= 0 && roi < 10 && "Thin margins. Consider renegotiating purchase price."}
            {roi < 0 && "Negative return projected. Pass or significantly renegotiate."}
          </p>
          <button
            onClick={handleRunSaintSal}
            className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Run Full SaintSal™ Analysis
          </button>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cost Breakdown</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="text-sm font-medium text-foreground">{formatNumber(data.purchasePrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rehab Budget</span>
              <span className="text-sm font-medium text-foreground">{formatNumber(totalRehabCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Buying Costs</span>
              <span className="text-sm font-medium text-foreground">{formatNumber(totalBuyingCosts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Holding Costs</span>
              <span className="text-sm font-medium text-foreground">{formatNumber(totalHoldingCosts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Selling Costs</span>
              <span className="text-sm font-medium text-foreground">{formatNumber(totalSellingCosts)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total Investment</span>
              <span className="text-sm font-bold text-primary">{formatNumber(totalInvestment)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key Metrics</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">% of ARV</span>
              <span
                className={`text-sm font-medium ${percentOfArv <= 70 ? "text-green-500" : percentOfArv <= 80 ? "text-yellow-500" : "text-red-500"}`}
              >
                {percentOfArv > 0 ? `${percentOfArv.toFixed(1)}%` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Max Allowable Offer</span>
              <span className="text-sm font-medium text-primary">
                {maxAllowableOffer > 0 ? formatNumber(maxAllowableOffer) : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Equity at Purchase</span>
              <span className={`text-sm font-medium ${equityAtPurchase >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatNumber(equityAtPurchase)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">LTV</span>
              <span className="text-sm font-medium text-foreground">
                {data.purchasePrice > 0 && data.loanAmount > 0
                  ? `${((data.loanAmount / data.purchasePrice) * 100).toFixed(1)}%`
                  : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Carry</span>
              <span className="text-sm font-medium text-foreground">{formatNumber(monthlyHolding)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit per Sq Ft</span>
              <span className="text-sm font-medium text-foreground">
                {data.sqft > 0 ? `$${(totalProfit / data.sqft).toFixed(2)}` : "--"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags */}
      {(roi < 15 || percentOfArv > 75 || totalRehabCost === 0) && (
        <Card className="border-yellow-500/30">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-yellow-500">Risk Flags</p>
            {roi < 15 && roi >= 0 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Thin Margins</p>
                  <p className="text-xs text-muted-foreground">ROI below 15% leaves little room for cost overruns.</p>
                </div>
              </div>
            )}
            {roi < 0 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">Negative Returns</p>
                  <p className="text-xs text-muted-foreground">This deal loses money at current numbers.</p>
                </div>
              </div>
            )}
            {percentOfArv > 75 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">High Purchase %</p>
                  <p className="text-xs text-muted-foreground">Purchase exceeds 75% of ARV. Consider renegotiating.</p>
                </div>
              </div>
            )}
            {totalRehabCost === 0 && data.purchasePrice > 0 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">No Rehab Budget</p>
                  <p className="text-xs text-muted-foreground">Add rehab costs for accurate analysis.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
