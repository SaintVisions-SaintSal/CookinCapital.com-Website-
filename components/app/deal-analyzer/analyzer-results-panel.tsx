"use client"

import { useState } from "react"
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
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Image from "next/image"
import type { DealData, Calculations } from "./types"

interface Props {
  data: DealData
  calculations: Calculations
}

const getDealGrade = (roi: number) => {
  if (roi >= 20)
    return {
      grade: "A",
      label: "Excellent Deal",
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/50",
    }
  if (roi >= 15)
    return {
      grade: "B+",
      label: "Strong Deal",
      color: "text-green-500",
      bg: "bg-green-500/15",
      border: "border-green-500/40",
    }
  if (roi >= 10)
    return {
      grade: "B-",
      label: "Decent Deal",
      color: "text-yellow-400",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/40",
    }
  if (roi >= 5)
    return {
      grade: "C",
      label: "Marginal Deal",
      color: "text-orange-400",
      bg: "bg-orange-500/15",
      border: "border-orange-500/40",
    }
  if (roi >= 0)
    return { grade: "D", label: "Poor Deal", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/40" }
  return { grade: "F", label: "Hard Pass", color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500/50" }
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
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

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

  const gradeData = getDealGrade(roi)

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

  const formatNumber = (num: number) => {
    return `$${num.toLocaleString()}`
  }

  const handleAnalyzeWithSaintSal = async () => {
    setAnalyzing(true)
    setShowAnalysis(true)

    try {
      const response = await fetch("/api/saintsal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analyze this deal briefly (2-3 sentences max):
              
Property: ${data.address}, ${data.city}, ${data.state} ${data.zip}
Type: ${data.propertyType} | ${data.bedrooms}bd/${data.bathrooms}ba | ${data.sqft} sqft

Numbers:
- Purchase: $${data.purchasePrice.toLocaleString()}
- ARV: $${data.arv.toLocaleString()}
- Rehab: $${totalRehabCost.toLocaleString()}
- Total Investment: $${totalInvestment.toLocaleString()}
- Profit: $${totalProfit.toLocaleString()}
- ROI: ${roi.toFixed(1)}%

Grade: ${gradeData.grade} (${gradeData.label})

Give a quick verdict and one key insight.`,
            },
          ],
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysis(result.content || result.text || "Analysis complete.")
      } else {
        // Fallback analysis if API fails
        setAnalysis(getQuickAnalysis())
      }
    } catch (error) {
      console.error("SaintSal analysis error:", error)
      setAnalysis(getQuickAnalysis())
    }

    setAnalyzing(false)
  }

  const getQuickAnalysis = () => {
    if (roi >= 20) {
      return `Strong ${gradeData.grade}-rated deal with ${roi.toFixed(1)}% ROI. At ${percentOfArv.toFixed(0)}% of ARV, you have solid equity protection. This one's worth pursuing.`
    } else if (roi >= 15) {
      return `Solid ${gradeData.grade} deal showing ${roi.toFixed(1)}% returns. Numbers work but watch your rehab budget closely to protect margins.`
    } else if (roi >= 10) {
      return `${gradeData.grade} deal at ${roi.toFixed(1)}% ROI - acceptable but tight. Consider negotiating $${Math.round(data.purchasePrice * 0.05).toLocaleString()} off purchase price.`
    } else if (roi >= 5) {
      return `${gradeData.grade} grade - thin margins at ${roi.toFixed(1)}%. Too risky unless you can reduce purchase price or rehab costs significantly.`
    } else if (roi >= 0) {
      return `${gradeData.grade} grade deal losing potential. At ${roi.toFixed(1)}% ROI, any cost overrun puts you underwater. Hard pass or renegotiate.`
    }
    return `Hard Pass. Negative ${Math.abs(roi).toFixed(1)}% ROI means you lose money from day one. Walk away or offer $${Math.round(data.purchasePrice * 0.7).toLocaleString()} max.`
  }

  const handleRunSaintSal = () => {
    if (typeof window !== "undefined" && (window as any).openSaintSalDock) {
      ;(window as any).openSaintSalDock()
    }
  }

  return (
    <div className="w-full lg:w-96 shrink-0 space-y-4">
      <Card className={`${gradeData.border} ${gradeData.bg} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image src="/logo.png" alt="SaintSal" fill className="rounded-full object-cover" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SaintSal™ Grade</p>
                <p className={`text-3xl font-black ${gradeData.color}`}>{gradeData.grade}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${gradeData.color}`}>{gradeData.label}</p>
              <p className="text-xs text-muted-foreground">{roi.toFixed(1)}% ROI</p>
            </div>
          </div>

          {/* Grade Scale */}
          <div className="mt-4 flex items-center gap-1">
            {["A", "B+", "B-", "C", "D", "F"].map((g) => (
              <div
                key={g}
                className={`flex-1 h-2 rounded-full ${
                  g === gradeData.grade
                    ? g === "A"
                      ? "bg-green-400"
                      : g === "B+"
                        ? "bg-green-500"
                        : g === "B-"
                          ? "bg-yellow-400"
                          : g === "C"
                            ? "bg-orange-400"
                            : g === "D"
                              ? "bg-red-400"
                              : "bg-red-600"
                    : "bg-muted/30"
                }`}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>20%+</span>
            <span>15%</span>
            <span>10%</span>
            <span>5%</span>
            <span>0%</span>
            <span>&lt;0</span>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyzeWithSaintSal}
            disabled={analyzing}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze with SaintSal™
              </>
            )}
          </button>

          {/* Inline Analysis Result */}
          {showAnalysis && (
            <div className="mt-4 rounded-lg bg-background/60 p-4 border border-border">
              {analyzing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">SaintSal is analyzing your deal...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    {roi >= 10 ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                    )}
                    <p className="text-sm text-foreground leading-relaxed">{analysis}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunSaintSal}
                      className="flex-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Ask Follow-up
                    </button>
                    <button
                      onClick={() => setShowAnalysis(false)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Profit Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Real-time Analysis</span>
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

      {/* Signal Card */}
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
