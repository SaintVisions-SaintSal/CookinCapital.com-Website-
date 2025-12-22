"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DealData } from "./types"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
}

export function AnalyzerSellingCosts({ data, onChange }: Props) {
  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  const agentCommission = (data.arv * data.agentCommissionPercent) / 100

  const totalSelling =
    agentCommission +
    data.closingCostsSelling +
    data.titleInsuranceSelling +
    data.transferTaxes +
    data.homeWarranty +
    data.concessions +
    data.stagingCost +
    data.photographyMarketing +
    data.otherSellingCosts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selling Transaction Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">Enter all costs associated with selling the property at ARV.</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentCommissionPercent">Agent Commission</Label>
            <div className="flex gap-2 mb-2">
              {[5, 5.5, 6, 6.5, 7].map((pct) => (
                <button
                  key={pct}
                  onClick={() => onChange({ agentCommissionPercent: pct })}
                  className={`flex-1 rounded-lg border py-1.5 text-sm font-medium transition-colors ${
                    data.agentCommissionPercent === pct
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-foreground hover:border-primary/50"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="relative">
              <Input
                id="agentCommissionPercent"
                type="number"
                step="0.25"
                value={data.agentCommissionPercent || ""}
                onChange={(e) => onChange({ agentCommissionPercent: Number.parseFloat(e.target.value) || 0 })}
                placeholder="6"
                className="bg-secondary border-0 pr-7"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            {data.arv > 0 && (
              <p className="text-xs text-muted-foreground">
                Commission: ${agentCommission.toLocaleString()} on ${data.arv.toLocaleString()} ARV
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="closingCostsSelling">Closing Costs</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="closingCostsSelling"
                type="text"
                value={data.closingCostsSelling ? data.closingCostsSelling.toLocaleString() : ""}
                onChange={(e) => onChange({ closingCostsSelling: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Settlement fees</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleInsuranceSelling">Title Insurance</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="titleInsuranceSelling"
                type="text"
                value={data.titleInsuranceSelling ? data.titleInsuranceSelling.toLocaleString() : ""}
                onChange={(e) => onChange({ titleInsuranceSelling: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Buyer's policy (if paying)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferTaxes">Transfer Taxes</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="transferTaxes"
                type="text"
                value={data.transferTaxes ? data.transferTaxes.toLocaleString() : ""}
                onChange={(e) => onChange({ transferTaxes: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">State / county transfer tax</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeWarranty">Home Warranty</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="homeWarranty"
                type="text"
                value={data.homeWarranty ? data.homeWarranty.toLocaleString() : ""}
                onChange={(e) => onChange({ homeWarranty: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Buyer home warranty</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concessions">Buyer Concessions</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="concessions"
                type="text"
                value={data.concessions ? data.concessions.toLocaleString() : ""}
                onChange={(e) => onChange({ concessions: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Closing cost credits</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stagingCost">Staging</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="stagingCost"
                type="text"
                value={data.stagingCost ? data.stagingCost.toLocaleString() : ""}
                onChange={(e) => onChange({ stagingCost: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Furniture rental / staging</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photographyMarketing">Photography & Marketing</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="photographyMarketing"
                type="text"
                value={data.photographyMarketing ? data.photographyMarketing.toLocaleString() : ""}
                onChange={(e) => onChange({ photographyMarketing: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Photos, video, 3D tour, ads</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherSellingCosts">Other Selling Costs</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="otherSellingCosts"
                type="text"
                value={data.otherSellingCosts ? data.otherSellingCosts.toLocaleString() : ""}
                onChange={(e) => onChange({ otherSellingCosts: parseCurrency(e.target.value) })}
                placeholder="0"
                className="bg-secondary border-0 pl-7"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Misc exit costs</p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Total Selling Costs</p>
              <p className="text-xs text-muted-foreground">All exit transaction costs</p>
            </div>
            <p className="text-2xl font-bold text-primary">${totalSelling.toLocaleString()}</p>
          </div>
          <div className="mt-3 h-px bg-border" />
          <div className="mt-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Agent Commission</span>
              <span>${agentCommission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Other Costs</span>
              <span>${(totalSelling - agentCommission).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
