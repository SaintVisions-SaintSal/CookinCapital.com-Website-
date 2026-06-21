"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertyDetailPageClient } from "@/components/property/property-detail-page-client"

function DetailFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function PropertyViewPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<DetailFallback />}>
        <PropertyDetailPageClient />
      </Suspense>
      <Footer />
    </main>
  )
}
