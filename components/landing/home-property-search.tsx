"use client"

import { useRouter } from "next/navigation"
import { LocationSearchInput } from "@/components/property/location-search-input"
import { RecentSavedStrip } from "@/components/property/recent-saved-strip"
import { usePropertySaved } from "@/hooks/use-property-saved"
import type { AutocompletePrediction } from "@/lib/property/types"

export function HomePropertySearch() {
  const router = useRouter()
  const { recordRecentSearch } = usePropertySaved()

  const handleSelect = (suggestion: AutocompletePrediction) => {
    recordRecentSearch(suggestion.description, suggestion.searchQuery || suggestion.description)
    router.push(`/properties/search?q=${encodeURIComponent(suggestion.searchQuery || suggestion.description)}`)
  }

  return (
    <div className="mx-auto mt-10 max-w-4xl">
      <LocationSearchInput
        onSelect={handleSelect}
        placeholder="Search by city or state — select from suggestions"
        buttonLabel="Search"
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Powered by PropertyRadar · Location suggestions by Google Places
      </p>
      <RecentSavedStrip />
    </div>
  )
}
