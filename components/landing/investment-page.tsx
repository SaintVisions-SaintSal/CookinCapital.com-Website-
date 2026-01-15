"use client"

import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Shield,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
  Lock,
  Phone,
  Mail,
} from "lucide-react"

const returnTiers = [
  {
    range: "$25,000 - $50,000",
    rate: "9%",
    description: "Entry-level accredited investor tier",
    popular: false,
  },
  {
    range: "$50,001 - $250,000",
    rate: "10%",
    description: "Growth investor tier",
    popular: true,
  },
  {
    range: "$250,001+",
    rate: "12%",
    description: "Institutional investor tier",
    popular: false,
  },
]

const features = [
  {
    icon: Shield,
    title: "Asset-Backed Security",
    description: "All investments secured by 1st lien position real estate at 65-75% LTV",
  },
  {
    icon: Sparkles,
    title: "SaintSal AI Underwriting",
    description: "Proprietary HACP technology analyzes every deal for risk and opportunity",
  },
  {
    icon: Clock,
    title: "Predictable Returns",
    description: "Fixed quarterly distributions with transparent reporting",
  },
  {
    icon: Building2,
    title: "Diversified Portfolio",
    description: "30-50 active loans across fix & flip, BRRRR, and commercial bridge",
  },
]

const stats = [
  { value: "$2B+", label: "Funds Delivered" },
  { value: "$3B+", label: "Distressed Assets Resolved" },
  { value: "50+", label: "Lending Partners" },
  { value: "1000+", label: "Deals Analyzed" },
]

const processSteps = [
  {
    step: "01",
    title: "Submit Interest",
    description: "Complete our investor intake form and accreditation verification",
  },
  {
    step: "02",
    title: "Review Documents",
    description: "Receive and review the Private Placement Memorandum (PPM)",
  },
  {
    step: "03",
    title: "Execute & Fund",
    description: "Sign subscription agreement and wire your investment",
  },
  {
    step: "04",
    title: "Earn Returns",
    description: "Receive quarterly distributions and comprehensive reporting",
  },
]

export function InvestmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <TrendingUp className="h-4 w-4" />
              Regulation D, Rule 506(c) Private Placement
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              CookinCapital
              <span className="block text-primary">Fund I</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Institutional-Grade Real Estate Lending + AI-Powered Underwriting
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Target Fund Size: <span className="text-foreground font-semibold">$150,000,000</span>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/invest/apply">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <DollarSign className="h-5 w-5" />
                  Invest Now
                </Button>
              </Link>
              <Link href="#returns">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-primary/50 text-primary hover:bg-primary/10"
                >
                  View Returns
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Tiers */}
      <section id="returns" className="py-20 lg:py-28 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Fixed Returns by Investment Tier
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Higher commitments unlock higher yields. All tiers receive the same institutional-grade deal flow.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {returnTiers.map((tier) => (
              <div
                key={tier.range}
                className={`relative rounded-2xl border p-8 transition-all ${
                  tier.popular
                    ? "border-primary bg-primary/5 scale-105 shadow-xl"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{tier.rate}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Annual Return</div>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-lg font-semibold text-foreground">{tier.range}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{tier.description}</div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Quarterly distributions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    1st lien secured
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Full transparency
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    24/7 investor portal
                  </div>
                </div>
                <Link href="/invest/apply" className="mt-8 block">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why CookinCapital Fund I?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Combining proven real estate lending expertise with cutting-edge AI decision technology.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SaintSal AI Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                Proprietary Technology
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                The SaintSal AI Advantage
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Proprietary HACP technology transforms traditional underwriting. Every deal receives a BUY / PASS /
                RENEGOTIATE recommendation with supporting rationale.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Comprehensive deal analysis in minutes, not days",
                  "Real-time risk flag detection",
                  "Full audit trail for regulatory compliance",
                  "70% faster underwriting with higher accuracy",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-primary/30 bg-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Image src="/logo.png" alt="SaintSal" width={64} height={64} className="rounded-xl" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">SaintSal AI</h3>
                    <p className="text-sm text-muted-foreground">HACP Decision Engine</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs text-muted-foreground mb-1">Deal Score</div>
                    <div className="text-2xl font-bold text-primary">BUY - 94/100</div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs text-muted-foreground mb-1">Risk Assessment</div>
                    <div className="text-lg font-semibold text-green-500">LOW RISK</div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs text-muted-foreground mb-1">Projected IRR</div>
                    <div className="text-lg font-semibold text-foreground">14.2%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Investment Process</h2>
            <p className="mt-4 text-lg text-muted-foreground">From interest to funded in four simple steps.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="text-6xl font-bold text-primary/20">{step.step}</div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/invest/apply">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Start Your Application
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Fund Structure */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Fund Structure & Terms</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Entity Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fund Name</span>
                  <span className="text-foreground">CookinCapital Fund I, LP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Structure</span>
                  <span className="text-foreground">Delaware LP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration</span>
                  <span className="text-foreground">Reg D, 506(c)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <DollarSign className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Investment Parameters</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Size</span>
                  <span className="text-foreground">$150,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum</span>
                  <span className="text-foreground">$25,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fund Term</span>
                  <span className="text-foreground">5 years + 2 ext.</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Investor Qualifications</h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Accredited Investors Only:</p>
                <p>• Income $200K+ (or $300K+ joint)</p>
                <p>• OR Net worth $1M+ (excl. residence)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Management Team</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                RC
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Ryan Capatosto</h3>
              <p className="text-sm text-primary">Managing Director</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Real estate investment, commercial lending, and fund management expertise
              </p>
              <a
                href="tel:+19494169971"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                949-416-9971
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                JR
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">JR</h3>
              <p className="text-sm text-primary">Managing Director</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Distressed asset resolution, legal compliance, and operational leadership
              </p>
              <a
                href="tel:+19499972097"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                949-997-2097
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-primary/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Invest in CookinCapital Fund I?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join accredited investors earning 9-12% fixed returns backed by institutional-grade real estate lending.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/invest/apply">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <DollarSign className="h-5 w-5" />
                  Start Investor Application
                </Button>
              </Link>
              <a href="mailto:support@cookin.io">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-foreground/20 hover:bg-foreground/5"
                >
                  <Mail className="h-5 w-5" />
                  Contact Investor Relations
                </Button>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Secure & Confidential
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                SEC Compliant
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-secondary/50">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-xs text-muted-foreground space-y-3">
            <p className="font-semibold text-foreground">Important Disclaimers:</p>
            <p>
              This presentation is for informational purposes only and does not constitute an offer to sell or a
              solicitation of an offer to buy any securities. Any such offer or solicitation will be made only by
              delivery of a confidential Private Placement Memorandum to qualified investors.
            </p>
            <p>
              Investment in CookinCapital Fund I, LP involves substantial risk, including the risk of loss of principal.
              Past performance is not indicative of future results. Targeted returns are forward-looking projections
              only and are not guaranteed.
            </p>
            <p>
              This opportunity is available only to accredited investors as defined under Regulation D, Rule 506(c) of
              the Securities Act of 1933. Please consult with your financial, tax, and legal advisors before making any
              investment decision.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
