import Link from "next/link"
import { Shield, Users, TrendingUp, Building2, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CapitalShowcase() {
  return (
    <section id="capital" className="relative py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Ready to Move? <span className="text-primary">Let&apos;s Talk.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re funding your next acquisition, refinancing, or need capital fast — our team personally
            reviews every application.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Client metrics */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">By the Numbers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl font-semibold text-foreground">$2.4B+</div>
                <div className="text-sm text-muted-foreground mt-1">Deals Analyzed</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl font-semibold text-foreground">1,200+</div>
                <div className="text-sm text-muted-foreground mt-1">Clients Served</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl font-semibold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground mt-1">Lending Partners</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl font-semibold text-foreground">24hr</div>
                <div className="text-sm text-muted-foreground mt-1">Response Time</div>
              </div>
            </div>
          </div>

          {/* Who we serve */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Who We Work With</h3>
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  Fix & Flip Operators
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  BRRRR Investors
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  Wholesalers & Acquisitions
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  General Contractors
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  Commercial Developers
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  Institutional Partners
                </li>
              </ul>
            </div>
          </div>

          {/* Trust indicators & CTA */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Why CookinCap</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">No Hard Credit Pull</div>
                  <div className="text-xs text-muted-foreground">Pre-qualification is a soft inquiry only</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">SaintSal™ Matching</div>
                  <div className="text-xs text-muted-foreground">AI-powered lender matching to your deal profile</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">Institutional Access</div>
                  <div className="text-xs text-muted-foreground">Direct relationships with institutional capital</div>
                </div>
              </div>
            </div>

            {/* CTA Card - Updated to link to /prequal */}
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h4 className="font-semibold text-foreground mb-2">Start Your Pre-Qualification</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Takes about 2 minutes. We&apos;ll be in touch within 24 hours.
              </p>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/prequal">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Ecosystem badge */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-4 w-4 text-primary" />
                <span>A Saint Vision Group Company</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
