"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle2,
  Building2,
  User,
  DollarSign,
  FileSignature,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad } from "@/components/signature-pad"

const STEPS = [
  { id: 1, name: "Business Info", icon: Building2 },
  { id: 2, name: "Funding Details", icon: DollarSign },
  { id: 3, name: "Owner Info", icon: User },
  { id: 4, name: "Review & Sign", icon: FileSignature },
]

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [applicationId, setApplicationId] = useState("")
  const [formData, setFormData] = useState({
    // Business Info
    businessLegalName: "",
    businessDBA: "",
    businessPhone: "",
    mobilePhone: "",
    businessFax: "",
    otherPhone: "",
    website: "",
    email: "",
    physicalAddress: "",
    physicalCity: "",
    physicalState: "",
    physicalZip: "",
    mailingAddress: "",
    mailingCity: "",
    mailingState: "",
    mailingZip: "",
    legalEntity: "",
    businessStartDate: "",
    federalTaxId: "",
    homeBasedBusiness: false,
    openJudgements: false,
    openBankruptcies: false,
    stateOfInc: "",
    businessDescription: "",
    industryType: "",
    businessRentType: "",
    monthlyRentPayment: "",
    remainingRentTerm: "",
    rentPaymentCurrent: true,
    landlordContact: "",
    landlordPhone: "",
    // Funding Info
    amountRequested: "",
    fundsNeeded: "",
    useOfFunds: "",
    grossAnnualSales: "",
    grossMonthlySales: "",
    monthlyCCVolume: "",
    currentCashAdvance: false,
    cashAdvanceBalance: "",
    ccProcessingCompany: "",
    ccAccountNumber: "",
    // Owner Info
    ownerFirstName: "",
    ownerMI: "",
    ownerLastName: "",
    ownerTitle: "",
    ownershipPercent: "",
    ownerAddress: "",
    ownerCity: "",
    ownerState: "",
    ownerZip: "",
    ownerHomePhone: "",
    ownerMobile: "",
    ownerDOB: "",
    ownerSSN: "",
    // Co-Owner Info
    hasCoOwner: false,
    coOwnerFirstName: "",
    coOwnerMI: "",
    coOwnerLastName: "",
    coOwnerTitle: "",
    coOwnershipPercent: "",
    coOwnerAddress: "",
    coOwnerCity: "",
    coOwnerState: "",
    coOwnerZip: "",
    coOwnerHomePhone: "",
    coOwnerMobile: "",
    coOwnerDOB: "",
    coOwnerSSN: "",
    // Authorization
    agreeToTerms: false,
    agreeToCreditPull: false,
    ownerSignatureData: null as string | null,
    ownerSignatureTimestamp: null as string | null,
    coOwnerSignatureData: null as string | null,
    coOwnerSignatureTimestamp: null as string | null,
  })

  const updateField = (field: string, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOwnerSignature = (signature: string | null, timestamp: string | null) => {
    setFormData((prev) => ({
      ...prev,
      ownerSignatureData: signature,
      ownerSignatureTimestamp: timestamp,
    }))
  }

  const handleCoOwnerSignature = (signature: string | null, timestamp: string | null) => {
    setFormData((prev) => ({
      ...prev,
      coOwnerSignatureData: signature,
      coOwnerSignatureTimestamp: timestamp,
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Get any saved worksheet from localStorage
      const savedWorksheet = localStorage.getItem("cookincap-deal-worksheet")
      const worksheetData = savedWorksheet ? JSON.parse(savedWorksheet) : null

      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          worksheetData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setApplicationId(result.applicationId)
        setSubmitSuccess(true)
        // Clear the saved worksheet after successful submission
        localStorage.removeItem("cookincap-deal-worksheet")
      } else {
        alert("There was an error submitting your application. Please try again or contact support@cookin.io")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("There was an error submitting your application. Please try again or contact support@cookin.io")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / 4) * 100

  const canSubmit =
    formData.agreeToTerms && formData.ownerSignatureData && (!formData.hasCoOwner || formData.coOwnerSignatureData)

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Your application has been received and sent to our team at support@cookin.io
          </p>
          <div className="bg-secondary rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Application ID</p>
            <p className="text-lg font-mono font-semibold text-primary">{applicationId}</p>
          </div>
          <div className="space-y-3 text-left bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-medium text-foreground">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Our team will review your application within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>We'll match you with the best funding options using SaintSal™</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>A funding specialist will contact you to discuss next steps</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Return Home
              </Button>
            </Link>
            <Link href="/documents" className="flex-1">
              <Button className="w-full bg-primary">Upload Documents</Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Questions? Contact us at{" "}
            <a href="mailto:support@cookin.io" className="text-primary hover:underline">
              support@cookin.io
            </a>{" "}
            or call{" "}
            <a href="tel:+19499972097" className="text-primary hover:underline">
              949-997-2097
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                C
              </div>
              <span className="text-lg font-semibold text-foreground">
                Cookin<span className="text-primary">Cap</span>
              </span>
            </Link>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-center mb-2">
              Working Capital Pre-Qualification
            </h1>
            <p className="text-center text-muted-foreground mb-6">Complete all steps to submit your application</p>

            {/* Progress Bar */}
            <div className="relative mb-8">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-4">
                {STEPS.map((step) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isComplete = currentStep > step.id
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${isComplete ? "bg-primary text-primary-foreground" : isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-secondary text-muted-foreground"}`}
                      >
                        {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span
                        className={`text-xs mt-2 ${isActive || isComplete ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {step.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="bg-secondary/50 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{STEPS[currentStep - 1].name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Step {currentStep} of 4</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {/* Step 1: Business Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="businessLegalName">Business Legal Name *</Label>
                      <Input
                        id="businessLegalName"
                        value={formData.businessLegalName}
                        onChange={(e) => updateField("businessLegalName", e.target.value)}
                        placeholder="ABC Company LLC"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessDBA">Business DBA (if applicable)</Label>
                      <Input
                        id="businessDBA"
                        value={formData.businessDBA}
                        onChange={(e) => updateField("businessDBA", e.target.value)}
                        placeholder="Doing Business As"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@company.com"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessPhone">Business Phone *</Label>
                      <Input
                        id="businessPhone"
                        value={formData.businessPhone}
                        onChange={(e) => updateField("businessPhone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobilePhone">Mobile Phone *</Label>
                      <Input
                        id="mobilePhone"
                        value={formData.mobilePhone}
                        onChange={(e) => updateField("mobilePhone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        placeholder="www.yourcompany.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Physical Address</h3>
                    <div className="grid sm:grid-cols-6 gap-4">
                      <div className="sm:col-span-6">
                        <Label htmlFor="physicalAddress">Street Address *</Label>
                        <Input
                          id="physicalAddress"
                          value={formData.physicalAddress}
                          onChange={(e) => updateField("physicalAddress", e.target.value)}
                          placeholder="123 Main Street"
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label htmlFor="physicalCity">City *</Label>
                        <Input
                          id="physicalCity"
                          value={formData.physicalCity}
                          onChange={(e) => updateField("physicalCity", e.target.value)}
                          placeholder="City"
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Label htmlFor="physicalState">State *</Label>
                        <Input
                          id="physicalState"
                          value={formData.physicalState}
                          onChange={(e) => updateField("physicalState", e.target.value)}
                          placeholder="CA"
                          className="mt-1.5"
                          maxLength={2}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="physicalZip">Zip *</Label>
                        <Input
                          id="physicalZip"
                          value={formData.physicalZip}
                          onChange={(e) => updateField("physicalZip", e.target.value)}
                          placeholder="90210"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Business Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Legal Entity *</Label>
                        <select
                          value={formData.legalEntity}
                          onChange={(e) => updateField("legalEntity", e.target.value)}
                          className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Select entity type</option>
                          <option value="corporation">Corporation</option>
                          <option value="llc">LLC</option>
                          <option value="partnership">Partnership</option>
                          <option value="lp">LP</option>
                          <option value="llp">LLP</option>
                          <option value="sole-prop">Sole Proprietorship</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="businessStartDate">Business Start Date *</Label>
                        <Input
                          id="businessStartDate"
                          type="date"
                          value={formData.businessStartDate}
                          onChange={(e) => updateField("businessStartDate", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="federalTaxId">Federal Tax ID (EIN) *</Label>
                        <Input
                          id="federalTaxId"
                          value={formData.federalTaxId}
                          onChange={(e) => updateField("federalTaxId", e.target.value)}
                          placeholder="XX-XXXXXXX"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stateOfInc">State of Incorporation *</Label>
                        <Input
                          id="stateOfInc"
                          value={formData.stateOfInc}
                          onChange={(e) => updateField("stateOfInc", e.target.value)}
                          placeholder="CA"
                          className="mt-1.5"
                          maxLength={2}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="businessDescription">Business Description *</Label>
                        <textarea
                          id="businessDescription"
                          value={formData.businessDescription}
                          onChange={(e) => updateField("businessDescription", e.target.value)}
                          placeholder="Brief description of your business activities"
                          className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="homeBasedBusiness"
                          checked={formData.homeBasedBusiness}
                          onCheckedChange={(checked) => updateField("homeBasedBusiness", !!checked)}
                        />
                        <Label htmlFor="homeBasedBusiness" className="text-sm">
                          Home Based Business?
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="openJudgements"
                          checked={formData.openJudgements}
                          onCheckedChange={(checked) => updateField("openJudgements", !!checked)}
                        />
                        <Label htmlFor="openJudgements" className="text-sm">
                          Open Judgements/Liens?
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="openBankruptcies"
                          checked={formData.openBankruptcies}
                          onCheckedChange={(checked) => updateField("openBankruptcies", !!checked)}
                        />
                        <Label htmlFor="openBankruptcies" className="text-sm">
                          Open Bankruptcies?
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Funding Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amountRequested">Amount Requested *</Label>
                      <Input
                        id="amountRequested"
                        value={formData.amountRequested}
                        onChange={(e) => updateField("amountRequested", e.target.value)}
                        placeholder="$50,000"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>When Are Funds Needed? *</Label>
                      <select
                        value={formData.fundsNeeded}
                        onChange={(e) => updateField("fundsNeeded", e.target.value)}
                        className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select timeline</option>
                        <option value="asap">ASAP</option>
                        <option value="30days">30 Days</option>
                        <option value="60days">60+ Days</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="useOfFunds">Desired Use of Funding Proceeds *</Label>
                      <textarea
                        id="useOfFunds"
                        value={formData.useOfFunds}
                        onChange={(e) => updateField("useOfFunds", e.target.value)}
                        placeholder="Working capital, equipment purchase, expansion, etc."
                        className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Revenue Information</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="grossAnnualSales">Gross Annual Sales *</Label>
                        <Input
                          id="grossAnnualSales"
                          value={formData.grossAnnualSales}
                          onChange={(e) => updateField("grossAnnualSales", e.target.value)}
                          placeholder="$500,000"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grossMonthlySales">Gross Monthly Sales *</Label>
                        <Input
                          id="grossMonthlySales"
                          value={formData.grossMonthlySales}
                          onChange={(e) => updateField("grossMonthlySales", e.target.value)}
                          placeholder="$40,000"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthlyCCVolume">Monthly Credit Card Volume</Label>
                        <Input
                          id="monthlyCCVolume"
                          value={formData.monthlyCCVolume}
                          onChange={(e) => updateField("monthlyCCVolume", e.target.value)}
                          placeholder="$15,000"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Existing Debt</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="currentCashAdvance"
                          checked={formData.currentCashAdvance}
                          onCheckedChange={(checked) => updateField("currentCashAdvance", !!checked)}
                        />
                        <Label htmlFor="currentCashAdvance" className="text-sm">
                          Current Cash Advance or Business Loan?
                        </Label>
                      </div>
                      {formData.currentCashAdvance && (
                        <div>
                          <Label htmlFor="cashAdvanceBalance">Outstanding Balance</Label>
                          <Input
                            id="cashAdvanceBalance"
                            value={formData.cashAdvanceBalance}
                            onChange={(e) => updateField("cashAdvanceBalance", e.target.value)}
                            placeholder="$25,000"
                            className="mt-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Soft Credit Pull CTA */}
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Soft Credit Check Required</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Complete your soft credit pull to expedite your application. This will NOT affect your credit
                          score.
                        </p>
                      </div>
                      <a
                        href="https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
                      >
                        <span>Get Your FICO Score</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Owner Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="ownerFirstName">First Name *</Label>
                      <Input
                        id="ownerFirstName"
                        value={formData.ownerFirstName}
                        onChange={(e) => updateField("ownerFirstName", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="ownerMI">MI</Label>
                      <Input
                        id="ownerMI"
                        value={formData.ownerMI}
                        onChange={(e) => updateField("ownerMI", e.target.value)}
                        className="mt-1.5"
                        maxLength={1}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="ownerLastName">Last Name *</Label>
                      <Input
                        id="ownerLastName"
                        value={formData.ownerLastName}
                        onChange={(e) => updateField("ownerLastName", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="ownershipPercent">% Owned *</Label>
                      <Input
                        id="ownershipPercent"
                        value={formData.ownershipPercent}
                        onChange={(e) => updateField("ownershipPercent", e.target.value)}
                        placeholder="51%"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownerTitle">Title *</Label>
                      <Input
                        id="ownerTitle"
                        value={formData.ownerTitle}
                        onChange={(e) => updateField("ownerTitle", e.target.value)}
                        placeholder="CEO, President, Owner, etc."
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownerDOB">Date of Birth *</Label>
                      <Input
                        id="ownerDOB"
                        type="date"
                        value={formData.ownerDOB}
                        onChange={(e) => updateField("ownerDOB", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownerSSN">Social Security Number *</Label>
                      <Input
                        id="ownerSSN"
                        type="password"
                        value={formData.ownerSSN}
                        onChange={(e) => updateField("ownerSSN", e.target.value)}
                        placeholder="XXX-XX-XXXX"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownerMobile">Mobile Phone *</Label>
                      <Input
                        id="ownerMobile"
                        value={formData.ownerMobile}
                        onChange={(e) => updateField("ownerMobile", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Home Address</h3>
                    <div className="grid sm:grid-cols-6 gap-4">
                      <div className="sm:col-span-6">
                        <Label htmlFor="ownerAddress">Street Address *</Label>
                        <Input
                          id="ownerAddress"
                          value={formData.ownerAddress}
                          onChange={(e) => updateField("ownerAddress", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label htmlFor="ownerCity">City *</Label>
                        <Input
                          id="ownerCity"
                          value={formData.ownerCity}
                          onChange={(e) => updateField("ownerCity", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Label htmlFor="ownerState">State *</Label>
                        <Input
                          id="ownerState"
                          value={formData.ownerState}
                          onChange={(e) => updateField("ownerState", e.target.value)}
                          className="mt-1.5"
                          maxLength={2}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="ownerZip">Zip *</Label>
                        <Input
                          id="ownerZip"
                          value={formData.ownerZip}
                          onChange={(e) => updateField("ownerZip", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Co-Owner Section */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="hasCoOwner"
                        checked={formData.hasCoOwner}
                        onCheckedChange={(checked) => updateField("hasCoOwner", !!checked)}
                      />
                      <Label htmlFor="hasCoOwner" className="text-sm font-medium">
                        Add Co-Owner/Partner (20%+ ownership)
                      </Label>
                    </div>
                    {formData.hasCoOwner && (
                      <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                        <div className="grid sm:grid-cols-6 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="coOwnerFirstName">First Name *</Label>
                            <Input
                              id="coOwnerFirstName"
                              value={formData.coOwnerFirstName}
                              onChange={(e) => updateField("coOwnerFirstName", e.target.value)}
                              className="mt-1.5"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <Label htmlFor="coOwnerMI">MI</Label>
                            <Input
                              id="coOwnerMI"
                              value={formData.coOwnerMI}
                              onChange={(e) => updateField("coOwnerMI", e.target.value)}
                              className="mt-1.5"
                              maxLength={1}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="coOwnerLastName">Last Name *</Label>
                            <Input
                              id="coOwnerLastName"
                              value={formData.coOwnerLastName}
                              onChange={(e) => updateField("coOwnerLastName", e.target.value)}
                              className="mt-1.5"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <Label htmlFor="coOwnershipPercent">% Owned *</Label>
                            <Input
                              id="coOwnershipPercent"
                              value={formData.coOwnershipPercent}
                              onChange={(e) => updateField("coOwnershipPercent", e.target.value)}
                              placeholder="49%"
                              className="mt-1.5"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <Label htmlFor="coOwnerTitle">Title *</Label>
                            <Input
                              id="coOwnerTitle"
                              value={formData.coOwnerTitle}
                              onChange={(e) => updateField("coOwnerTitle", e.target.value)}
                              className="mt-1.5"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <Label htmlFor="coOwnerDOB">Date of Birth *</Label>
                            <Input
                              id="coOwnerDOB"
                              type="date"
                              value={formData.coOwnerDOB}
                              onChange={(e) => updateField("coOwnerDOB", e.target.value)}
                              className="mt-1.5"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <Label htmlFor="coOwnerSSN">Social Security Number *</Label>
                            <Input
                              id="coOwnerSSN"
                              type="password"
                              value={formData.coOwnerSSN}
                              onChange={(e) => updateField("coOwnerSSN", e.target.value)}
                              placeholder="XXX-XX-XXXX"
                              className="mt-1.5"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <Label htmlFor="coOwnerMobile">Mobile Phone *</Label>
                            <Input
                              id="coOwnerMobile"
                              value={formData.coOwnerMobile}
                              onChange={(e) => updateField("coOwnerMobile", e.target.value)}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Sign */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="rounded-lg bg-secondary/30 p-4">
                      <h3 className="font-medium text-foreground mb-3">Business Summary</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Business Name</dt>
                          <dd className="text-foreground font-medium">{formData.businessLegalName || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Entity Type</dt>
                          <dd className="text-foreground font-medium">{formData.legalEntity || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Annual Revenue</dt>
                          <dd className="text-foreground font-medium">{formData.grossAnnualSales || "—"}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-4">
                      <h3 className="font-medium text-foreground mb-3">Funding Request</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Amount Requested</dt>
                          <dd className="text-primary font-semibold">{formData.amountRequested || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Timeline</dt>
                          <dd className="text-foreground font-medium">{formData.fundsNeeded || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Primary Owner</dt>
                          <dd className="text-foreground font-medium">
                            {formData.ownerFirstName} {formData.ownerLastName}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Disclosures */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Authorization & Disclosures</h3>
                    <div className="rounded-lg bg-secondary/30 p-4 max-h-48 overflow-y-auto text-xs text-muted-foreground space-y-3">
                      <p>
                        By signing below, I/we authorize Saint Vision Group LLC and its affiliates, partners, and
                        assigns ("Company") to: (1) obtain consumer credit reports and business credit reports on the
                        undersigned and the Business; (2) verify information provided in this application; (3) share
                        information with potential lenders and funding sources for the purpose of obtaining financing.
                      </p>
                      <p>
                        I/we certify that all information provided is true and correct. I/we understand that any
                        misrepresentation may result in denial of this application and/or civil or criminal penalties.
                        I/we authorize the Company to contact me/us via phone, email, or text message regarding this
                        application and related services.
                      </p>
                      <p>
                        This authorization shall remain in effect until revoked in writing. I/we understand that the
                        Company acts as a broker and does not directly fund loans. Terms, rates, and approval are
                        subject to lender requirements and underwriting criteria.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => updateField("agreeToTerms", !!checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                        I have read and agree to the terms and conditions above, and certify that all information
                        provided is accurate and complete. I authorize Saint Vision Group LLC to obtain my credit report
                        for the purpose of evaluating this application. *
                      </Label>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Electronic Signature</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Use your mouse, finger, or stylus to sign below. Your signature will be timestamped and legally
                      binding.
                    </p>

                    <div className="space-y-6">
                      <SignaturePad label="Owner Signature" required={true} onSignatureChange={handleOwnerSignature} />

                      {formData.hasCoOwner && (
                        <SignaturePad
                          label="Co-Owner Signature"
                          required={true}
                          onSignatureChange={handleCoOwnerSignature}
                        />
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Soft Credit Check (Recommended)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          We will request your credit report as part of the funding process. You can complete a soft
                          credit check now to speed up your approval. This does <strong>NOT</strong> affect your credit
                          score.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Note: A credit report will be required before final funding approval.
                        </p>
                      </div>
                      <a
                        href="https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors shrink-0"
                      >
                        <span>Get My Score</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="bg-secondary/30 px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Your data is encrypted and secure</span>
                </div>
                {currentStep < 4 ? (
                  <Button onClick={nextStep} className="gap-2 bg-primary hover:bg-primary/90">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>NMLS Licensed</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>No Hard Credit Pull</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Saint Vision Group</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
