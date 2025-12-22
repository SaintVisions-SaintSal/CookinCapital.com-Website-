"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Send,
  Printer,
  Loader2,
  Mail,
} from "lucide-react"
import type { DealData, Calculations } from "./types"
import Link from "next/link"

interface Props {
  data: DealData
  calculations: Calculations
}

export function AnalyzerReview({ data, calculations }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const { roi, totalProfit, percentOfArv, maxAllowableOffer, totalRehabCost } = calculations

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

  const generateWorksheetContent = () => {
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })

    return `
================================================================================
                     COOKINCAP DEAL ANALYZER WORKSHEET
                        Powered by SaintSal™ + HACP™
================================================================================

Generated: ${timestamp}
Analysis ID: ${Date.now().toString(36).toUpperCase()}

--------------------------------------------------------------------------------
                              PROPERTY DETAILS
--------------------------------------------------------------------------------

Address:          ${data.address || "Not provided"}
City/State/Zip:   ${data.city || ""}, ${data.state || ""} ${data.zip || ""}
Property Type:    ${data.propertyType}
Bedrooms/Baths:   ${data.bedrooms} bed / ${data.bathrooms} bath
Square Footage:   ${data.sqft.toLocaleString()} sqft
Year Built:       ${data.yearBuilt}
Lot Size:         ${data.lotSize.toLocaleString()} sqft

--------------------------------------------------------------------------------
                              DEAL ECONOMICS
--------------------------------------------------------------------------------

ACQUISITION
  Asking Price:           $${data.askingPrice.toLocaleString()}
  Purchase Price:         $${data.purchasePrice.toLocaleString()}
  After Repair Value:     $${data.arv.toLocaleString()}

REHAB BUDGET BREAKDOWN
  Demolition:             $${data.rehabCategories.demolition.toLocaleString()}
  Foundation:             $${data.rehabCategories.foundation.toLocaleString()}
  Roofing:                $${data.rehabCategories.roofing.toLocaleString()}
  Siding:                 $${data.rehabCategories.siding.toLocaleString()}
  Windows:                $${data.rehabCategories.windows.toLocaleString()}
  Doors:                  $${data.rehabCategories.doors.toLocaleString()}
  Garage:                 $${data.rehabCategories.garage.toLocaleString()}
  Electrical:             $${data.rehabCategories.electrical.toLocaleString()}
  Plumbing:               $${data.rehabCategories.plumbing.toLocaleString()}
  HVAC:                   $${data.rehabCategories.hvac.toLocaleString()}
  Insulation:             $${data.rehabCategories.insulation.toLocaleString()}
  Drywall:                $${data.rehabCategories.drywall.toLocaleString()}
  Painting:               $${data.rehabCategories.painting.toLocaleString()}
  Flooring:               $${data.rehabCategories.flooring.toLocaleString()}
  Kitchen Cabinets:       $${data.rehabCategories.kitchenCabinets.toLocaleString()}
  Kitchen Countertops:    $${data.rehabCategories.kitchenCountertops.toLocaleString()}
  Kitchen Appliances:     $${data.rehabCategories.kitchenAppliances.toLocaleString()}
  Kitchen Fixtures:       $${data.rehabCategories.kitchenFixtures.toLocaleString()}
  Bathroom Vanities:      $${data.rehabCategories.bathroomVanities.toLocaleString()}
  Bathroom Tile/Shower:   $${data.rehabCategories.bathroomTileShower.toLocaleString()}
  Bathroom Fixtures:      $${data.rehabCategories.bathroomFixtures.toLocaleString()}
  Bathroom Toilets:       $${data.rehabCategories.bathroomToilets.toLocaleString()}
  Interior:               $${data.rehabCategories.interior.toLocaleString()}
  Landscaping:            $${data.rehabCategories.landscaping.toLocaleString()}
  Concrete:               $${data.rehabCategories.concrete.toLocaleString()}
  Decks/Patios:           $${data.rehabCategories.decksPatios.toLocaleString()}
  Fencing:                $${data.rehabCategories.fencing.toLocaleString()}
  Permits:                $${data.rehabCategories.permits.toLocaleString()}
  Dumpsters:              $${data.rehabCategories.dumpsters.toLocaleString()}
  Cleaning:               $${data.rehabCategories.cleaning.toLocaleString()}
  Staging:                $${data.rehabCategories.staging.toLocaleString()}
  General Contractor:     $${data.rehabCategories.generalContractor.toLocaleString()}
  Contingency:            $${data.rehabCategories.contingency.toLocaleString()}
  Miscellaneous:          $${data.rehabCategories.miscellaneous.toLocaleString()}
  ─────────────────────────────────────────────────
  TOTAL REHAB:            $${totalRehabCost.toLocaleString()}

FINANCING
  Financing Type:         ${data.financingType}
  Loan Amount:            $${data.loanAmount.toLocaleString()}
  Interest Rate:          ${data.interestRate}%
  Loan Term:              ${data.loanTermMonths} months
  Points:                 ${data.loanPoints}%
  Points Cost:            $${calculations.pointsCost.toLocaleString()}
  Total Interest:         $${calculations.totalInterest.toLocaleString()}

HOLDING COSTS (${data.holdingPeriodMonths} months)
  Monthly Taxes:          $${data.monthlyTaxes.toLocaleString()}
  Monthly Insurance:      $${data.monthlyInsurance.toLocaleString()}
  Monthly Utilities:      $${data.monthlyUtilities.toLocaleString()}
  Monthly HOA:            $${data.monthlyHOA.toLocaleString()}
  Lawn Care:              $${data.lawnCare.toLocaleString()}
  Security:               $${data.security.toLocaleString()}
  Property Management:    $${data.propertyManagement.toLocaleString()}
  ─────────────────────────────────────────────────
  TOTAL HOLDING:          $${calculations.totalHoldingCosts.toLocaleString()}

BUYING COSTS
  Closing Costs:          $${data.closingCostsBuying.toLocaleString()}
  Inspection:             $${data.inspectionCosts.toLocaleString()}
  Appraisal:              $${data.appraisalCosts.toLocaleString()}
  Title Insurance:        $${data.titleInsuranceBuying.toLocaleString()}
  Survey Fee:             $${data.surveyFee.toLocaleString()}
  Attorney Fees:          $${data.attorneyFees.toLocaleString()}
  Recording Fees:         $${data.recordingFees.toLocaleString()}
  Escrow Fees:            $${data.escrowFees.toLocaleString()}
  Other:                  $${data.otherBuyingCosts.toLocaleString()}
  ─────────────────────────────────────────────────
  TOTAL BUYING:           $${calculations.totalBuyingCosts.toLocaleString()}

SELLING COSTS
  Agent Commission:       ${data.agentCommissionPercent}%
  Closing Costs:          $${data.closingCostsSelling.toLocaleString()}
  Title Insurance:        $${data.titleInsuranceSelling.toLocaleString()}
  Transfer Taxes:         $${data.transferTaxes.toLocaleString()}
  Home Warranty:          $${data.homeWarranty.toLocaleString()}
  Concessions:            $${data.concessions.toLocaleString()}
  Staging:                $${data.stagingCost.toLocaleString()}
  Photography/Marketing:  $${data.photographyMarketing.toLocaleString()}
  Other:                  $${data.otherSellingCosts.toLocaleString()}
  ─────────────────────────────────────────────────
  TOTAL SELLING:          $${calculations.totalSellingCosts.toLocaleString()}

--------------------------------------------------------------------------------
                              SAINTSAL™ ANALYSIS
--------------------------------------------------------------------------------

SIGNAL:                   ${signalData.signal}
RETURN ON INVESTMENT:     ${roi.toFixed(2)}%
PROJECTED PROFIT:         $${totalProfit.toLocaleString()}

KEY METRICS
  % of ARV:               ${percentOfArv.toFixed(1)}%
  Max Allowable Offer:    $${maxAllowableOffer.toLocaleString()}
  Equity at Purchase:     $${calculations.equityAtPurchase.toLocaleString()}
  Cash Required:          $${calculations.cashNeeded.toLocaleString()}
  Total Investment:       $${calculations.totalInvestment.toLocaleString()}
  Rehab per Sq Ft:        $${data.sqft > 0 ? (totalRehabCost / data.sqft).toFixed(2) : "0"}
  Profit per Sq Ft:       $${data.sqft > 0 ? (totalProfit / data.sqft).toFixed(2) : "0"}
  Monthly ROI:            ${data.holdingPeriodMonths > 0 ? (roi / data.holdingPeriodMonths).toFixed(2) : "0"}%

--------------------------------------------------------------------------------
                              70% RULE CHECK
--------------------------------------------------------------------------------

ARV:                      $${data.arv.toLocaleString()}
70% of ARV:               $${(data.arv * 0.7).toLocaleString()}
Less Rehab:               $${totalRehabCost.toLocaleString()}
MAX OFFER (70% Rule):     $${maxAllowableOffer.toLocaleString()}
Your Purchase Price:      $${data.purchasePrice.toLocaleString()}
${data.purchasePrice <= maxAllowableOffer ? "✓ WITHIN 70% RULE" : "⚠ EXCEEDS 70% RULE"}

================================================================================
                              NEXT STEPS
================================================================================

1. Submit this worksheet with your funding application
2. Complete the soft credit pull at: https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P
3. Upload required documents at: ${typeof window !== "undefined" ? window.location.origin : ""}/documents
4. Apply for capital at: ${typeof window !== "undefined" ? window.location.origin : ""}/apply

================================================================================
                    CONFIDENTIAL - FOR INTERNAL USE ONLY
          CookinCap | Saint Vision Group | Powered by SaintSal™ + HACP™
               438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`
  }

  const handleDownloadWorksheet = () => {
    setIsSaving(true)
    const content = generateWorksheetContent()
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `CookinCap-Deal-Worksheet-${data.address?.replace(/[^a-zA-Z0-9]/g, "-") || "analysis"}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handlePrintWorksheet = () => {
    const content = generateWorksheetContent()
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>CookinCap Deal Worksheet</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; padding: 20px; }
              @media print { body { font-size: 10px; } }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleSendWorksheet = async () => {
    setIsSending(true)
    setSendSuccess(false)

    try {
      const content = generateWorksheetContent()
      const response = await fetch("/api/submit-worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worksheetContent: content,
          propertyAddress: data.address,
          clientEmail: "", // Can be filled if user provides
          clientName: "",
          signal: signalData.signal,
          roi: roi.toFixed(2),
          profit: totalProfit,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSendSuccess(true)
        // Save locally too
        const worksheetData = {
          timestamp: new Date().toISOString(),
          data,
          calculations,
          signal: signalData.signal,
        }
        localStorage.setItem("cookincap_saved_worksheet", JSON.stringify(worksheetData))
      }
    } catch (error) {
      console.error("Failed to send worksheet:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveForApplication = () => {
    const worksheetData = {
      timestamp: new Date().toISOString(),
      data,
      calculations,
      signal: signalData.signal,
    }
    localStorage.setItem("cookincap_saved_worksheet", JSON.stringify(worksheetData))
    localStorage.setItem("cookincap-deal-worksheet", JSON.stringify(worksheetData))
    alert("Worksheet saved! It will be automatically attached when you submit your funding application.")
  }

  return (
    <div className="space-y-6">
      {/* Signal Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                SaintSal™ Preliminary Signal
              </p>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 ${signalData.bg}`}>
                <SignalIcon className={`h-6 w-6 ${signalData.color}`} />
                <span className={`text-2xl font-bold ${signalData.color}`}>{signalData.signal}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Projected ROI</p>
              <p
                className={`text-4xl font-bold ${roi >= 15 ? "text-green-500" : roi >= 0 ? "text-foreground" : "text-red-500"}`}
              >
                {roi.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-lg font-semibold text-foreground">{data.address || "No address entered"}</p>
            {data.city && (
              <p className="text-sm text-muted-foreground">
                {data.city}, {data.state} {data.zip}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="rounded bg-background px-2 py-1">{data.propertyType}</span>
              <span className="rounded bg-background px-2 py-1">
                {data.bedrooms} bed / {data.bathrooms} bath
              </span>
              <span className="rounded bg-background px-2 py-1">{data.sqft.toLocaleString()} sqft</span>
              <span className="rounded bg-background px-2 py-1">Built {data.yearBuilt}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deal Economics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">Purchase</p>
              <p className="text-xl font-bold text-foreground">${data.purchasePrice.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">Rehab</p>
              <p className="text-xl font-bold text-foreground">${totalRehabCost.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">ARV</p>
              <p className="text-xl font-bold text-foreground">${data.arv.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">Profit</p>
              <p className={`text-xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${totalProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cost breakdown table */}
          <div className="rounded-lg border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="text-sm font-medium text-foreground">${data.purchasePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Rehab Budget</span>
              <span className="text-sm font-medium text-foreground">${totalRehabCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Buying Costs</span>
              <span className="text-sm font-medium text-foreground">
                ${calculations.totalBuyingCosts.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Holding Costs ({data.holdingPeriodMonths} mo)</span>
              <span className="text-sm font-medium text-foreground">
                ${calculations.totalHoldingCosts.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Financing Costs</span>
              <span className="text-sm font-medium text-foreground">
                ${(calculations.pointsCost + calculations.totalInterest).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Selling Costs</span>
              <span className="text-sm font-medium text-foreground">
                ${calculations.totalSellingCosts.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary">
              <span className="text-sm font-semibold text-foreground">Total Investment</span>
              <span className="text-sm font-bold text-foreground">
                ${calculations.totalInvestment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5">
              <span className="text-sm font-semibold text-foreground">Cash Required</span>
              <span className="text-sm font-bold text-primary">${calculations.cashNeeded.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              {percentOfArv <= 70 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : percentOfArv <= 80 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">% of ARV</p>
                <p className="text-lg font-semibold text-foreground">{percentOfArv.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Max Offer (70% Rule)</p>
                <p className="text-lg font-semibold text-foreground">${maxAllowableOffer.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Equity at Purchase</p>
                <p className="text-lg font-semibold text-foreground">
                  ${calculations.equityAtPurchase.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions - UPDATED with Send button */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Worksheet Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              onClick={handleDownloadWorksheet}
              disabled={isSaving}
              className="gap-2 bg-transparent"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download
            </Button>
            <Button variant="outline" onClick={handlePrintWorksheet} className="gap-2 bg-transparent">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleSaveForApplication} className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Save for App
            </Button>
            <Button
              onClick={handleSendWorksheet}
              disabled={isSending}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sendSuccess ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {sendSuccess ? "Sent!" : "Send to Team"}
            </Button>
          </div>
          {sendSuccess && (
            <p className="mt-3 text-sm text-green-500">Worksheet sent to support@cookin.io and saved to GHL</p>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Complete Soft Credit Pull</p>
                <a
                  href="https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Start Credit Check →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Submit Funding Application</p>
                <Link href="/apply" className="text-sm text-primary hover:underline">
                  Apply for Capital →
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Upload Documents</p>
                <Link href="/documents" className="text-sm text-primary hover:underline">
                  Document Upload →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/apply" className="flex-1">
              <Button className="w-full gap-2 bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
                Apply for Funding
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
