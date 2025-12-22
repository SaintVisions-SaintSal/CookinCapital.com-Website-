"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad } from "@/components/signature-pad"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, DollarSign, User, FileText, Lock, Loader2 } from "lucide-react"

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Investment Details", icon: DollarSign },
  { id: 3, name: "Accreditation", icon: Shield },
  { id: 4, name: "Review & Sign", icon: FileText },
]

const investmentTiers = [
  { value: "25000-50000", label: "$25,000 - $50,000", rate: "9%" },
  { value: "50001-250000", label: "$50,001 - $250,000", rate: "10%" },
  { value: "250001+", label: "$250,001+", rate: "12%" },
]

const accreditationOptions = [
  { value: "income", label: "Annual income exceeds $200,000 (or $300,000 joint with spouse)" },
  { value: "net_worth", label: "Net worth exceeds $1,000,000 (excluding primary residence)" },
  { value: "entity", label: "Entity with $5,000,000+ in assets" },
  { value: "professional", label: "Licensed Series 7, 65, or 82 holder" },
]

export function InvestorIntakeForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState("")

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    dateOfBirth: "",
    ssn: "",

    // Investment Details
    investmentTier: "",
    investmentAmount: "",
    investmentSource: "",
    investmentGoals: "",
    investmentTimeline: "",
    accountType: "",
    referralSource: "",

    // Accreditation
    accreditationType: "",
    employerName: "",
    occupation: "",
    annualIncome: "",
    liquidNetWorth: "",
    totalNetWorth: "",
    investmentExperience: "",
    riskTolerance: "",

    // Agreements
    agreePPM: false,
    agreeRisk: false,
    agreeAccredited: false,
    agreeElectronicSignature: false,

    // Signatures
    investorSignature: null as string | null,
    investorSignatureTimestamp: null as string | null,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/submit-investor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setApplicationId(result.applicationId)
        setIsSubmitted(true)
      } else {
        alert("There was an error submitting your application. Please try again.")
      }
    } catch (error) {
      alert("There was an error submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedTierRate = () => {
    const tier = investmentTiers.find((t) => t.value === formData.investmentTier)
    return tier?.rate || ""
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone
      case 2:
        return formData.investmentTier && formData.investmentAmount
      case 3:
        return formData.accreditationType
      case 4:
        return (
          formData.agreePPM &&
          formData.agreeRisk &&
          formData.agreeAccredited &&
          formData.agreeElectronicSignature &&
          formData.investorSignature
        )
      default:
        return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your interest in CookinCapital Fund I. Our investor relations team will review your
            application and contact you within 1-2 business days.
          </p>
          <div className="rounded-lg bg-secondary/50 p-4 mb-8">
            <div className="text-sm text-muted-foreground">Application ID</div>
            <div className="text-lg font-mono font-semibold text-foreground">{applicationId}</div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Next Steps:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-2 max-w-xs mx-auto">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                You will receive a confirmation email shortly
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                Our team will verify your accreditation
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                You will receive the PPM for review
              </li>
            </ul>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/invest">
              <Button variant="outline" className="bg-transparent">
                Back to Fund Overview
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/invest"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Fund Overview</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" />
            256-bit SSL Encrypted
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep >= step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="mt-2 text-xs font-medium text-muted-foreground hidden sm:block">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-12 sm:w-24 lg:w-32 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Personal Information</h1>
              <p className="mt-2 text-muted-foreground">Let's start with your basic contact details</p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    placeholder="Los Angeles"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    placeholder="CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => updateFormData("zip", e.target.value)}
                    placeholder="90210"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN (Last 4 digits)</Label>
                  <Input
                    id="ssn"
                    value={formData.ssn}
                    onChange={(e) => updateFormData("ssn", e.target.value)}
                    placeholder="XXXX"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Investment Details */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <DollarSign className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Investment Details</h1>
              <p className="mt-2 text-muted-foreground">Tell us about your investment preferences</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Investment Tier *</Label>
                <div className="grid gap-3">
                  {investmentTiers.map((tier) => (
                    <label
                      key={tier.value}
                      className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                        formData.investmentTier === tier.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="investmentTier"
                          value={tier.value}
                          checked={formData.investmentTier === tier.value}
                          onChange={(e) => updateFormData("investmentTier", e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            formData.investmentTier === tier.value ? "border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {formData.investmentTier === tier.value && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{tier.label}</span>
                      </div>
                      <span className="text-xl font-bold text-primary">{tier.rate}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentAmount">Specific Investment Amount *</Label>
                <Input
                  id="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={(e) => updateFormData("investmentAmount", e.target.value)}
                  placeholder="$50,000"
                />
                {getSelectedTierRate() && (
                  <p className="text-sm text-primary">Your projected annual return: {getSelectedTierRate()}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={formData.accountType} onValueChange={(value) => updateFormData("accountType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="joint">Joint Account</SelectItem>
                    <SelectItem value="ira">Traditional IRA</SelectItem>
                    <SelectItem value="roth_ira">Roth IRA</SelectItem>
                    <SelectItem value="401k">401(k) Rollover</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="entity">Entity (LLC/Corp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentSource">Source of Funds</Label>
                <Select
                  value={formData.investmentSource}
                  onValueChange={(value) => updateFormData("investmentSource", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source of funds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Personal Savings</SelectItem>
                    <SelectItem value="investments">Investment Proceeds</SelectItem>
                    <SelectItem value="retirement">Retirement Account</SelectItem>
                    <SelectItem value="inheritance">Inheritance</SelectItem>
                    <SelectItem value="business">Business Income</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentGoals">Investment Goals</Label>
                <Textarea
                  id="investmentGoals"
                  value={formData.investmentGoals}
                  onChange={(e) => updateFormData("investmentGoals", e.target.value)}
                  placeholder="Describe your investment goals and what you hope to achieve..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralSource">How did you hear about us?</Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => updateFormData("referralSource", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">CookinCap Website</SelectItem>
                    <SelectItem value="referral">Personal Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="event">Event/Conference</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Accreditation */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Accreditation Verification</h1>
              <p className="mt-2 text-muted-foreground">Verify your accredited investor status</p>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Accredited Investor Requirement:</strong> This offering is available
                only to accredited investors as defined under SEC Regulation D, Rule 506(c).
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Accreditation Basis *</Label>
                <div className="space-y-3">
                  {accreditationOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        formData.accreditationType === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accreditationType"
                        value={option.value}
                        checked={formData.accreditationType === option.value}
                        onChange={(e) => updateFormData("accreditationType", e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.accreditationType === option.value ? "border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {formData.accreditationType === option.value && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer/Company Name</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => updateFormData("employerName", e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation/Title</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => updateFormData("occupation", e.target.value)}
                    placeholder="Your Title"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Select
                    value={formData.annualIncome}
                    onValueChange={(value) => updateFormData("annualIncome", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="200-300k">$200,000 - $300,000</SelectItem>
                      <SelectItem value="300-500k">$300,000 - $500,000</SelectItem>
                      <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="1m+">$1,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalNetWorth">Total Net Worth (excl. residence)</Label>
                  <Select
                    value={formData.totalNetWorth}
                    onValueChange={(value) => updateFormData("totalNetWorth", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2m">$1,000,000 - $2,000,000</SelectItem>
                      <SelectItem value="2-5m">$2,000,000 - $5,000,000</SelectItem>
                      <SelectItem value="5-10m">$5,000,000 - $10,000,000</SelectItem>
                      <SelectItem value="10m+">$10,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="investmentExperience">Investment Experience</Label>
                  <Select
                    value={formData.investmentExperience}
                    onValueChange={(value) => updateFormData("investmentExperience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novice">Novice (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                      <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                      <SelectItem value="sophisticated">Sophisticated (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    value={formData.riskTolerance}
                    onValueChange={(value) => updateFormData("riskTolerance", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Sign */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Review & Sign</h1>
              <p className="mt-2 text-muted-foreground">Review your information and sign to submit</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Info
                </h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>{formData.email}</p>
                  <p>{formData.phone}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Investment
                </h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="text-lg font-semibold text-foreground">
                    {formData.investmentAmount || "Amount not specified"}
                  </p>
                  <p className="text-primary font-medium">Return Rate: {getSelectedTierRate()}</p>
                  <p>Account: {formData.accountType || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Disclosures */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Required Acknowledgments</h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.agreePPM}
                    onCheckedChange={(checked) => updateFormData("agreePPM", checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground">
                    I understand I will receive and must review the Private Placement Memorandum (PPM) before my
                    investment is accepted. I acknowledge this is a private offering under Regulation D, Rule 506(c). *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.agreeRisk}
                    onCheckedChange={(checked) => updateFormData("agreeRisk", checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground">
                    I understand that investing in CookinCapital Fund I, LP involves substantial risk, including the
                    possible loss of principal. Past performance is not indicative of future results. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.agreeAccredited}
                    onCheckedChange={(checked) => updateFormData("agreeAccredited", checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground">
                    I certify that I am an accredited investor as defined under SEC regulations and meet the
                    qualifications indicated in this application. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.agreeElectronicSignature}
                    onCheckedChange={(checked) => updateFormData("agreeElectronicSignature", checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to use electronic signatures and communications for this application and related documents.
                    *
                  </span>
                </label>
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Investor Signature</h3>
              <SignaturePad
                label="Sign Below"
                required
                onSignatureChange={(sig, timestamp) => {
                  updateFormData("investorSignature", sig)
                  updateFormData("investorSignatureTimestamp", timestamp)
                }}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-12 flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
  )
}
