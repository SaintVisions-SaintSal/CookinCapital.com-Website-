"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DealData } from "./types"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
}

export function AnalyzerBuyingCosts({ data, onChange }: Props) {
  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  const totalBuying =
    data.closingCostsBuying +
    data.inspectionCosts +
    data.appraisalCosts +
    data.titleInsuranceBuying +
    data.surveyFee +
    data.attorneyFees +
    data.recordingFees +
    data.escrowFees +
    data.otherBuyingCosts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buying Transaction Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">Enter all costs associated with acquiring the property.</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="closingCostsBuying">Closing Costs</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="closingCostsBuying"
                type="text"
                value={data.closingCostsBuying ? data.closingCostsBuying.toLocaleString() : ""}
                onChange={(e) => onChange({ closingCostsBuying: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Lender fees, origination</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspectionCosts">Inspection</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="inspectionCosts"
                type="text"
                value={data.inspectionCosts ? data.inspectionCosts.toLocaleString() : ""}
                onChange={(e) => onChange({ inspectionCosts: parseCurrency(e.target.value) })}
                placeholder="500"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Home, termite, sewer scope</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appraisalCosts">Appraisal</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="appraisalCosts"
                type="text"
                value={data.appraisalCosts ? data.appraisalCosts.toLocaleString() : ""}
                onChange={(e) => onChange({ appraisalCosts: parseCurrency(e.target.value) })}
                placeholder="500"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">As-is and/or ARV appraisal</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleInsuranceBuying">Title Insurance</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="titleInsuranceBuying"
                type="text"
                value={data.titleInsuranceBuying ? data.titleInsuranceBuying.toLocaleString() : ""}
                onChange={(e) => onChange({ titleInsuranceBuying: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Owner's policy</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="surveyFee">Survey</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="surveyFee"
                type="text"
                value={data.surveyFee ? data.surveyFee.toLocaleString() : ""}
                onChange={(e) => onChange({ surveyFee: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Property survey / plat</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attorneyFees">Attorney Fees</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="attorneyFees"
                type="text"
                value={data.attorneyFees ? data.attorneyFees.toLocaleString() : ""}
                onChange={(e) => onChange({ attorneyFees: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Closing attorney / legal</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordingFees">Recording Fees</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="recordingFees"
                type="text"
                value={data.recordingFees ? data.recordingFees.toLocaleString() : ""}
                onChange={(e) => onChange({ recordingFees: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">County recording</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escrowFees">Escrow Fees</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="escrowFees"
                type="text"
                value={data.escrowFees ? data.escrowFees.toLocaleString() : ""}
                onChange={(e) => onChange({ escrowFees: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Escrow / title company</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherBuyingCosts">Other Costs</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="otherBuyingCosts"
                type="text"
                value={data.otherBuyingCosts ? data.otherBuyingCosts.toLocaleString() : ""}
                onChange={(e) => onChange({ otherBuyingCosts: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Misc acquisition costs</p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Total Buying Costs</p>
              <p className="text-xs text-muted-foreground">All acquisition transaction costs</p>
            </div>
            <p className="text-2xl font-bold text-primary">${totalBuying.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
