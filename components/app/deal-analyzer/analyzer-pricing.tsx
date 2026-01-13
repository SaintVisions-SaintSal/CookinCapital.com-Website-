"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DealData, Calculations } from "./types"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
  calculations?: Calculations
}

const defaultCalculations: Calculations = {
  totalRehabCost: 0,
  totalLoanCosts: 0,
  totalHoldingCosts: 0,
  totalSellingCosts: 0,
  totalProjectCosts: 0,
  equityAtPurchase: 0,
  cashOutOfPocket: 0,
  totalProfit: 0,
  roi: 0,
  annualizedRoi: 0,
  monthlyPayment: 0,
  pointsCost: 0,
  loanAmount: 0,
  realtorCommission: 0,
  closingCosts: 0,
  transferTax: 0,
  monthlyHoldingCost: 0,
  ltvPercent: 0,
  arvPercent: 0,
  profitPerSqft: 0,
}

export function AnalyzerPricing({ data, onChange, calculations }: Props) {
  const safeCalculations = calculations || defaultCalculations

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  const maxAllowableOffer = data.arv > 0 ? data.arv * 0.7 - safeCalculations.totalRehabCost : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Values & Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="askingPrice">Asking Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="askingPrice"
                type="text"
                value={formatCurrency(data.askingPrice)}
                onChange={(e) => onChange({ askingPrice: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">List price from seller</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arv">After Repair Value (ARV)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="arv"
                type="text"
                value={formatCurrency(data.arv)}
                onChange={(e) => onChange({ arv: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">Expected value after rehab</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Your Purchase Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="purchasePrice"
                type="text"
                value={formatCurrency(data.purchasePrice)}
                onChange={(e) => onChange({ purchasePrice: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">What you'll offer / pay</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Max Allowable Offer (70% Rule)</Label>
            <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3">
              <p className="text-2xl font-bold text-primary">
                ${maxAllowableOffer > 0 ? maxAllowableOffer.toLocaleString() : "--"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">ARV × 70% − Rehab = MAO</p>
            </div>
          </div>
        </div>

        {(data.arv > 0 || data.purchasePrice > 0) && (
          <div className="rounded-lg bg-secondary/50 border border-border p-4">
            <p className="text-sm font-medium text-foreground mb-3">Quick Analysis</p>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">% of ARV</p>
                <p className="text-lg font-semibold text-foreground">
                  {data.arv > 0 && data.purchasePrice > 0
                    ? `${((data.purchasePrice / data.arv) * 100).toFixed(1)}%`
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ARV per Sq Ft</p>
                <p className="text-lg font-semibold text-foreground">
                  {data.arv > 0 && data.sqft > 0 ? `$${(data.arv / data.sqft).toFixed(0)}` : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Equity at Purchase</p>
                <p
                  className={`text-lg font-semibold ${safeCalculations.equityAtPurchase >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  ${safeCalculations.equityAtPurchase.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">All-In Cost</p>
                <p className="text-lg font-semibold text-foreground">
                  ${(data.purchasePrice + safeCalculations.totalRehabCost).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
