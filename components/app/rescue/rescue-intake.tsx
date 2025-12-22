"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Scale, Loader2, Phone, Mail } from "lucide-react"

export function RescueIntake() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [caseId, setCaseId] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    propertyAddress: "",
    cityStateZip: "",
    caseType: "",
    currentSituation: "",
    mortgageBalance: "",
    monthlyPayment: "",
    arrearsAmount: "",
    monthsBehind: "",
    propertyValue: "",
    householdIncome: "",
    fullName: "",
    email: "",
    phone: "",
    saleDate: "",
    urgencyLevel: "Standard",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submit-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mortgageBalance: Number.parseFloat(formData.mortgageBalance) || 0,
          monthlyPayment: Number.parseFloat(formData.monthlyPayment) || 0,
          arrearsAmount: Number.parseFloat(formData.arrearsAmount) || 0,
          monthsBehind: Number.parseInt(formData.monthsBehind) || 0,
          propertyValue: Number.parseFloat(formData.propertyValue) || 0,
          householdIncome: Number.parseFloat(formData.householdIncome) || 0,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setCaseId(result.caseId)
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Case Submitted Successfully</h2>
              <p className="text-muted-foreground mt-2">Your case has been sent to our legal team at FlipEffective.</p>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Case Reference</p>
              <p className="text-xl font-mono font-bold text-primary mt-1">{caseId}</p>
            </div>
            <div className="space-y-3 text-left bg-background/50 rounded-lg p-4">
              <p className="font-medium text-foreground">What happens next:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  Darren from FlipEffective Legal will review your case within 24-48 hours
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  You'll receive a call or email with recommended pathways
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  If urgent, expect contact within 24 hours
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button variant="outline" asChild>
                <a href="tel:+18005551234">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:darren@flipeffective.com">
                  <Mail className="mr-2 h-4 w-4" />
                  darren@flipeffective.com
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s === step
                    ? "bg-primary text-primary-foreground"
                    : s < step
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-8 mx-2 ${s < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Property Address</Label>
                  <Input
                    placeholder="123 Main St"
                    className="bg-secondary border-0"
                    value={formData.propertyAddress}
                    onChange={(e) => updateField("propertyAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City, State, ZIP</Label>
                  <Input
                    placeholder="Austin, TX 78701"
                    className="bg-secondary border-0"
                    value={formData.cityStateZip}
                    onChange={(e) => updateField("cityStateZip", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Case Type</Label>
                <Select value={formData.caseType} onValueChange={(v) => updateField("caseType", v)}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foreclosure">Foreclosure Prevention</SelectItem>
                    <SelectItem value="bankruptcy">Bankruptcy Workout</SelectItem>
                    <SelectItem value="arrears">Arrears Roll-in</SelectItem>
                    <SelectItem value="refinance">Refinance / Bridge</SelectItem>
                    <SelectItem value="commercial">Commercial Lending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Situation</Label>
                <Textarea
                  placeholder="Describe the current situation, including any deadlines, amounts owed, and key concerns..."
                  className="bg-secondary border-0 min-h-[120px]"
                  value={formData.currentSituation}
                  onChange={(e) => updateField("currentSituation", e.target.value)}
                />
              </div>

              <Button onClick={() => setStep(2)} className="bg-primary text-primary-foreground">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Financial Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Mortgage Balance</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      placeholder="0"
                      className="bg-secondary border-0 pl-7"
                      value={formData.mortgageBalance}
                      onChange={(e) => updateField("mortgageBalance", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Payment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      placeholder="0"
                      className="bg-secondary border-0 pl-7"
                      value={formData.monthlyPayment}
                      onChange={(e) => updateField("monthlyPayment", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Arrears Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      placeholder="0"
                      className="bg-secondary border-0 pl-7"
                      value={formData.arrearsAmount}
                      onChange={(e) => updateField("arrearsAmount", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Months Behind</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-secondary border-0"
                    value={formData.monthsBehind}
                    onChange={(e) => updateField("monthsBehind", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estimated Property Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      placeholder="0"
                      className="bg-secondary border-0 pl-7"
                      value={formData.propertyValue}
                      onChange={(e) => updateField("propertyValue", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Household Income</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      placeholder="0"
                      className="bg-secondary border-0 pl-7"
                      value={formData.householdIncome}
                      onChange={(e) => updateField("householdIncome", e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-primary text-primary-foreground">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contact Info & Urgency */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="John Smith"
                    className="bg-secondary border-0"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="bg-secondary border-0"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="bg-secondary border-0"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Foreclosure Sale Date (if applicable)</Label>
                  <Input
                    type="date"
                    className="bg-secondary border-0"
                    value={formData.saleDate}
                    onChange={(e) => updateField("saleDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Urgency Level</Label>
                  <Select value={formData.urgencyLevel} onValueChange={(v) => updateField("urgencyLevel", v)}>
                    <SelectTrigger className="bg-secondary border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard (30+ days)</SelectItem>
                      <SelectItem value="Urgent">Urgent (Less than 30 days)</SelectItem>
                      <SelectItem value="Critical">Critical (Less than 7 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.urgencyLevel !== "Standard" && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Urgent Case Flagged</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your case will be prioritized. Darren will contact you within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="bg-primary text-primary-foreground">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Property</p>
                  <p className="font-medium text-foreground">{formData.propertyAddress || "Not provided"}</p>
                  <p className="text-sm text-muted-foreground">{formData.cityStateZip || "Not provided"}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Case Type</p>
                    <p className="font-medium text-foreground capitalize">{formData.caseType || "Not selected"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Urgency</p>
                    <p
                      className={`font-medium ${formData.urgencyLevel === "Critical" ? "text-red-500" : formData.urgencyLevel === "Urgent" ? "text-yellow-500" : "text-foreground"}`}
                    >
                      {formData.urgencyLevel}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Mortgage Balance
                    </p>
                    <p className="font-medium text-foreground">
                      ${Number.parseFloat(formData.mortgageBalance || "0").toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Arrears</p>
                    <p className="font-medium text-foreground">
                      ${Number.parseFloat(formData.arrearsAmount || "0").toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Property Value
                    </p>
                    <p className="font-medium text-foreground">
                      ${Number.parseFloat(formData.propertyValue || "0").toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Submitting to FlipEffective Legal</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your case will be reviewed by Darren at darren@flipeffective.com. SaintSal will analyze viability
                      and recommend pathways.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Case information complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Financial details provided</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Contact information verified</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  className="bg-primary text-primary-foreground"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.fullName || !formData.email || !formData.phone}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Scale className="mr-2 h-4 w-4" />
                      Submit to FlipEffective Legal
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Info panel */}
      <div className="space-y-6">
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">FlipEffective Legal Services</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our legal services program helps homeowners facing foreclosure or bankruptcy by negotiating with lenders,
              rolling arrears into loans, and finding alternative funding paths.
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Direct Contact:</p>
              <a href="mailto:darren@flipeffective.com" className="text-sm text-primary hover:underline">
                darren@flipeffective.com
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">How It Works</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">1.</span>
                Submit your case details
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">2.</span>
                SaintSal assesses viability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">3.</span>
                Darren reviews & contacts you
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">4.</span>
                We negotiate on your behalf
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Facing a deadline?</span> Contact Darren immediately at{" "}
                <a href="mailto:darren@flipeffective.com" className="text-primary hover:underline">
                  darren@flipeffective.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
