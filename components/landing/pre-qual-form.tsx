"use client"

import { useEffect } from "react"
import { Shield, Users, TrendingUp, Award, Building2 } from "lucide-react"

export function PreQualForm() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://link.msgsndr.com/js/form_embed.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <section id="pre-qual" className="relative py-24 lg:py-32 bg-background">
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

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left side - Social proof & credentials */}
          <div className="lg:col-span-2 lg:sticky lg:top-32 space-y-8">
            {/* Client metrics - high level, not cheesy */}
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

            {/* Who we serve */}
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Who We Work With
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Fix & Flip Operators
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  BRRRR Investors
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Wholesalers & Acquisitions
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  General Contractors
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Commercial Developers
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Institutional Partners
                </li>
              </ul>
            </div>

            {/* Trust indicators */}
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

            {/* Ecosystem badge */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-4 w-4 text-primary" />
                <span>A Saint Vision Group Company</span>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Form header */}
              <div className="bg-secondary/50 px-8 py-6 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">Pre-Qualification Application</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Takes about 2 minutes. We&apos;ll be in touch within 24 hours.
                </p>
              </div>

              {/* GHL Embedded Form */}
              <div className="p-2">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/gPGc1pTZGRvxybqPpDRL"
                  style={{
                    width: "100%",
                    height: "700px",
                    border: "none",
                    background: "transparent",
                  }}
                  id="inline-gPGc1pTZGRvxybqPpDRL"
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="Apply Now SVG2"
                  data-height="700"
                  data-layout-iframe-id="inline-gPGc1pTZGRvxybqPpDRL"
                  data-form-id="gPGc1pTZGRvxybqPpDRL"
                  title="Apply Now SVG2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
