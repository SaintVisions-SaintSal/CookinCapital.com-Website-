"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvestorSchedulePage() {
  useEffect(() => {
    // Load GHL calendar script
    const script = document.createElement("script")
    script.src = "https://link.msgsndr.com/js/form_embed.js"
    script.type = "text/javascript"
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-white/60">Secure Scheduling</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-500">
            <Calendar className="h-4 w-4" />
            Investment Strategy Session
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            Schedule Your Consultation
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Book a personalized consultation with our investment team to discuss your portfolio strategy and investment goals.
          </p>
        </div>

        {/* Calendar Embed */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <iframe
            src="https://api.leadconnectorhq.com/booking/saint-vision-technologies-llc-yhv4uw81ar9/sv/69706c15dff11b8010ab641b?heightMode=full&showHeader=true"
            style={{
              width: "100%",
              border: "none",
              overflow: "hidden",
            }}
            scrolling="no"
            id="69706c15dff11b8010ab641b_1769025002222"
            title="Investment Consultation Booking"
          />
        </div>

        {/* Support Section */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-2 text-lg font-semibold text-white">Need Help?</h3>
          <p className="mb-4 text-sm text-white/60">
            Our team is here to assist you with scheduling or any questions about your investment.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="tel:949-997-2097" className="text-white">
                Call: (949) 997-2097
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@cookin.io" className="text-white">
                Email: support@cookin.io
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
