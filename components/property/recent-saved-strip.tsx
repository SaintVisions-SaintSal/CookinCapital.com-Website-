"use client"

import Link from "next/link"
import { Clock3, Heart, MapPin } from "lucide-react"
import { usePropertySaved } from "@/hooks/use-property-saved"
import { formatCurrency } from "@/lib/property/format"

export function RecentSavedStrip() {
  const { ready, recentSearches, favorites } = usePropertySaved()

  if (!ready) return null
  if (!recentSearches.length && !favorites.length) return null

  return (
    <div className="mx-auto mt-8 max-w-4xl space-y-5">
      {recentSearches.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock3 className="h-4 w-4 text-primary" />
            Recent Searches
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <Link
                key={item.id}
                href={`/properties/search?q=${encodeURIComponent(item.searchQuery)}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-card"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Heart className="h-4 w-4 text-red-400" />
            Saved Properties
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {favorites.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/properties/${item.radarId}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/70 p-3 transition-colors hover:border-primary/30"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.address} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.address}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.city}, {item.state}
                  </p>
                  {item.value ? (
                    <p className="mt-1 text-xs font-semibold text-primary">{formatCurrency(item.value)}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
