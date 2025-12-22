"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Shield,
  Lock,
  CheckCircle2,
  FileText,
  Building2,
  Truck,
  Wallet,
  Calendar,
  Landmark,
  CreditCard,
  ArrowRight,
  Phone,
} from "lucide-react"
import { useEffect } from "react"

const documentCategories = [
  {
    title: "Real Estate Financing",
    icon: Building2,
    docs: [
      "Government-issued ID",
      "Purchase Agreement or LOI",
      "Property Photos",
      "Scope of Work",
      "Bank Statements (2-3 months)",
      "Entity Documents",
      "Experience Resume",
      "Insurance Quote",
    ],
  },
  {
    title: "Equipment Financing",
    icon: Truck,
    docs: [
      "Government-issued ID",
      "Equipment Quote/Invoice",
      "Bank Statements (3 months)",
      "Tax Returns (1-2 years)",
      "Proof of Ownership",
    ],
  },
  {
    title: "Working Capital",
    icon: Wallet,
    docs: ["Government-issued ID", "Bank Statements (3-4 months)", "Voided Business Check", "Business License"],
  },
  {
    title: "Term Loans",
    icon: Calendar,
    docs: [
      "Government-issued ID",
      "Tax Returns (2 years)",
      "Bank Statements (3-6 months)",
      "P&L Statement",
      "Balance Sheet",
    ],
  },
  {
    title: "SBA Loans",
    icon: Landmark,
    docs: [
      "ID for all 20%+ owners",
      "Tax Returns (3 years)",
      "Bank Statements (12 months)",
      "YTD Financials",
      "Business Plan",
      "SBA Form 413",
    ],
  },
  {
    title: "Line of Credit",
    icon: CreditCard,
    docs: ["Government-issued ID", "Bank Statements (3-6 months)", "Tax Returns (1-2 years)", "Proof of Ownership"],
  },
]

export function DocumentUploadPage() {
  useEffect(() => {
    // Load the GHL form embed script
    const script = document.createElement("script")
    script.src = "https://link.msgsndr.com/js/form_embed.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Lock className="mr-2 h-3 w-3" />
              256-bit SSL Encrypted
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Secure Document
              <span className="block text-primary mt-2">Upload Portal</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Upload your loan documents securely. Our encrypted portal ensures your sensitive information is protected
              throughout the funding process.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Left Column - Document Requirements */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Documents by Loan Type</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select your loan type to see required documents. Upload everything in one secure submission.
                </p>
              </div>

              <div className="space-y-4">
                {documentCategories.map((category) => (
                  <Card key={category.title} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <category.icon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium text-foreground text-sm">{category.title}</h3>
                      </div>
                      <div className="space-y-1">
                        {category.docs.slice(0, 4).map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                            <span>{doc}</span>
                          </div>
                        ))}
                        {category.docs.length > 4 && (
                          <p className="text-xs text-primary ml-5">+{category.docs.length - 4} more</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Trust Indicators */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">Bank-Level Security</h3>
                      <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>SOC 2 Type II compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>GDPR & CCPA compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Automatic file deletion after processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Upload Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Upload Your Documents</h2>
                      <p className="text-sm text-muted-foreground">All file types accepted. Max 50MB per file.</p>
                    </div>
                  </div>

                  {/* GHL Form Embed */}
                  <div className="min-h-[800px] bg-muted/30 rounded-lg overflow-hidden">
                    <iframe
                      src="https://api.leadconnectorhq.com/widget/form/yLjMJMuW3mM08ju9GkWY"
                      style={{ width: "100%", height: "1311px", border: "none", borderRadius: "8px" }}
                      id="inline-yLjMJMuW3mM08ju9GkWY"
                      data-layout="{'id':'INLINE'}"
                      data-trigger-type="alwaysShow"
                      data-trigger-value=""
                      data-activation-type="alwaysActivated"
                      data-activation-value=""
                      data-deactivation-type="neverDeactivate"
                      data-deactivation-value=""
                      data-form-name="Secure SVG Upload Portal"
                      data-height="1311"
                      data-layout-iframe-id="inline-yLjMJMuW3mM08ju9GkWY"
                      data-form-id="yLjMJMuW3mM08ju9GkWY"
                      title="Secure SVG Upload Portal"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* What Happens Next */}
              <Card className="mt-6 bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">What Happens Next?</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Secure Upload</p>
                        <p className="text-xs text-muted-foreground">Files encrypted instantly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Team Review</p>
                        <p className="text-xs text-muted-foreground">Within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Get Funded</p>
                        <p className="text-xs text-muted-foreground">As fast as same day</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="bg-card border-border/50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Need Help With Your Application?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Our team is standing by to assist you through the process. Call us or apply online to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/apply">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="tel:+19499972097">
                  <Button size="lg" variant="outline" className="border-border/50 bg-transparent">
                    <Phone className="mr-2 h-4 w-4" />
                    (949) 997-2097
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
