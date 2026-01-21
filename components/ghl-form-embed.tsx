"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GHLFormEmbedProps {
  formId: string
  formName: string
  formHeight?: string
  title: string
  description?: string
  showCreditLink?: boolean
}

export function GHLFormEmbed({
  formId,
  formName,
  formHeight = "100%",
  title,
  description,
  showCreditLink = false,
}: GHLFormEmbedProps) {
  useEffect(() => {
    // Load GHL form embed script
    const script = document.createElement("script")
    script.src = "https://link.msgsndr.com/js/form_embed.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Secure Form</span>
            </div>
            {showCreditLink && (
              <a
                href="https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="bg-transparent">
                  Pull Credit Report
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{title}</h1>
            {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>

          {/* GHL Form Container */}
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="relative" style={{ minHeight: "600px" }}>
              <iframe
                src={`https://api.leadconnectorhq.com/widget/form/${formId}`}
                style={{
                  width: "100%",
                  height: formHeight,
                  border: "none",
                  borderRadius: "0",
                  minHeight: "600px",
                }}
                id={`inline-${formId}`}
                data-layout='{"id":"INLINE"}'
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name={formName}
                data-height={formHeight}
                data-layout-iframe-id={`inline-${formId}`}
                data-form-id={formId}
                title={formName}
              />
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:support@cookin.io" className="text-primary hover:underline">
              support@cookin.io
            </a>{" "}
            or call{" "}
            <a href="tel:+19499972097" className="text-primary hover:underline">
              949-997-2097
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
