"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Truck,
  Wallet,
  Calendar,
  Landmark,
  FileText,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Phone,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Upload,
} from "lucide-react"
import { useState } from "react"

const loanProducts = [
  {
    id: "real-estate",
    title: "Real Estate Financing",
    icon: Building2,
    tagline: "From fix & flip to commercial acquisitions",
    description:
      "Our expertise lies in unlocking funding for a broad spectrum of real estate opportunities, from bustling commercial properties to tranquil residential spaces. We provide bespoke financial solutions tailored to each unique investment, ensuring your venture is not just a dream, but a profitable reality.",
    features: [
      "Fix & Flip Loans",
      "Bridge Loans",
      "DSCR Loans",
      "Commercial Mortgages",
      "Ground-Up Construction",
      "Portfolio Lending",
    ],
    amounts: "$50K - $50M+",
    terms: "6 months - 30 years",
    highlight: true,
    requiredDocs: [
      "Government-issued ID (Driver's License or Passport)",
      "Purchase Agreement or LOI",
      "Property Address & Photos",
      "Scope of Work (for rehab projects)",
      "Bank Statements (last 2-3 months)",
      "Entity Documents (LLC/Corp if applicable)",
      "Real Estate Experience Resume",
      "Insurance Quote or Binder",
    ],
  },
  {
    id: "equipment",
    title: "Equipment Financing",
    icon: Truck,
    tagline: "Acquire what you need, preserve your cash",
    description:
      "Equipment financing allows businesses to acquire necessary equipment without making a large upfront payment. Make manageable monthly payments over a specified period while preserving cash flow for other critical areas of your operations.",
    features: [
      "Heavy Equipment",
      "Vehicles & Fleets",
      "Technology & Software",
      "Manufacturing Equipment",
      "Medical Equipment",
      "Restaurant Equipment",
    ],
    amounts: "$5K - $5M",
    terms: "1 - 7 years",
    requiredDocs: [
      "Government-issued ID",
      "Equipment Quote or Invoice",
      "Business Bank Statements (3 months)",
      "Business Tax Returns (1-2 years)",
      "Proof of Business Ownership",
      "Equipment Specifications",
    ],
  },
  {
    id: "working-capital",
    title: "Working Capital",
    icon: Wallet,
    tagline: "Keep your operations running smoothly",
    description:
      "Working capital serves as a financial cushion that enables your business to cover operational expenses, manage inventory, meet short-term obligations, and pursue growth opportunities. Maintain financial stability and support ongoing growth.",
    features: [
      "Inventory Purchases",
      "Payroll Coverage",
      "Marketing Campaigns",
      "Seasonal Fluctuations",
      "Emergency Reserves",
      "Opportunity Seizing",
    ],
    amounts: "$5K - $1M",
    terms: "3 - 24 months",
    requiredDocs: [
      "Government-issued ID",
      "Business Bank Statements (3-4 months)",
      "Voided Business Check",
      "Business License",
      "Proof of Ownership",
    ],
  },
  {
    id: "term-loans",
    title: "Term Loans",
    icon: Calendar,
    tagline: "Predictable payments, affordable capital",
    description:
      "A term loan provides a fixed amount of money upfront with a defined repayment period and regular installments. This predictability allows you to plan cash flow and allocate resources effectively. Lower interest rates make it an attractive option for affordable capital.",
    features: [
      "Expansion Projects",
      "Acquisitions",
      "Debt Consolidation",
      "Major Purchases",
      "Business Investments",
      "Long-term Planning",
    ],
    amounts: "$5K - $5M",
    terms: "1 - 10 years",
    requiredDocs: [
      "Government-issued ID",
      "Business & Personal Tax Returns (2 years)",
      "Business Bank Statements (3-6 months)",
      "Profit & Loss Statement (YTD)",
      "Balance Sheet",
      "Business Debt Schedule",
      "Use of Funds Statement",
    ],
  },
  {
    id: "sba-loans",
    title: "SBA Loans",
    icon: Landmark,
    tagline: "Government-backed, business-forward",
    description:
      "SBA loans offer lower down payments, longer repayment terms, and more flexible eligibility requirements compared to traditional bank loans. Competitive interest rates significantly reduce borrowing costs and improve overall financial health.",
    features: [
      "SBA 7(a) Loans",
      "SBA 504 Loans",
      "SBA Microloans",
      "SBA Express",
      "SBA Disaster Loans",
      "SBA Export Loans",
    ],
    amounts: "$50K - $5M",
    terms: "5 - 25 years",
    requiredDocs: [
      "Government-issued ID for all 20%+ owners",
      "Business & Personal Tax Returns (3 years)",
      "Business Bank Statements (12 months)",
      "Year-to-Date Financials (P&L, Balance Sheet)",
      "Business Debt Schedule",
      "Business Plan (for startups)",
      "Personal Financial Statement (SBA Form 413)",
      "Resume/Experience for each owner",
      "Collateral Documentation",
      "Lease Agreement (if applicable)",
    ],
  },
  {
    id: "invoice-factoring",
    title: "Invoice Factoring",
    icon: FileText,
    tagline: "Turn unpaid invoices into immediate cash",
    description:
      "Invoice factoring involves selling unpaid invoices to access a significant portion of your accounts receivable immediately. Eliminate waiting for customers to settle their invoices and reduce the risk of late or non-payments.",
    features: [
      "Immediate Cash Access",
      "No Debt Added",
      "Flexible Funding",
      "Credit Protection",
      "Collection Services",
      "Growth Enablement",
    ],
    amounts: "Up to 90% of Invoice Value",
    terms: "Ongoing",
    requiredDocs: [
      "Government-issued ID",
      "Accounts Receivable Aging Report",
      "Sample Invoices",
      "Customer List with Contact Info",
      "Business Bank Statements (3 months)",
      "Business License",
    ],
  },
  {
    id: "line-of-credit",
    title: "Business Line of Credit",
    icon: CreditCard,
    tagline: "Draw what you need, when you need it",
    description:
      "A business line of credit gives you access to a predetermined amount of capital that you can draw upon as needed. Address short-term cash flow gaps, manage unexpected expenses, or seize new opportunities without applying for a new loan each time.",
    features: [
      "Revolving Access",
      "Pay Interest Only on Usage",
      "Quick Draws",
      "Flexible Repayment",
      "Safety Net",
      "Growth Ready",
    ],
    amounts: "$10K - $1M",
    terms: "Revolving",
    requiredDocs: [
      "Government-issued ID",
      "Business Bank Statements (3-6 months)",
      "Business Tax Returns (1-2 years)",
      "Proof of Business Ownership",
      "Voided Business Check",
    ],
  },
]

const stats = [
  { label: "Funds Delivered", value: "$2B+", icon: TrendingUp },
  { label: "Businesses Served", value: "10,000+", icon: Users },
  { label: "Lending Partners", value: "50+", icon: Building2 },
  { label: "Funding Speed", value: "24 hrs", icon: Clock },
]

const processSteps = [
  {
    step: "01",
    title: "Apply Online",
    description: "Fast & easy application. Our loan specialist will contact you within hours.",
  },
  {
    step: "02",
    title: "Review Options",
    description: "Get your decision in minutes. No paperwork, no waiting. Multiple offers to compare.",
  },
  {
    step: "03",
    title: "Get Funded",
    description: "True term loans $5,000 - $5,000,000+. Receive funding in as fast as 1 day.",
  },
]

export function CapitalPage() {
  const [expandedDocs, setExpandedDocs] = useState<string | null>(null)

  const toggleDocs = (id: string) => {
    setExpandedDocs(expandedDocs === id ? null : id)
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Sparkles className="mr-2 h-3 w-3" />
              50+ Institutional Lending Partners
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Commercial Lending
              <span className="block text-primary mt-2">Built for Operators</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Access $5K to $50M+ in business funding. Real estate, equipment, working capital, and more.
              Industry-leading approval process matched by SaintSal™ to the right lender for your deal.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Get Pre-Qualified
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/documents">
                <Button size="lg" variant="outline" className="border-border/50 bg-transparent">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <Shield className="inline h-4 w-4 mr-1" />
              Checking your rate won't affect your credit score
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/50 border-border/50 text-center">
                <CardContent className="pt-6 pb-4">
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products Grid */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Funding Options</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find the business loan that meets your needs. Every product, every scenario, one platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loanProducts.map((product) => (
              <Card
                key={product.id}
                className={`bg-card border-border/50 hover:border-primary/30 transition-all duration-300 flex flex-col ${
                  product.highlight ? "ring-1 ring-primary/30 md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <product.icon className="h-6 w-6 text-primary" />
                    </div>
                    {product.highlight && <Badge className="bg-primary/10 text-primary border-0">Most Popular</Badge>}
                  </div>
                  <CardTitle className="text-xl mt-4">{product.title}</CardTitle>
                  <CardDescription className="text-primary font-medium">{product.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {product.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Required Documents Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleDocs(product.id)}
                      className="flex items-center justify-between w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        Required Documents
                      </span>
                      {expandedDocs === product.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedDocs === product.id && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
                        {product.requiredDocs.map((doc, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </div>
                        ))}
                        <Link href="/documents" className="block mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border-primary/30 text-primary bg-transparent"
                          >
                            <Upload className="mr-2 h-3 w-3" />
                            Upload These Documents
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-border/50">
                    <div className="flex justify-between text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-medium text-foreground">{product.amounts}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Terms:</span>
                        <span className="ml-2 font-medium text-foreground">{product.terms}</span>
                      </div>
                    </div>
                    <Link href="/apply">
                      <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Document Upload CTA */}
      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Ready to Submit Your Documents?</h3>
                <p className="text-muted-foreground">
                  Securely upload your files to our encrypted portal for faster processing.
                </p>
              </div>
            </div>
            <Link href="/documents">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="mr-2 h-4 w-4" />
                Secure Document Upload
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Fast & Simple
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get Funded in 1-2-3</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Industry-leading approval process that's easy and less intensive
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <Card className="bg-card/50 border-border/50 text-center h-full">
                  <CardContent className="pt-8 pb-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <span className="text-2xl font-bold text-primary">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                Trusted Partnerships
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                50+ Exclusive Lending Partners You Can Count On
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                At CookinCap, we appreciate how investing in relationships brings mutual prosperity. Who we partner with
                ensures the best services available for our customers. Our network includes institutional lenders,
                private equity funds, and specialized finance companies.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Institutional Lenders",
                  "Private Money",
                  "SBA Preferred",
                  "Credit Unions",
                  "Family Offices",
                  "Hedge Funds",
                  "Regional Banks",
                  "Alt-Finance",
                ].map((partner) => (
                  <div key={partner} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{partner}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="bg-card border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">SaintSal™ Matching</h3>
                      <p className="text-sm text-muted-foreground">AI-powered lender matching</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Our proprietary SaintSal™ decision engine analyzes your deal and matches you with the optimal lender
                    from our network - ensuring the best rates, terms, and likelihood of approval for your specific
                    situation.
                  </p>
                  <Link href="/apply">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Get Matched Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                Ready to Get Funded?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Get the capital you need to allow your business to grow, today. Speak to a Saint Vision Team Member and
                get pre-qualified in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/apply">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="tel:+19499972097">
                  <Button size="lg" variant="outline" className="border-primary/50 text-primary bg-transparent">
                    <Phone className="mr-2 h-4 w-4" />
                    (949) 997-2097
                  </Button>
                </a>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Fast • Easy • Reliable</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center">
            Saint Vision Group LLC © 2025 | All Rights Reserved | Loans Subject to Lender Approval. The operator of this
            website is NOT a lender, does not make offers for loans, and does not broker online loans to lenders or
            lending partners. Customers are paired with a lender or lending partner and redirected only to lenders or
            lending partners who offer business/commercial loan products.
          </p>
        </div>
      </section>
    </div>
  )
}
