import { Suspense } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertySearchPageClient } from "@/components/property/property-search-page-client"
import { Loader2 } from "lucide-react"

function SearchFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function PropertySearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<SearchFallback />}>
        <PropertySearchPageClient />
      </Suspense>
      <Footer />
    </main>
  )
}
