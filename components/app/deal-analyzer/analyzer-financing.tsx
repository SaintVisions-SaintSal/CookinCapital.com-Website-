"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { DealData, Calculations } from "./types"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
  calculations: Calculations
}

const defaultCalculations: Calculations = {
  totalRehabCost: 0,
  totalHoldingCosts: 0,
  totalFinancingCosts: 0,
  totalClosingCosts: 0,
  totalProjectCost: 0,
  totalProfit: 0,
  roi: 0,
  annualizedRoi: 0,
  cashOnCash: 0,
  pointsCost: 0,
  totalInterest: 0,
  monthlyInterest: 0,
  totalCashRequired: 0,
  equityRequired: 0,
}

export function AnalyzerFinancing({ data, onChange, calculations }: Props) {
  const safeCalculations = calculations || defaultCalculations

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  const calculateLoanFromLTV = (ltv: number) => {
    if (data.purchasePrice > 0) {
      onChange({ loanAmount: Math.round(data.purchasePrice * (ltv / 100)) })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financing Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Financing Type */}
        <div className="space-y-2">
          <Label>Financing Type</Label>
          <Select value={data.financingType} onValueChange={(value) => onChange({ financingType: value })}>
            <SelectTrigger className="bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hard-money">Hard Money</SelectItem>
              <SelectItem value="private-money">Private Money</SelectItem>
              <SelectItem value="conventional">Conventional</SelectItem>
              <SelectItem value="cash">All Cash</SelectItem>
              <SelectItem value="bridge">Bridge Loan</SelectItem>
              <SelectItem value="dscr">DSCR Loan</SelectItem>
              <SelectItem value="heloc">HELOC</SelectItem>
              <SelectItem value="seller-finance">Seller Financing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.financingType !== "cash" && (
          <>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Quick LTV Selection</Label>
              <div className="flex gap-2">
                {[70, 75, 80, 85, 90].map((ltv) => (
                  <button
                    key={ltv}
                    onClick={() => calculateLoanFromLTV(ltv)}
                    className="flex-1 rounded-lg border border-border bg-secondary/50 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    {ltv}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="loanAmount"
                    type="text"
                    value={data.loanAmount ? data.loanAmount.toLocaleString() : ""}
                    onChange={(e) => onChange({ loanAmount: parseCurrency(e.target.value) })}
                    placeholder="0"
                    className="bg-secondary border-0 pl-7"
                  />
                </div>
                {data.purchasePrice > 0 && data.loanAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    LTV: {((data.loanAmount / data.purchasePrice) * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <div className="relative">
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.25"
                    value={data.interestRate || ""}
                    onChange={(e) => onChange({ interestRate: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="12"
                    className="bg-secondary border-0 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loanTermMonths">Loan Term (months)</Label>
                <Input
                  id="loanTermMonths"
                  type="number"
                  value={data.loanTermMonths || ""}
                  onChange={(e) => onChange({ loanTermMonths: Number.parseInt(e.target.value) || 0 })}
                  placeholder="12"
                  className="bg-secondary border-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanPoints">Loan Points (%)</Label>
                <div className="relative">
                  <Input
                    id="loanPoints"
                    type="number"
                    step="0.5"
                    value={data.loanPoints || ""}
                    onChange={(e) => onChange({ loanPoints: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="2"
                    className="bg-secondary border-0 pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {data.loanAmount > 0 && data.loanPoints > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Points cost: ${((data.loanAmount * data.loanPoints) / 100).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rehabFinanced">Finance Rehab Costs?</Label>
                  <p className="text-xs text-muted-foreground">Include rehab in your loan (draws)</p>
                </div>
                <Switch
                  id="rehabFinanced"
                  checked={data.rehabFinanced}
                  onCheckedChange={(checked) => onChange({ rehabFinanced: checked })}
                />
              </div>

              {data.rehabFinanced && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rehabLoanAmount">Rehab Loan Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="rehabLoanAmount"
                        type="text"
                        value={data.rehabLoanAmount ? data.rehabLoanAmount.toLocaleString() : ""}
                        onChange={(e) => onChange({ rehabLoanAmount: parseCurrency(e.target.value) })}
                        placeholder="0"
                        className="bg-secondary border-0 pl-7"
                      />
                    </div>
                    {safeCalculations.totalRehabCost > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {((data.rehabLoanAmount / safeCalculations.totalRehabCost) * 100).toFixed(0)}% of rehab financed
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Draw Schedule</Label>
                    <Select value={data.drawSchedule} onValueChange={(value) => onChange({ drawSchedule: value })}>
                      <SelectTrigger className="bg-secondary border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upfront">100% Upfront</SelectItem>
                        <SelectItem value="monthly">Monthly Draws</SelectItem>
                        <SelectItem value="milestone">Milestone Draws</SelectItem>
                        <SelectItem value="completion">At Completion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Down Payment Required</p>
              <p className="text-xs text-muted-foreground">Cash needed at closing for acquisition</p>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              ${Math.max(0, data.purchasePrice - data.loanAmount).toLocaleString()}
            </p>
          </div>

          {data.financingType !== "cash" && (
            <>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Points Cost</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${safeCalculations.pointsCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${safeCalculations.totalInterest.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Payment</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${((data.loanAmount * (data.interestRate / 100)) / 12).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
