"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { GHLFormEmbed } from "@/components/ghl-form-embed"
import { MapPin } from "lucide-react"

function ApplyContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get("address")

  return (
    <>
      {address ? (
        <div className="border-b border-border bg-primary/5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-sm text-foreground lg:px-8">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Applying for: <strong>{address}</strong>
            </span>
          </div>
        </div>
      ) : null}
      <GHLFormEmbed
        formId="jWatiQFQY8Fyut2UlDch"
        formName="Residential Loan App"
        formHeight="5267px"
        title="Apply for Capital"
        description="Complete your residential loan application. Takes about 10 minutes and includes e-signature capabilities."
        showCreditLink={true}
      />
    </>
  )
}

export function ApplyPageClient() {
  return (
    <Suspense fallback={null}>
      <ApplyContent />
    </Suspense>
  )
}
