"use client"

import Link from "next/link"
import { Bath, BedDouble, Building2, ChevronRight, Square } from "lucide-react"
import type { PropertyResult } from "@/lib/property/types"
import { formatCurrency, formatPropertyType, getDistressBadges } from "@/lib/property/format"
import { buildPropertyDetailUrl } from "@/lib/property/urls"
import { FavoriteButton } from "@/components/property/favorite-button"

interface PropertyListItemProps {
  property: PropertyResult
  returnTo?: string
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function PropertyListItem({ property, returnTo, isFavorite, onToggleFavorite }: PropertyListItemProps) {
  const badges = getDistressBadges(property)
  const href = buildPropertyDetailUrl(property, returnTo)
  const value = property.value || property.listPrice

  const content = (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 w-full shrink-0 md:h-auto md:w-72">
          {property.imageUrl ? (
            <img
              src={property.imageUrl}
              alt={property.address}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 bg-secondary/30 text-muted-foreground">
              <Building2 className="h-8 w-8 opacity-40" />
              <span className="text-xs">No photo available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
          {badges.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {badges.slice(0, 3).map((badge) => (
                <span key={badge.label} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{property.address}</h3>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.state} {property.zip}
                </p>
              </div>
              <FavoriteButton active={isFavorite} onClick={onToggleFavorite} />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {property.beds ? (
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-4 w-4" /> {property.beds} bd
                </span>
              ) : null}
              {property.baths ? (
                <span className="inline-flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {property.baths} ba
                </span>
              ) : null}
              {property.sqft ? (
                <span className="inline-flex items-center gap-1">
                  <Square className="h-4 w-4" /> {property.sqft.toLocaleString()} sqft
                </span>
              ) : null}
              {property.propertyType ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                  {formatPropertyType(property.propertyType)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(value)}</p>
              {property.equityPercent != null && (
                <p className="text-xs text-muted-foreground">{property.equityPercent.toFixed(0)}% estimated equity</p>
              )}
              {property.source && property.source !== "PropertyRadar" ? (
                <p className="text-xs text-muted-foreground">via {property.source}</p>
              ) : null}
            </div>
            {href ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                View Details
                <ChevronRight className="h-4 w-4" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )

  if (!href) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card">{content}</article>
    )
  }

  return (
    <Link href={href} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
      {content}
    </Link>
  )
}
