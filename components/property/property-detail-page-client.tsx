"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  Bath,
  BedDouble,
  Calculator,
  CalendarDays,
  ChevronLeft,
  Landmark,
  Loader2,
  MapPin,
  Shield,
  Square,
  User,
} from "lucide-react"
import { PropertyImageCarousel } from "@/components/property/property-image-carousel"
import { FavoriteButton } from "@/components/property/favorite-button"
import { formatCurrency, getDistressBadges } from "@/lib/property/format"
import type { PropertyResult } from "@/lib/property/types"
import { usePropertySaved } from "@/hooks/use-property-saved"
import { Button } from "@/components/ui/button"

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function PropertyDetailPageClient({ radarId }: { radarId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")
  const [property, setProperty] = useState<PropertyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleFavorite, isFavorite } = usePropertySaved()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push(returnTo || "/properties/search")
  }

  useEffect(() => {
    async function loadProperty() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/property-search/detail?radarId=${encodeURIComponent(radarId)}`)
        const data = await res.json()
        if (!res.ok || !data.property) {
          setError(data.error || "Property not found")
          return
        }
        setProperty(data.property)
      } catch {
        setError("Unable to load property details.")
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [radarId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading property intelligence...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <p className="mt-4 text-lg font-medium text-foreground">{error || "Property not found"}</p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-6 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to search results
        </button>
      </div>
    )
  }

  const badges = getDistressBadges(property)

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <button
        type="button"
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to search results
      </button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <PropertyImageCarousel property={property} />

          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-primary">PropertyRadar Record</p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">{property.address}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.city}, {property.state} {property.zip}
                </p>
              </div>
              <FavoriteButton
                active={isFavorite(property.radarId)}
                onClick={() => toggleFavorite(property)}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <DetailStat label="Est. Value" value={formatCurrency(property.value)} />
              <DetailStat
                label="Equity"
                value={property.equityPercent != null ? `${property.equityPercent.toFixed(0)}%` : "—"}
              />
              <DetailStat label="Loan Balance" value={formatCurrency(property.loanBalance)} />
              <DetailStat label="Assessed Value" value={formatCurrency(property.assessedValue)} />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BedDouble className="h-4 w-4 text-primary" />
                  Property Details
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailStat label="Beds" value={property.beds?.toString() || "—"} />
                  <DetailStat label="Baths" value={property.baths?.toString() || "—"} />
                  <DetailStat label="Sq Ft" value={property.sqft?.toLocaleString() || "—"} />
                  <DetailStat label="Year Built" value={property.yearBuilt?.toString() || "—"} />
                  <DetailStat label="Type" value={property.propertyType || "—"} />
                  <DetailStat label="APN" value={property.apn || "—"} />
                </div>
              </div>

              {property.ownerName && (
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    Owner
                  </h2>
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm">
                    <p className="font-medium text-foreground">{property.ownerName}</p>
                    {property.ownerAddress && (
                      <p className="mt-1 text-muted-foreground">{property.ownerAddress}</p>
                    )}
                    {property.yearsOwned != null && (
                      <p className="mt-1 text-muted-foreground">{property.yearsOwned} years owned</p>
                    )}
                  </div>
                </div>
              )}

              {(property.lastSaleDate || property.lastSalePrice) && (
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Transfer History
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailStat
                      label="Last Sale"
                      value={property.lastSaleDate ? new Date(property.lastSaleDate).toLocaleDateString() : "—"}
                    />
                    <DetailStat label="Sale Price" value={formatCurrency(property.lastSalePrice)} />
                  </div>
                </div>
              )}

              {(property.loanBalance || property.loanRate) && (
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Landmark className="h-4 w-4 text-primary" />
                    Loan Details
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailStat label="Balance" value={formatCurrency(property.loanBalance)} />
                    <DetailStat label="Rate" value={property.loanRate ? `${property.loanRate}%` : "—"} />
                  </div>
                </div>
              )}

              {(property.assessedValue || property.annualTaxes) && (
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Tax Information
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailStat label="Assessed Value" value={formatCurrency(property.assessedValue)} />
                    <DetailStat label="Annual Taxes" value={formatCurrency(property.annualTaxes)} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href={`/app/analyzer?address=${encodeURIComponent(property.address)}&price=${property.value || 0}`}>
                <Button variant="outline" className="w-full rounded-xl">
                  <Calculator className="mr-2 h-4 w-4" />
                  Analyze Deal
                </Button>
              </Link>
              <Link
                href={`/apply?address=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`)}`}
              >
                <Button className="w-full rounded-xl">
                  Apply for Capital
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
