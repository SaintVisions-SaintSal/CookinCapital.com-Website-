"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Building2, Loader2, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PropertyFiltersSidebar } from "@/components/property/property-filters-sidebar"
import { PropertyListItem } from "@/components/property/property-list-item"
import { LocationSearchInput } from "@/components/property/location-search-input"
import { DEFAULT_PROPERTY_FILTERS } from "@/lib/property/constants"
import { filtersToQueryParams, filtersToSearchBody, parseFiltersFromParams } from "@/lib/property/search"
import { readPropertySearchCache, writePropertySearchCache } from "@/lib/property/storage"
import type { AutocompletePrediction, PropertyResult, PropertySearchFilters } from "@/lib/property/types"
import { favoriteKey } from "@/lib/property/urls"
import { usePropertySaved } from "@/hooks/use-property-saved"

const PAGE_SIZE = 20

export function PropertySearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const location = searchParams.get("q") || ""
  const [filters, setFilters] = useState<PropertySearchFilters>(() => parseFiltersFromParams(searchParams))
  const [results, setResults] = useState<PropertyResult[]>([])
  const [resultCount, setResultCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string>("PropertyRadar")
  const { recordRecentSearch, toggleFavorite, isFavorite } = usePropertySaved()

  const returnPath = `/properties/search?${searchParams.toString()}`

  const runSearch = useCallback(
    async (
      searchLocation: string,
      activeFilters: PropertySearchFilters,
      paramsKey: string,
      options?: { append?: boolean; start?: number },
    ) => {
      if (!searchLocation) {
        setError("Select a location from the suggestions to begin your search.")
        return
      }

      const append = options?.append ?? false
      const start = options?.start ?? 0

      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      try {
        const res = await fetch("/api/property-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            filtersToSearchBody(activeFilters, searchLocation, { start, limit: PAGE_SIZE }),
          ),
        })
        const data = await res.json()

        if (!res.ok || data.error) {
          if (!append) {
            setResults([])
            setResultCount(0)
          }
          setError(data.error || "Search failed")
          return
        }

        const properties: PropertyResult[] = data.properties || []
        const count = data.resultCount || 0
        setSource(data.source || "PropertyRadar")
        setResultCount(count)

        if (append) {
          setResults((prev) => {
            const merged = [...prev, ...properties]
            writePropertySearchCache(paramsKey, merged, count)
            return merged
          })
        } else {
          setResults(properties)
          writePropertySearchCache(paramsKey, properties, count)
          recordRecentSearch(searchLocation, searchLocation)
        }
      } catch {
        setError("Something went wrong while searching. Please try again.")
        if (!append) setResults([])
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [recordRecentSearch],
  )

  useEffect(() => {
    const nextFilters = parseFiltersFromParams(searchParams)
    setFilters(nextFilters)
    if (!location) return

    const paramsKey = searchParams.toString()
    const cached = readPropertySearchCache(paramsKey)
    if (cached) {
      setResults(cached.results)
      setResultCount(cached.resultCount)
      setError(null)
      setLoading(false)
      return
    }

    runSearch(location, nextFilters, paramsKey)
  }, [searchParams, location, runSearch])

  const applyFilters = () => {
    if (!location) return
    const params = filtersToQueryParams(filters, location)
    router.push(`/properties/search?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({ ...DEFAULT_PROPERTY_FILTERS })
    if (!location) return
    router.push(`/properties/search?q=${encodeURIComponent(location)}`)
  }

  const handleLocationSelect = (suggestion: AutocompletePrediction) => {
    const query = suggestion.searchQuery || suggestion.description
    const params = filtersToQueryParams(filters, query)
    router.push(`/properties/search?${params.toString()}`)
  }

  const loadMore = () => {
    if (loadingMore || results.length >= resultCount) return
    runSearch(location, filters, searchParams.toString(), {
      append: true,
      start: results.length,
    })
  }

  const summary = useMemo(() => {
    if (!location) return "Select a location to explore institutional-grade property intelligence."
    if (loading) return `Searching properties in ${location}...`
    if (results.length === 0) return `No matches in ${location}`
    if (resultCount > results.length) {
      return `Showing ${results.length.toLocaleString()} of ${resultCount.toLocaleString()} matches in ${location}`
    }
    return `${resultCount.toLocaleString()} matches in ${location}`
  }, [location, loading, resultCount, results.length])

  const hasMore = results.length > 0 && results.length < resultCount

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Property Search</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Property Intelligence Search</h1>
        <p className="mt-2 text-muted-foreground">{summary}</p>
        <div className="mt-6 max-w-3xl">
          <LocationSearchInput
            initialValue={location}
            onSelect={handleLocationSelect}
            compact
            buttonLabel="Update Location"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <PropertyFiltersSidebar
          filters={filters}
          onChange={setFilters}
          onApply={applyFilters}
          onReset={resetFilters}
          loading={loading}
        />

        <section className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/50 py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Querying {source}...</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && location && (
            <div className="rounded-2xl border border-border bg-card/50 py-20 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium text-foreground">No properties found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or choosing another location.
              </p>
            </div>
          )}

          {!loading &&
            results.map((property) => (
              <PropertyListItem
                key={property.radarId || `${property.address}-${property.city}-${property.zip}`}
                property={property}
                returnTo={returnPath}
                isFavorite={isFavorite(favoriteKey(property))}
                onToggleFavorite={() => toggleFavorite(property)}
              />
            ))}

          {!loading && hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-xl px-8"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${(resultCount - results.length).toLocaleString()} remaining)`
                )}
              </Button>
            </div>
          )}
        </section>
      </div>

      {!location && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            Choose a city or state from the location picker to load property results.
          </p>
        </div>
      )}
    </div>
  )
}
