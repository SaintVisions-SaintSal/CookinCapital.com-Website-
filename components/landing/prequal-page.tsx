"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Shield, Clock, CheckCircle2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PreQualPage() {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="CookinCap" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-semibold text-foreground">CookinCap</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left sidebar - Benefits */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-4">Pre-Qualify for Capital</h1>
              <p className="text-muted-foreground">
                Start your journey to funding. Takes about 2 minutes and does not affect your credit score.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">No Hard Credit Pull</div>
                  <div className="text-sm text-muted-foreground">Pre-qualification uses a soft inquiry only</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">24-Hour Response</div>
                  <div className="text-sm text-muted-foreground">Our team reviews every application personally</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">50+ Lending Partners</div>
                  <div className="text-sm text-muted-foreground">SaintSal™ matches you with the right lender</div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Prefer to talk?</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Call us directly and speak with a funding specialist.
              </p>
              <a href="tel:+18335242464" className="text-primary font-semibold hover:underline">
                (833) 524-2464
              </a>
            </div>

            {/* Already have a deal? */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Already analyzed a deal?</p>
              <Link href="/apply">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Submit Full Application
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - GHL Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-card/50">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-muted-foreground">Secure Pre-Qualification Form</span>
                </div>
              </div>

              <div className="p-2">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/gPGc1pTZGRvxybqPpDRL"
                  style={{
                    width: "100%",
                    height: "1944px",
                    border: "none",
                    borderRadius: "4px",
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
                  data-height="1944"
                  data-layout-iframe-id="inline-gPGc1pTZGRvxybqPpDRL"
                  data-form-id="gPGc1pTZGRvxybqPpDRL"
                  title="Apply Now SVG2"
                />
              </div>
            </div>

            {/* Security badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>256-bit SSL Encryption • Your information is secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
