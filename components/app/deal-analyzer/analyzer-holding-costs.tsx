"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { DealData } from "./types"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
}

export function AnalyzerHoldingCosts({ data, onChange }: Props) {
  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  const monthlyTotal =
    data.monthlyTaxes +
    data.monthlyInsurance +
    data.monthlyUtilities +
    data.monthlyHOA +
    data.lawnCare +
    data.security +
    data.propertyManagement

  const totalHolding = monthlyTotal * data.holdingPeriodMonths

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holding Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="holdingPeriodMonths">Holding Period</Label>
            <span className="text-2xl font-bold text-primary">{data.holdingPeriodMonths} months</span>
          </div>
          <Slider
            value={[data.holdingPeriodMonths]}
            onValueChange={(value) => onChange({ holdingPeriodMonths: value[0] })}
            min={1}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 month</span>
            <span>6 months</span>
            <span>12 months</span>
            <span>24 months</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <p className="text-sm font-medium text-muted-foreground">Essential Monthly Expenses</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monthlyTaxes">Property Taxes</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="monthlyTaxes"
                type="text"
                value={data.monthlyTaxes ? data.monthlyTaxes.toLocaleString() : ""}
                onChange={(e) => onChange({ monthlyTaxes: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyInsurance">Insurance (Builder's Risk)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="monthlyInsurance"
                type="text"
                value={data.monthlyInsurance ? data.monthlyInsurance.toLocaleString() : ""}
                onChange={(e) => onChange({ monthlyInsurance: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyUtilities">Utilities</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="monthlyUtilities"
                type="text"
                value={data.monthlyUtilities ? data.monthlyUtilities.toLocaleString() : ""}
                onChange={(e) => onChange({ monthlyUtilities: parseCurrency(e.target.value) })}
                placeholder="200"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Electric, gas, water, sewer</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyHOA">HOA / COA Fees</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="monthlyHOA"
                type="text"
                value={data.monthlyHOA ? data.monthlyHOA.toLocaleString() : ""}
                onChange={(e) => onChange({ monthlyHOA: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <p className="text-sm font-medium text-muted-foreground">Additional Monthly Expenses</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="lawnCare">Lawn / Pool Care</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="lawnCare"
                type="text"
                value={data.lawnCare ? data.lawnCare.toLocaleString() : ""}
                onChange={(e) => onChange({ lawnCare: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security">Security / Monitoring</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="security"
                type="text"
                value={data.security ? data.security.toLocaleString() : ""}
                onChange={(e) => onChange({ security: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyManagement">Property Management</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="propertyManagement"
                type="text"
                value={data.propertyManagement ? data.propertyManagement.toLocaleString() : ""}
                onChange={(e) => onChange({ propertyManagement: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Monthly Carry</p>
              <p className="text-xs text-muted-foreground">Total monthly holding cost</p>
            </div>
            <p className="text-2xl font-semibold text-foreground">${monthlyTotal.toLocaleString()}</p>
          </div>
          <div className="mt-4 h-px bg-border" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Total Holding Costs</p>
              <p className="text-xs text-muted-foreground">
                {data.holdingPeriodMonths} months × ${monthlyTotal.toLocaleString()}
              </p>
            </div>
            <p className="text-2xl font-bold text-primary">${totalHolding.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
