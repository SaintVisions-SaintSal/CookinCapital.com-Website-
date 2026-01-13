"use client"

import { useState, useEffect, useMemo } from "react"
import { AnalyzerStepper } from "./analyzer-stepper"
import { AnalyzerHeader } from "./analyzer-header"
import { AnalyzerPropertyInfo } from "./analyzer-property-info"
import { AnalyzerPricing } from "./analyzer-pricing"
import { AnalyzerRehab } from "./analyzer-rehab"
import { AnalyzerFinancing } from "./analyzer-financing"
import { AnalyzerHoldingCosts } from "./analyzer-holding-costs"
import { AnalyzerBuyingCosts } from "./analyzer-buying-costs"
import { AnalyzerSellingCosts } from "./analyzer-selling-costs"
import { AnalyzerReview } from "./analyzer-review"
import { AnalyzerResultsPanel } from "./analyzer-results-panel"
import { Save, Loader2, Check, Download, Sparkles } from "lucide-react"
import type { DealData, Calculations } from "./types"

const initialDealData: DealData = {
  address: "",
  city: "",
  state: "",
  zip: "",
  propertyType: "single-family",
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  yearBuilt: 1990,
  lotSize: 0.25,
  askingPrice: 0,
  arv: 0,
  purchasePrice: 0,
  rehabBudget: 0,
  rehabCategories: {
    demolition: 0,
    foundation: 0,
    roofing: 0,
    siding: 0,
    windows: 0,
    doors: 0,
    garage: 0,
    electrical: 0,
    plumbing: 0,
    hvac: 0,
    insulation: 0,
    drywall: 0,
    painting: 0,
    flooring: 0,
    kitchenCabinets: 0,
    kitchenCountertops: 0,
    kitchenAppliances: 0,
    kitchenFixtures: 0,
    bathroomVanities: 0,
    bathroomTileShower: 0,
    bathroomFixtures: 0,
    bathroomToilets: 0,
    interior: 0,
    landscaping: 0,
    concrete: 0,
    decksPatios: 0,
    fencing: 0,
    permits: 0,
    dumpsters: 0,
    cleaning: 0,
    staging: 0,
    generalContractor: 0,
    contingency: 0,
    miscellaneous: 0,
  },
  customRehabItems: [],
  financingType: "hard-money",
  loanAmount: 0,
  interestRate: 12,
  loanTermMonths: 12,
  loanPoints: 2,
  rehabFinanced: false,
  rehabLoanAmount: 0,
  drawSchedule: "monthly",
  monthlyTaxes: 0,
  monthlyInsurance: 0,
  monthlyUtilities: 200,
  monthlyHOA: 0,
  holdingPeriodMonths: 6,
  lawnCare: 0,
  security: 0,
  propertyManagement: 0,
  closingCostsBuying: 0,
  inspectionCosts: 500,
  appraisalCosts: 500,
  titleInsuranceBuying: 0,
  otherBuyingCosts: 0,
  surveyFee: 0,
  attorneyFees: 0,
  recordingFees: 0,
  escrowFees: 0,
  agentCommissionPercent: 6,
  closingCostsSelling: 0,
  titleInsuranceSelling: 0,
  transferTaxes: 0,
  otherSellingCosts: 0,
  homeWarranty: 0,
  concessions: 0,
  stagingCost: 0,
  photographyMarketing: 0,
}

const steps = [
  { id: "property", label: "Property Info", description: "Basic property details" },
  { id: "pricing", label: "Values & Pricing", description: "Purchase and ARV" },
  { id: "rehab", label: "Rehab Budget", description: "Detailed renovation costs" },
  { id: "financing", label: "Financing", description: "Loan structure" },
  { id: "holding", label: "Holding Costs", description: "Monthly expenses" },
  { id: "buying", label: "Buying Costs", description: "Acquisition fees" },
  { id: "selling", label: "Selling Costs", description: "Exit fees" },
  { id: "review", label: "Review", description: "Final analysis" },
]

export function DealAnalyzer() {
  const [currentStep, setCurrentStep] = useState(0)
  const [dealData, setDealData] = useState<DealData>(initialDealData)
  const [hasSavedWorksheet, setHasSavedWorksheet] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const calculations: Calculations = useMemo(() => {
    const d = dealData

    // Total Rehab Cost
    const totalRehabCost = Object.values(d.rehabCategories).reduce((sum, val) => sum + (val || 0), 0)

    // Financing calculations
    const pointsCost = (d.loanAmount * d.loanPoints) / 100
    const monthlyInterestRate = d.interestRate / 100 / 12
    const totalInterest = d.loanAmount * monthlyInterestRate * d.loanTermMonths

    // Holding costs
    const monthlyHolding =
      d.monthlyTaxes +
      d.monthlyInsurance +
      d.monthlyUtilities +
      d.monthlyHOA +
      d.lawnCare +
      d.security +
      d.propertyManagement
    const totalHoldingCosts = monthlyHolding * d.holdingPeriodMonths

    // Buying costs
    const totalBuyingCosts =
      d.closingCostsBuying +
      d.inspectionCosts +
      d.appraisalCosts +
      d.titleInsuranceBuying +
      d.surveyFee +
      d.attorneyFees +
      d.recordingFees +
      d.escrowFees +
      d.otherBuyingCosts

    // Selling costs
    const agentCommission = (d.arv * d.agentCommissionPercent) / 100
    const totalSellingCosts =
      agentCommission +
      d.closingCostsSelling +
      d.titleInsuranceSelling +
      d.transferTaxes +
      d.homeWarranty +
      d.concessions +
      d.stagingCost +
      d.photographyMarketing +
      d.otherSellingCosts

    // Total investment
    const totalInvestment =
      d.purchasePrice + totalRehabCost + totalBuyingCosts + totalHoldingCosts + pointsCost + totalInterest

    // Profit calculations
    const totalProfit = d.arv - totalInvestment - totalSellingCosts
    const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

    // Additional metrics
    const percentOfArv = d.arv > 0 ? (d.purchasePrice / d.arv) * 100 : 0
    const maxAllowableOffer = d.arv * 0.7 - totalRehabCost
    const equityAtPurchase = d.arv - d.purchasePrice - totalRehabCost
    const cashNeeded = d.purchasePrice + totalRehabCost + totalBuyingCosts - d.loanAmount
    const arvPerSqft = d.sqft > 0 ? d.arv / d.sqft : 0
    const costPerSqft = d.sqft > 0 ? (d.purchasePrice + totalRehabCost) / d.sqft : 0
    const profitPerSqft = d.sqft > 0 ? totalProfit / d.sqft : 0

    return {
      totalRehabCost,
      pointsCost,
      totalInterest,
      monthlyHolding,
      totalHoldingCosts,
      totalBuyingCosts,
      totalSellingCosts,
      totalInvestment,
      totalProfit,
      roi,
      percentOfArv,
      maxAllowableOffer,
      equityAtPurchase,
      cashNeeded,
      arvPerSqft,
      costPerSqft,
      profitPerSqft,
    }
  }, [dealData])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cookincap_saved_worksheet")
      setHasSavedWorksheet(!!saved)
    }
  }, [])

  const updateDealData = (updates: Partial<DealData>) => {
    setDealData((prev) => ({ ...prev, ...updates }))
  }

  const confirmClear = () => {
    setDealData({ ...initialDealData })
    setCurrentStep(0)
    if (typeof window !== "undefined") {
      localStorage.removeItem("cookincap_saved_worksheet")
    }
    setHasSavedWorksheet(false)
    setShowClearConfirm(false)
    setSaved(false)
    setSubmitted(false)
  }

  const handleLoadSaved = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cookincap_saved_worksheet")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.dealData) {
            setDealData(parsed.dealData)
            setCurrentStep(7)
          }
        } catch (e) {
          console.error("Failed to load saved worksheet")
        }
      }
    }
  }

  const handleSaveToDevice = () => {
    setSaving(true)
    const worksheetData = { dealData, savedAt: new Date().toISOString() }
    if (typeof window !== "undefined") {
      localStorage.setItem("cookincap_saved_worksheet", JSON.stringify(worksheetData))
      setHasSavedWorksheet(true)
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSaving(false)
    }, 2000)
  }

  const handleDownloadWorksheet = () => {
    const d = dealData
    const totalRehab = Object.values(d.rehabCategories).reduce((sum, val) => sum + (val || 0), 0)
    const totalHolding =
      (d.monthlyTaxes + d.monthlyInsurance + d.monthlyUtilities + d.monthlyHOA) * d.holdingPeriodMonths
    const totalInvestment = d.purchasePrice + totalRehab + d.closingCostsBuying + totalHolding
    const totalProfit = d.arv - totalInvestment - d.closingCostsSelling
    const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(1) : "0"
    const arvPerSqft = d.sqft > 0 ? (d.arv / d.sqft).toFixed(2) : "0"
    const costPerSqft = d.sqft > 0 ? ((d.purchasePrice + totalRehab) / d.sqft).toFixed(2) : "0"
    const profitPerSqft = d.sqft > 0 ? (totalProfit / d.sqft).toFixed(2) : "0"
    const percentOfArv = d.arv > 0 ? ((d.purchasePrice / d.arv) * 100).toFixed(1) : "0"
    const mao = d.arv > 0 ? (d.arv * 0.7 - totalRehab).toLocaleString() : "0"
    const timestamp = new Date().toISOString().split("T")[0]

    const content = `================================================================================
                    COOKINCAP™ DEAL WORKSHEET
================================================================================
Generated: ${new Date().toLocaleString()}
Powered by SaintSal™ AI + HACP™

================================================================================
                         PROPERTY INFORMATION
================================================================================

Address................: ${d.address}
City...................: ${d.city}
State..................: ${d.state}
ZIP....................: ${d.zip}
Property Type..........: ${d.propertyType}
Bedrooms...............: ${d.bedrooms}
Bathrooms..............: ${d.bathrooms}
Square Feet............: ${d.sqft?.toLocaleString()} sq ft
Year Built.............: ${d.yearBuilt}
Lot Size...............: ${d.lotSize} acres

================================================================================
                         FINANCIAL SUMMARY
================================================================================

PURCHASE & VALUE
Purchase Price.........: $${d.purchasePrice?.toLocaleString()}
After Repair Value.....: $${d.arv?.toLocaleString()}
Equity at Purchase.....: $${(d.arv - d.purchasePrice - totalRehab).toLocaleString()}
% of ARV...............: ${percentOfArv}%
70% Rule MAO...........: $${mao}

COSTS
Total Rehab Cost.......: $${totalRehab.toLocaleString()}
Total Buying Costs.....: $${d.closingCostsBuying?.toLocaleString()}
Total Holding Costs....: $${totalHolding.toLocaleString()}
Total Selling Costs....: $${d.closingCostsSelling?.toLocaleString()}

INVESTMENT SUMMARY
Total Investment.......: $${totalInvestment.toLocaleString()}
Total Profit...........: $${totalProfit.toLocaleString()}
ROI....................: ${roi}%

================================================================================
                         PER SQUARE FOOT ANALYSIS
================================================================================

ARV per Sq Ft..........: $${arvPerSqft}
Cost per Sq Ft.........: $${costPerSqft}
Profit per Sq Ft.......: $${profitPerSqft}

================================================================================
                         FINANCING DETAILS
================================================================================

Financing Type.........: ${d.financingType}
Loan Amount............: $${d.loanAmount?.toLocaleString()}
Interest Rate..........: ${d.interestRate}%
Loan Term..............: ${d.loanTermMonths} months
Points.................: ${d.loanPoints}%
Holding Period.........: ${d.holdingPeriodMonths} months

================================================================================
                    Powered by CookinCap™ + SaintSal™
                         www.cookincap.com
================================================================================`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `CookinCap-Deal-${d.address.replace(/[^a-zA-Z0-9]/g, "-")}-${timestamp}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmitToTeam = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/submit-worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealData, calculations }),
      })
      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        throw new Error("Failed to submit")
      }
    } catch (error) {
      console.error("Error submitting worksheet:", error)
      alert("Failed to submit. Please try again.")
    }
    setSubmitting(false)
  }

  const handleSaveToLibrary = async () => {
    setSaving(true)
    try {
      const totalRehab = Object.values(dealData.rehabCategories).reduce((sum, val) => sum + (val || 0), 0)
      const totalHolding =
        (dealData.monthlyTaxes + dealData.monthlyInsurance + dealData.monthlyUtilities + dealData.monthlyHOA) *
        dealData.holdingPeriodMonths
      const totalInvestment = dealData.purchasePrice + totalRehab + dealData.closingCostsBuying + totalHolding
      const totalProfit = dealData.arv - totalInvestment - dealData.closingCostsSelling
      const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0
      const cashOnCash = dealData.loanAmount > 0 ? (totalProfit / dealData.loanAmount) * 100 : 0

      const response = await fetch("/api/user-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_name: `${dealData.address || "Untitled Deal"}`,
          property_address: `${dealData.address}, ${dealData.city}, ${dealData.state} ${dealData.zip}`,
          property_type: dealData.propertyType,
          purchase_price: dealData.purchasePrice,
          arv: dealData.arv,
          rehab_cost: totalRehab,
          loan_amount: dealData.loanAmount,
          interest_rate: dealData.interestRate,
          loan_term: dealData.loanTermMonths,
          holding_months: dealData.holdingPeriodMonths,
          closing_costs: dealData.closingCostsBuying,
          monthly_taxes: dealData.monthlyTaxes,
          monthly_insurance: dealData.monthlyInsurance,
          monthly_utilities: dealData.monthlyUtilities,
          selling_costs_percent: dealData.agentCommissionPercent,
          total_profit: totalProfit,
          roi: roi,
          cash_on_cash: cashOnCash,
          deal_data: dealData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save deal")
      }

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setSaving(false)
      }, 2000)
    } catch (error) {
      console.error("Error saving deal:", error)
      const localDeals = localStorage.getItem("cookincap_deals")
      const deals = localDeals ? JSON.parse(localDeals) : []
      const totalRehab = Object.values(dealData.rehabCategories).reduce((sum, val) => sum + (val || 0), 0)
      const totalHolding =
        (dealData.monthlyTaxes + dealData.monthlyInsurance + dealData.monthlyUtilities + dealData.monthlyHOA) *
        dealData.holdingPeriodMonths
      const totalInvestment = dealData.purchasePrice + totalRehab + dealData.closingCostsBuying + totalHolding
      const totalProfit = dealData.arv - totalInvestment - dealData.closingCostsSelling
      const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

      const newDeal = {
        id: Date.now().toString(),
        deal_name: `${dealData.address || "Untitled Deal"}`,
        property_address: `${dealData.address}, ${dealData.city}, ${dealData.state} ${dealData.zip}`,
        property_type: dealData.propertyType,
        purchase_price: dealData.purchasePrice,
        arv: dealData.arv,
        rehab_cost: totalRehab,
        loan_amount: dealData.loanAmount,
        total_profit: totalProfit,
        roi: roi,
        created_at: new Date().toISOString(),
        deal_data: dealData,
      }
      deals.push(newDeal)
      localStorage.setItem("cookincap_deals", JSON.stringify(deals))

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setSaving(false)
      }, 2000)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AnalyzerPropertyInfo data={dealData} onChange={updateDealData} />
      case 1:
        return <AnalyzerPricing data={dealData} onChange={updateDealData} />
      case 2:
        return <AnalyzerRehab data={dealData} onChange={updateDealData} calculations={calculations} />
      case 3:
        return <AnalyzerFinancing data={dealData} onChange={updateDealData} calculations={calculations} />
      case 4:
        return <AnalyzerHoldingCosts data={dealData} onChange={updateDealData} />
      case 5:
        return <AnalyzerBuyingCosts data={dealData} onChange={updateDealData} />
      case 6:
        return <AnalyzerSellingCosts data={dealData} onChange={updateDealData} />
      case 7:
        return <AnalyzerReview data={dealData} calculations={calculations} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">Clear All Data?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will reset the entire deal analyzer. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Clear & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <AnalyzerHeader />
          <div className="flex items-center gap-3">
            {hasSavedWorksheet && (
              <button
                onClick={handleLoadSaved}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                Load Saved
              </button>
            )}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <AnalyzerStepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

          <div className="flex-1">
            {renderStep()}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="rounded-lg px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Continue
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Save to Library */}
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={saving || saved}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saved ? "Saved!" : "Save Deal"}
                  </button>

                  {/* Download Worksheet */}
                  <button
                    onClick={handleDownloadWorksheet}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>

                  {/* Submit for Capital - Main CTA */}
                  <button
                    onClick={handleSubmitToTeam}
                    disabled={submitting || submitted}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : submitted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {submitted ? "Submitted!" : "Submit for Capital"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentStep === 7 && <AnalyzerResultsPanel data={dealData} calculations={calculations} />}
    </div>
  )
}
