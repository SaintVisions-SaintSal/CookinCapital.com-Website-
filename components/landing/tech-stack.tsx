"use client"

import { Sparkles, Users, Apple, Play, Zap, CheckCircle2, Globe, ExternalLink, Crown } from "lucide-react"

export function TechStack() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered By Innovation</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
            Your Complete <span className="text-primary">Business Ecosystem</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Manage your real estate business with our proprietary tech stack. SaintSal AI, Cookin.io platform, and full
            CRM integration included with Pro.
          </p>
        </div>

        {/* Tech cards - 3 main cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {/* SaintSal AI */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-card p-8 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">SaintSal AI</h3>
              <p className="text-muted-foreground mb-6">
                Our proprietary AI assistant powered by Claude Sonnet 4. Instant deal analysis, investment guidance, and
                24/7 support.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  70% MAO Rule Analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Instant BUY/PASS Signals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Investment Calculations
                </li>
              </ul>
              <div className="flex gap-2">
                <a
                  href="https://apps.apple.com/app/saintsal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <Apple className="h-4 w-4" />
                  iOS
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.saintsal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <Play className="h-4 w-4" />
                  Android
                </a>
              </div>
            </div>
          </div>

          {/* Cookin.io Web Platform */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-card p-8 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Cookin.io</h3>
              <p className="text-muted-foreground mb-6">
                Full web platform for deal analysis, loan applications, portfolio management, and document handling.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Deal Analyzer Tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Application Portal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Document Management
                </li>
              </ul>
              <a
                href="https://cookin.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Globe className="h-4 w-4" />
                Visit Cookin.io
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Pro CRM Integration */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-8 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            </div>
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Full CRM Account</h3>
              <p className="text-muted-foreground mb-6">
                Pro users at Cookin.io or SaintSal get a complete CRM account. Manage contacts, deals, communications,
                and more.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Contact Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Deal Pipeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  SMS & Email Built-in
                </li>
              </ul>
              <div className="flex gap-2">
                <a
                  href="https://apps.apple.com/us/app/go-highlevel/id1425004076"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <Apple className="h-4 w-4" />
                  iOS
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.gohighlevel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <Play className="h-4 w-4" />
                  Android
                </a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Powered by GoHighLevel</p>
            </div>
          </div>
        </div>

        {/* Pro CTA Banner */}
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
          <div className="rounded-[22px] bg-card p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">UPGRADE TO PRO</span>
                </div>
                <h3 className="text-2xl font-semibold text-foreground sm:text-3xl mb-4">Get the Full Tech Stack</h3>
                <p className="text-muted-foreground max-w-lg mb-6">
                  Join Cookin.io or SaintSal Pro and unlock your full CRM account, advanced deal tools, mobile apps, and
                  priority support. Everything you need to scale your real estate business.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>SaintSal AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Full CRM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Mobile Apps</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Priority Support</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <a
                  href="https://www.cookin.io/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Zap className="h-5 w-5" />
                  Get Pro Access
                </a>
                <p className="text-xs text-muted-foreground text-center">Starting at $97/month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner logos */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">Our Technology Stack</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              SaintSal
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 font-semibold">
              <Globe className="h-5 w-5 text-primary" />
              Cookin.io
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="font-semibold">GoHighLevel</div>
          </div>
        </div>
      </div>
    </section>
  )
}
