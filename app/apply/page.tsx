"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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

const CREDIT_PULL_URL = "https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"

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
          <p className="text-muted-foreground mb-6">Your application has been received and sent to our team.</p>
          <div className="bg-secondary rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Application ID</p>
            <p className="text-lg font-mono font-semibold text-primary">{applicationId}</p>
          </div>

          {/* Credit Pull CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Speed Up Your Approval</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Pull your FICO credit report now to expedite your application review.
            </p>
            <a
              href="https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-primary hover:bg-primary/90">
                <CreditCard className="mr-2 h-4 w-4" />
                Get Your FICO Score
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </a>
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
                <span>{"We'll match you with the best funding options using SaintSal™"}</span>
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
            <Link href="/app/analyzer" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Analyze Another Deal
              </Button>
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/cookincap-logo.png" alt="CookinCap" width={40} height={40} className="rounded-lg" />
              <span className="text-lg font-semibold text-foreground">CookinCap</span>
            </Link>
            <Link
              href={CREDIT_PULL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pull Credit</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-center mb-2">
              Working Capital Application
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
                          placeholder="Describe your business and what you do..."
                          className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                        />
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
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="amountRequested"
                          value={formData.amountRequested}
                          onChange={(e) => updateField("amountRequested", e.target.value)}
                          placeholder="250,000"
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>When Do You Need Funds? *</Label>
                      <select
                        value={formData.fundsNeeded}
                        onChange={(e) => updateField("fundsNeeded", e.target.value)}
                        className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select timeframe</option>
                        <option value="immediate">Immediately</option>
                        <option value="1-2-weeks">1-2 Weeks</option>
                        <option value="1-month">Within 1 Month</option>
                        <option value="2-3-months">2-3 Months</option>
                        <option value="just-exploring">Just Exploring</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="useOfFunds">Use of Funds *</Label>
                      <textarea
                        id="useOfFunds"
                        value={formData.useOfFunds}
                        onChange={(e) => updateField("useOfFunds", e.target.value)}
                        placeholder="What will you use the funds for? (e.g., property acquisition, rehab costs, working capital...)"
                        className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Financial Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grossAnnualSales">Gross Annual Sales *</Label>
                        <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="grossAnnualSales"
                            value={formData.grossAnnualSales}
                            onChange={(e) => updateField("grossAnnualSales", e.target.value)}
                            placeholder="500,000"
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="grossMonthlySales">Gross Monthly Sales *</Label>
                        <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="grossMonthlySales"
                            value={formData.grossMonthlySales}
                            onChange={(e) => updateField("grossMonthlySales", e.target.value)}
                            placeholder="40,000"
                            className="pl-7"
                          />
                        </div>
                      </div>
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
                        placeholder="John"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="ownerMI">M.I.</Label>
                      <Input
                        id="ownerMI"
                        value={formData.ownerMI}
                        onChange={(e) => updateField("ownerMI", e.target.value)}
                        placeholder="A"
                        className="mt-1.5"
                        maxLength={1}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownerLastName">Last Name *</Label>
                      <Input
                        id="ownerLastName"
                        value={formData.ownerLastName}
                        onChange={(e) => updateField("ownerLastName", e.target.value)}
                        placeholder="Smith"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownerTitle">Title *</Label>
                      <Input
                        id="ownerTitle"
                        value={formData.ownerTitle}
                        onChange={(e) => updateField("ownerTitle", e.target.value)}
                        placeholder="CEO / Owner"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="ownershipPercent">Ownership % *</Label>
                      <Input
                        id="ownershipPercent"
                        value={formData.ownershipPercent}
                        onChange={(e) => updateField("ownershipPercent", e.target.value)}
                        placeholder="100"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Contact & Personal Info</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ownerMobile">Mobile Phone *</Label>
                        <Input
                          id="ownerMobile"
                          value={formData.ownerMobile}
                          onChange={(e) => updateField("ownerMobile", e.target.value)}
                          placeholder="(555) 123-4567"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ownerDOB">Date of Birth *</Label>
                        <Input
                          id="ownerDOB"
                          type="date"
                          value={formData.ownerDOB}
                          onChange={(e) => updateField("ownerDOB", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="ownerSSN">Social Security Number *</Label>
                        <Input
                          id="ownerSSN"
                          value={formData.ownerSSN}
                          onChange={(e) => updateField("ownerSSN", e.target.value)}
                          placeholder="XXX-XX-XXXX"
                          className="mt-1.5"
                          type="password"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your SSN is encrypted and secure</p>
                      </div>
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
                          placeholder="456 Oak Avenue"
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label htmlFor="ownerCity">City *</Label>
                        <Input
                          id="ownerCity"
                          value={formData.ownerCity}
                          onChange={(e) => updateField("ownerCity", e.target.value)}
                          placeholder="City"
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Label htmlFor="ownerState">State *</Label>
                        <Input
                          id="ownerState"
                          value={formData.ownerState}
                          onChange={(e) => updateField("ownerState", e.target.value)}
                          placeholder="CA"
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
                          placeholder="90210"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Co-Owner Toggle */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasCoOwner"
                        checked={formData.hasCoOwner}
                        onCheckedChange={(checked) => updateField("hasCoOwner", checked as boolean)}
                      />
                      <Label htmlFor="hasCoOwner" className="cursor-pointer">
                        Add a Co-Owner / Guarantor
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Sign */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
                    <h3 className="font-medium text-foreground">Application Summary</h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Business:</span>{" "}
                        <span className="text-foreground">{formData.businessLegalName || "Not provided"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>{" "}
                        <span className="text-foreground text-primary font-semibold">
                          ${Number(formData.amountRequested || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Owner:</span>{" "}
                        <span className="text-foreground">
                          {formData.ownerFirstName} {formData.ownerLastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="text-foreground">{formData.email || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => updateField("agreeToTerms", checked as boolean)}
                        className="mt-1"
                      />
                      <Label
                        htmlFor="agreeToTerms"
                        className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                      >
                        I certify that all information provided is true and accurate. I authorize CookinCap and its
                        lending partners to verify my business and personal information for the purpose of this
                        application.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToCreditPull"
                        checked={formData.agreeToCreditPull}
                        onCheckedChange={(checked) => updateField("agreeToCreditPull", checked as boolean)}
                        className="mt-1"
                      />
                      <Label
                        htmlFor="agreeToCreditPull"
                        className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                      >
                        I authorize CookinCap to obtain my credit report for the purpose of evaluating my application.
                      </Label>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="border-t border-border pt-6">
                    <SignaturePad onSignatureChange={handleOwnerSignature} label="Owner Signature" required />
                  </div>

                  {/* Co-Owner Signature if applicable */}
                  {formData.hasCoOwner && (
                    <div className="border-t border-border pt-6">
                      <SignaturePad onSignatureChange={handleCoOwnerSignature} label="Co-Owner Signature" required />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-between">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Your information is encrypted and secure</span>
          </div>
        </div>
      </main>
    </div>
  )
}
