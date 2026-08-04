import { Suspense } from "react"
import { PropertySearchPageClient } from "@/components/property/property-search-page-client"

/**
 * OPERATOR surface. This is the PropertyRadar-backed address search that used
 * to sit on the public /properties/search route. It stays behind /app/* because
 * PropertyRadar data may not be displayed to third parties.
 */
export default function AppPropertiesPage() {
  return (
    <div>
      <div className="mb-8">
        <span className="kl-label">Internal — CookinCapital operators only</span>
        <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-on-surface">
          Property Search
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-outline">
          PropertyRadar-sourced records including distress signals. Do not export or forward these fields outside
          CookinCapital.
        </p>
      </div>
      <Suspense fallback={<div className="kl-skeleton h-96 w-full" />}>
        <PropertySearchPageClient />
      </Suspense>
    </div>
  )
}

