"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  Upload,
  Home,
  Building,
  Briefcase,
  Star,
  Calculator,
  X,
  Phone,
  Mail,
} from "lucide-react"

// ===========================================
// COMPLETE LOAN PRODUCT CONFIGURATIONS
// ===========================================
const LOAN_PRODUCTS = {
  // RESIDENTIAL LOANS
  conventional: {
    name: "Conventional Mortgage",
    category: "residential",
    icon: "🏡",
    minRate: 6.25,
    maxRate: 7.75,
    minAmount: 50000,
    maxAmount: 766550,
    termOptions: [15, 20, 30],
    minLTV: 80,
    maxLTV: 97,
    minCredit: 620,
    features: ["3-20% down payment", "15, 20, or 30-year terms", "Credit score 620+", "Primary, secondary, investment"],
    description: "Traditional mortgage for primary, secondary, or investment properties",
  },
  fha: {
    name: "FHA Loan",
    category: "residential",
    icon: "🏛️",
    minRate: 5.75,
    maxRate: 7.25,
    minAmount: 50000,
    maxAmount: 472030,
    termOptions: [15, 30],
    minCredit: 580,
    mip: 0.55,
    upfrontMIP: 1.75,
    features: ["3.5% down payment", "Credit score 580+", "Gift funds allowed", "First-time buyers welcome"],
    description: "Government-backed loan with low down payment",
  },
  va: {
    name: "VA Loan",
    category: "residential",
    icon: "🎖️",
    minRate: 5.5,
    maxRate: 7.0,
    minAmount: 50000,
    maxAmount: 2000000,
    termOptions: [15, 30],
    minCredit: 580,
    fundingFee: 2.15,
    features: ["0% down payment", "No PMI required", "Veterans & active duty", "Competitive rates"],
    description: "Zero down payment for veterans and active duty",
  },
  usda: {
    name: "USDA Loan",
    category: "residential",
    icon: "🌾",
    minRate: 5.75,
    maxRate: 7.25,
    minAmount: 50000,
    maxAmount: 500000,
    termOptions: [30],
    minCredit: 640,
    guaranteeFee: 1.0,
    annualFee: 0.35,
    features: ["0% down payment", "Rural & suburban areas", "Income limits apply", "Low mortgage insurance"],
    description: "Zero down payment for rural and suburban areas",
  },
  jumbo: {
    name: "Jumbo Loan",
    category: "residential",
    icon: "🏰",
    minRate: 6.5,
    maxRate: 8.0,
    minAmount: 766551,
    maxAmount: 5000000,
    termOptions: [15, 30],
    minCredit: 700,
    features: ["Above $766,550", "Up to $5M+", "10-20% down payment", "Credit score 700+"],
    description: "Loans above conforming limits for luxury properties",
  },
  dscr: {
    name: "DSCR Loan",
    category: "residential",
    icon: "📊",
    minRate: 7.25,
    maxRate: 9.5,
    minAmount: 75000,
    maxAmount: 3000000,
    termOptions: [30],
    minCredit: 660,
    minDSCR: 1.0,
    features: ["No income verification", "Qualify on rental income", "Investment properties", "20-25% down payment"],
    description: "Investment property loan based on rental income",
  },
  hard_money_res: {
    name: "Hard Money Loan",
    category: "residential",
    icon: "💪",
    minRate: 10.0,
    maxRate: 14.0,
    minAmount: 50000,
    maxAmount: 2000000,
    termOptions: [6, 12, 18, 24],
    minCredit: 550,
    points: 2,
    features: ["Asset-based lending", "Fast closing (7-14 days)", "Credit flexible", "6-24 month terms"],
    description: "Fast asset-based lending for investors",
  },
  fix_flip: {
    name: "Fix & Flip Loan",
    category: "residential",
    icon: "🔨",
    minRate: 9.5,
    maxRate: 13.0,
    minAmount: 75000,
    maxAmount: 3000000,
    termOptions: [6, 9, 12, 18],
    maxLTC: 90,
    maxARV: 70,
    minCredit: 620,
    points: 1.5,
    features: ["Purchase + rehab funds", "Up to 90% of purchase", "100% of rehab costs", "12-18 month terms"],
    description: "Purchase + rehab financing for flippers",
  },
  bridge_res: {
    name: "Bridge Loan",
    category: "residential",
    icon: "🌉",
    minRate: 8.5,
    maxRate: 12.0,
    minAmount: 100000,
    maxAmount: 5000000,
    termOptions: [6, 12, 18, 24],
    maxLTV: 75,
    minCredit: 620,
    features: ["Buy before you sell", "Short-term financing", "Quick approval", "6-24 month terms"],
    description: "Short-term financing to bridge transactions",
  },
  construction_res: {
    name: "Construction Loan",
    category: "residential",
    icon: "🏗️",
    minRate: 7.5,
    maxRate: 10.0,
    minAmount: 100000,
    maxAmount: 5000000,
    termOptions: [12, 18, 24],
    maxLTC: 85,
    minCredit: 680,
    features: ["Ground-up construction", "Draw schedule funding", "Interest-only during build", "Convert to perm loan"],
    description: "Ground-up construction financing",
  },
  heloc: {
    name: "HELOC",
    category: "residential",
    icon: "🏠",
    minRate: 7.99,
    maxRate: 12.0,
    minAmount: 10000,
    maxAmount: 500000,
    termOptions: [10, 15, 20],
    maxCLTV: 85,
    minCredit: 680,
    features: ["Revolving credit line", "Draw as needed", "Interest-only option", "Tax deductible*"],
    description: "Revolving home equity line of credit",
  },
  cashout_refi: {
    name: "Cash-Out Refinance",
    category: "residential",
    icon: "💵",
    minRate: 6.5,
    maxRate: 8.0,
    minAmount: 50000,
    maxAmount: 2000000,
    termOptions: [15, 20, 30],
    maxLTV: 80,
    minCredit: 620,
    features: ["Access home equity", "Lower your rate", "Consolidate debt", "Fund improvements"],
    description: "Refinance and take cash from equity",
  },
  non_qm: {
    name: "Non-QM Loan",
    category: "residential",
    icon: "📋",
    minRate: 7.5,
    maxRate: 10.0,
    minAmount: 100000,
    maxAmount: 3000000,
    termOptions: [30],
    maxLTV: 80,
    minCredit: 620,
    features: ["Bank statement income", "Asset depletion", "Foreign nationals", "Self-employed friendly"],
    description: "Bank statement, asset depletion, foreign national",
  },

  // COMMERCIAL LOANS
  cre: {
    name: "Commercial Real Estate",
    category: "commercial",
    icon: "🏢",
    minRate: 6.75,
    maxRate: 9.0,
    minAmount: 500000,
    maxAmount: 50000000,
    termOptions: [5, 7, 10, 15, 20, 25],
    maxLTV: 80,
    minDSCR: 1.25,
    features: ["Office, retail, industrial", "Up to 80% LTV", "25-year amortization", "Competitive rates"],
    description: "Office, retail, industrial financing",
  },
  multifamily: {
    name: "Multi-Family Loan",
    category: "commercial",
    icon: "🏘️",
    minRate: 6.25,
    maxRate: 8.0,
    minAmount: 500000,
    maxAmount: 100000000,
    termOptions: [5, 7, 10, 12, 15, 30],
    maxLTV: 80,
    minDSCR: 1.2,
    features: ["5+ units", "Freddie/Fannie eligible", "Non-recourse options", "Cash-out available"],
    description: "Apartment and multi-unit financing",
  },
  mixed_use: {
    name: "Mixed-Use Loan",
    category: "commercial",
    icon: "🏬",
    minRate: 7.0,
    maxRate: 9.0,
    minAmount: 250000,
    maxAmount: 20000000,
    termOptions: [5, 7, 10, 15, 25],
    maxLTV: 75,
    minDSCR: 1.25,
    features: ["Commercial + residential", "Flexible use", "Up to 75% LTV", "Various terms"],
    description: "Commercial and residential combo",
  },
  bridge_comm: {
    name: "Commercial Bridge",
    category: "commercial",
    icon: "🌉",
    minRate: 9.0,
    maxRate: 13.0,
    minAmount: 500000,
    maxAmount: 50000000,
    termOptions: [12, 24, 36],
    maxLTV: 75,
    points: 1.5,
    features: ["Value-add projects", "Lease-up financing", "Quick close", "Flexible prepay"],
    description: "Transitional commercial financing",
  },
  construction_comm: {
    name: "Commercial Construction",
    category: "commercial",
    icon: "🏗️",
    minRate: 8.5,
    maxRate: 12.0,
    minAmount: 1000000,
    maxAmount: 100000000,
    termOptions: [18, 24, 36],
    maxLTC: 80,
    features: ["Ground-up development", "Draw schedules", "Interest reserves", "Perm takeout options"],
    description: "Ground-up commercial development",
  },
  hospitality: {
    name: "Hotel/Hospitality",
    category: "commercial",
    icon: "🏨",
    minRate: 7.5,
    maxRate: 10.0,
    minAmount: 1000000,
    maxAmount: 100000000,
    termOptions: [5, 7, 10, 15, 25],
    maxLTV: 70,
    minDSCR: 1.4,
    features: ["Flagged & independent", "Acquisition & refinance", "PIP financing", "SBA eligible"],
    description: "Hotel and hospitality financing",
  },
  self_storage: {
    name: "Self-Storage Loan",
    category: "commercial",
    icon: "📦",
    minRate: 6.75,
    maxRate: 8.5,
    minAmount: 500000,
    maxAmount: 50000000,
    termOptions: [5, 7, 10, 15, 25],
    maxLTV: 80,
    minDSCR: 1.25,
    features: ["Stabilized facilities", "Expansion financing", "Climate controlled", "Conversions"],
    description: "Storage facility financing",
  },
  mhp: {
    name: "Mobile Home Park",
    category: "commercial",
    icon: "🏕️",
    minRate: 6.5,
    maxRate: 8.5,
    minAmount: 500000,
    maxAmount: 50000000,
    termOptions: [5, 7, 10, 12, 30],
    maxLTV: 80,
    minDSCR: 1.25,
    features: ["Park-owned homes OK", "Infill financing", "Freddie Mac eligible", "Long-term fixed"],
    description: "Manufactured housing community financing",
  },

  // BUSINESS FINANCING
  sba_7a: {
    name: "SBA 7(a) Loan",
    category: "business",
    icon: "🏛️",
    minRate: 10.5,
    maxRate: 13.0,
    minAmount: 50000,
    maxAmount: 5000000,
    termOptions: [5, 7, 10, 15, 25],
    features: ["Most flexible SBA program", "Working capital OK", "10% down typical", "Long terms available"],
    description: "Most flexible SBA program",
  },
  sba_504: {
    name: "SBA 504 Loan",
    category: "business",
    icon: "🏢",
    minRate: 5.5,
    maxRate: 7.0,
    minAmount: 125000,
    maxAmount: 20000000,
    termOptions: [10, 20, 25],
    downPayment: 10,
    features: ["Fixed assets only", "10% down payment", "Below market rates", "20-25 year terms"],
    description: "Fixed asset financing with low down",
  },
  term_loan: {
    name: "Term Loan",
    category: "business",
    icon: "📅",
    minRate: 8.0,
    maxRate: 25.0,
    minAmount: 5000,
    maxAmount: 5000000,
    termOptions: [1, 2, 3, 5],
    features: ["Fixed payments", "Fast approval", "Various uses", "Predictable budgeting"],
    description: "Fixed payments business loan",
  },
  working_capital: {
    name: "Working Capital",
    category: "business",
    icon: "💰",
    minRate: 15.0,
    maxRate: 45.0,
    minAmount: 10000,
    maxAmount: 2000000,
    termOptions: [3, 6, 9, 12, 18],
    features: ["Fast funding", "Minimal docs", "Revenue-based", "Daily/weekly payments"],
    description: "Fast cash flow solution",
  },
  business_loc: {
    name: "Business Line of Credit",
    category: "business",
    icon: "💳",
    minRate: 7.0,
    maxRate: 25.0,
    minAmount: 10000,
    maxAmount: 1000000,
    termOptions: [12, 24],
    features: ["Revolving access", "Pay interest on usage", "Reusable credit", "Emergency buffer"],
    description: "Revolving business credit",
  },
  equipment: {
    name: "Equipment Financing",
    category: "business",
    icon: "🚜",
    minRate: 6.0,
    maxRate: 20.0,
    minAmount: 5000,
    maxAmount: 5000000,
    termOptions: [2, 3, 4, 5, 7],
    features: ["Equipment is collateral", "100% financing available", "New & used equipment", "Preserve cash flow"],
    description: "Equipment is collateral",
  },
  factoring: {
    name: "Invoice Factoring",
    category: "business",
    icon: "📄",
    minRate: 1.0,
    maxRate: 5.0,
    minAmount: 10000,
    maxAmount: 10000000,
    termOptions: [1],
    features: ["Turn invoices to cash", "85% advance rate", "No debt added", "Collection services"],
    description: "Turn invoices into cash",
  },
  mca: {
    name: "Merchant Cash Advance",
    category: "business",
    icon: "💵",
    minRate: 20.0,
    maxRate: 50.0,
    minAmount: 5000,
    maxAmount: 500000,
    termOptions: [3, 6, 9, 12, 18],
    features: ["Based on card sales", "Daily remittance", "Fast approval", "Flexible qualifications"],
    description: "Based on credit card sales",
  },
  acquisition: {
    name: "Business Acquisition",
    category: "business",
    icon: "🤝",
    minRate: 7.0,
    maxRate: 12.0,
    minAmount: 100000,
    maxAmount: 25000000,
    termOptions: [5, 7, 10, 15, 25],
    features: ["Buy a business", "Partner buyout", "SBA eligible", "Seller financing OK"],
    description: "Buy a business or buyout partner",
  },

  // SPECIALTY PROGRAMS
  hfci: {
    name: "HFCI Fee Financing",
    category: "specialty",
    icon: "⚖️",
    minRate: 12.0,
    maxRate: 18.0,
    minAmount: 4000,
    maxAmount: 5000,
    termOptions: [12, 24, 36],
    features: ["Finance legal fees", "Save your home", "Low monthly payments", "Quick approval"],
    description: "Finance legal fees to save your home",
    highlight: true,
  },
  debt_consol: {
    name: "Debt Consolidation",
    category: "specialty",
    icon: "📊",
    minRate: 7.99,
    maxRate: 24.0,
    minAmount: 5000,
    maxAmount: 100000,
    termOptions: [2, 3, 5, 7],
    features: ["Combine debts", "One payment", "Lower rate possible", "Simplify finances"],
    description: "Combine debts into one payment",
  },
  personal: {
    name: "Personal Loan",
    category: "specialty",
    icon: "👤",
    minRate: 6.99,
    maxRate: 24.0,
    minAmount: 1000,
    maxAmount: 100000,
    termOptions: [2, 3, 5, 7],
    features: ["Unsecured", "Fixed payments", "Various uses", "Quick funding"],
    description: "Unsecured personal financing",
  },
  auto: {
    name: "Auto Loan",
    category: "specialty",
    icon: "🚗",
    minRate: 5.49,
    maxRate: 18.0,
    minAmount: 5000,
    maxAmount: 150000,
    termOptions: [2, 3, 4, 5, 6, 7],
    features: ["New & used vehicles", "Competitive rates", "Fast approval", "Refinance available"],
    description: "New and used vehicle financing",
  },
  commercial_vehicle: {
    name: "Commercial Vehicle",
    category: "specialty",
    icon: "🚛",
    minRate: 7.0,
    maxRate: 15.0,
    minAmount: 10000,
    maxAmount: 500000,
    termOptions: [2, 3, 4, 5, 7],
    features: ["Trucks, vans, fleets", "Business use", "Flexible terms", "Tax benefits"],
    description: "Trucks, vans, fleet financing",
  },
}

const categories = [
  { id: "residential", name: "Residential", icon: Home, emoji: "🏠" },
  { id: "commercial", name: "Commercial", icon: Building, emoji: "🏢" },
  { id: "business", name: "Business", icon: Briefcase, emoji: "💼" },
  { id: "specialty", name: "Specialty", icon: Star, emoji: "⭐" },
]

const stats = [
  { label: "Funds Delivered", value: "$2B+", icon: TrendingUp },
  { label: "Businesses Served", value: "10,000+", icon: Users },
  { label: "Lending Partners", value: "50+", icon: Building2 },
  { label: "Funding Speed", value: "24 hrs", icon: Clock },
]

// Calculator Modal Component
function LoanCalculator({
  product,
  onClose,
}: { product: (typeof LOAN_PRODUCTS)[keyof typeof LOAN_PRODUCTS] & { key: string }; onClose: () => void }) {
  const [loanAmount, setLoanAmount] = useState(product.minAmount)
  const [term, setTerm] = useState(product.termOptions?.[Math.floor(product.termOptions.length / 2)] || 12)
  const [rate, setRate] = useState((product.minRate + product.maxRate) / 2)

  // Calculate monthly payment
  const monthlyRate = rate / 100 / 12
  const numPayments = term * (term < 10 ? 1 : 12) // Months if term < 10 years, else months
  const actualMonths = term >= 10 ? term * 12 : term
  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, actualMonths))) /
    (Math.pow(1 + monthlyRate, actualMonths) - 1)
  const totalPayment = monthlyPayment * actualMonths
  const totalInterest = totalPayment - loanAmount

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{product.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-sm text-primary">
                {product.minRate}% - {product.maxRate}% APR
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Loan Amount */}
          <div>
            <Label className="text-sm font-medium">Loan Amount</Label>
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              min={product.minAmount}
              max={product.maxAmount}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
            </p>
          </div>

          {/* Interest Rate */}
          <div>
            <Label className="text-sm font-medium">Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.125"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              min={product.minRate}
              max={product.maxRate}
              className="mt-2"
            />
          </div>

          {/* Term */}
          <div>
            <Label className="text-sm font-medium">Term</Label>
            <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.termOptions?.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} {t >= 10 ? "Years" : "Months"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment</span>
              <span className="text-xl font-bold text-primary">
                ${isNaN(monthlyPayment) ? "0" : monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium">
                ${isNaN(totalInterest) ? "0" : totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Repayment</span>
              <span className="font-medium">
                ${isNaN(totalPayment) ? "0" : totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {product.features?.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Link href="/apply" className="block">
              <Button className="w-full bg-primary text-primary-foreground">
                Apply for This Loan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="flex gap-3">
              <a href="tel:9495461123" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </Button>
              </a>
              <a href="mailto:support@cookin.io" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CapitalPage() {
  const [activeCategory, setActiveCategory] = useState("residential")
  const [selectedProduct, setSelectedProduct] = useState<
    ((typeof LOAN_PRODUCTS)[keyof typeof LOAN_PRODUCTS] & { key: string }) | null
  >(null)

  const filteredProducts = Object.entries(LOAN_PRODUCTS)
    .filter(([_, product]) => product.category === activeCategory)
    .map(([key, product]) => ({ ...product, key }))

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
              <Link href="/prequal">
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

      {/* Category Tabs */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex overflow-x-auto gap-2 py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products Grid */}
      <section className="py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.key}
                onClick={() => setSelectedProduct(product)}
                className={`cursor-pointer hover:border-primary/50 transition-all hover:-translate-y-1 ${
                  product.highlight ? "ring-2 ring-primary/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{product.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <p className="text-primary text-xs">From {product.minRate}% APR</p>
                    </div>
                  </div>

                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    {product.features?.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      ${(product.minAmount / 1000).toFixed(0)}K - $
                      {product.maxAmount >= 1000000
                        ? `${(product.maxAmount / 1000000).toFixed(0)}M`
                        : `${(product.maxAmount / 1000).toFixed(0)}K`}
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">
                      <Calculator className="h-3 w-3 mr-1" />
                      Calculate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Apply online in minutes or upload your documents for faster processing.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/prequal">
                <Button size="lg" className="bg-primary text-primary-foreground">
                  Get Pre-Qualified
                </Button>
              </Link>
              <Link href="/documents">
                <Button size="lg" variant="outline">
                  Upload Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Modal */}
      {selectedProduct && <LoanCalculator product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}
