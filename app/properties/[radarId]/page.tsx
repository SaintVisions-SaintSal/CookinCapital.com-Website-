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

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ radarId: string }>
}) {
  const { radarId } = await params

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<DetailFallback />}>
        <PropertyDetailPageClient radarId={radarId} />
      </Suspense>
      <Footer />
    </main>
  )
}
