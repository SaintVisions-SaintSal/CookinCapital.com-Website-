"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, CheckCircle2, TrendingUp, MapPin, Home, AlertCircle } from "lucide-react"
import type { DealData } from "./types"
import { ANALYZER_PROPERTY_TYPES, mapToAnalyzerPropertyType } from "@/lib/analyzer/property-mapping"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
  autoLookup?: boolean
  onAutoLookupComplete?: () => void
  radarId?: string
}

interface PropertyValuation {
  price: number
  priceRangeLow: number
  priceRangeHigh: number
  latitude?: number
  longitude?: number
  source?: string
  property?: {
    address?: string
    city?: string
    state?: string
    zip?: string
    beds?: number
    baths?: number
    sqft?: number
    yearBuilt?: number
    lotSize?: number
    propertyType?: string
    value?: number
    assessedValue?: number
    annualTaxes?: number
  }
  comparables: Array<{
    formattedAddress: string
    city: string
    state: string
    price?: number
    squareFootage?: number
    bedrooms?: number
    bathrooms?: number
  }>
}

export function AnalyzerPropertyInfo({
  data,
  onChange,
  autoLookup = false,
  onAutoLookupComplete,
  radarId,
}: Props) {
  const [isSearching, setIsSearching] = useState(false)
  const [valuation, setValuation] = useState<PropertyValuation | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const applyPropertyDetails = (property: PropertyValuation["property"], price?: number) => {
    if (!property) return

    onChange({
      address: property.address || data.address,
      city: property.city || data.city,
      state: property.state || data.state,
      zip: property.zip || data.zip,
      bedrooms: property.beds || data.bedrooms,
      bathrooms: property.baths || data.bathrooms,
      sqft: property.sqft || data.sqft,
      yearBuilt: property.yearBuilt || data.yearBuilt,
      lotSize: property.lotSize || data.lotSize,
      propertyType: mapToAnalyzerPropertyType(property.propertyType) || data.propertyType,
      arv: price || property.value || data.arv,
      monthlyTaxes: property.annualTaxes ? Math.round(property.annualTaxes / 12) : data.monthlyTaxes,
    })
  }

  const handlePropertySearch = async () => {
    if (!data.address || !data.city || !data.state) {
      setSearchError("Please enter address, city, and state")
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setValuation(null)

    try {
      const params = new URLSearchParams({
        address: data.address,
        city: data.city,
        state: data.state,
      })
      if (data.zip) params.set("zip", data.zip)
      if (radarId) params.set("radarId", radarId)

      const response = await fetch(`/api/analyzer/valuation?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Property lookup failed")
      }

      setValuation(result)
      applyPropertyDetails(result.property, result.price)
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Failed to fetch property data")
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (!autoLookup || !data.address || !data.city || !data.state) return
    handlePropertySearch().finally(() => onAutoLookupComplete?.())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLookup])

  const applyValuationAsARV = () => {
    if (valuation?.price) {
      onChange({ arv: valuation.price })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Property Information
            </CardTitle>
            <Badge variant="outline" className="border-primary/30 text-primary">
              PropertyRadar
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Street address"
              className="bg-secondary border-0"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="City"
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="ST"
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={data.zip}
                onChange={(e) => onChange({ zip: e.target.value })}
                placeholder="ZIP"
                className="bg-secondary border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={data.propertyType || undefined}
              onValueChange={(value) => onChange({ propertyType: value })}
            >
              <SelectTrigger className="bg-secondary border-0">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {ANALYZER_PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={data.bedrooms || ""}
                onChange={(e) => onChange({ bedrooms: Number.parseInt(e.target.value) || 0 })}
                placeholder="—"
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                value={data.bathrooms || ""}
                onChange={(e) => onChange({ bathrooms: Number.parseFloat(e.target.value) || 0 })}
                placeholder="—"
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Square Feet</Label>
              <Input
                id="sqft"
                type="number"
                value={data.sqft || ""}
                onChange={(e) => onChange({ sqft: Number.parseInt(e.target.value) || 0 })}
                placeholder="—"
                className="bg-secondary border-0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={data.yearBuilt || ""}
                onChange={(e) => onChange({ yearBuilt: Number.parseInt(e.target.value) || 0 })}
                placeholder="—"
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lotSize">Lot Size (acres)</Label>
              <Input
                id="lotSize"
                type="number"
                step="0.01"
                value={data.lotSize || ""}
                onChange={(e) => onChange({ lotSize: Number.parseFloat(e.target.value) || 0 })}
                placeholder="—"
                className="bg-secondary border-0"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <Button
              onClick={handlePropertySearch}
              disabled={isSearching || !data.address || !data.city || !data.state}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pulling live property data...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Live Property Valuation
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Pulls property details from PropertyRadar and enriches with RentCast AVM when available
            </p>
          </div>

          {searchError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Search Failed</p>
                <p className="text-sm text-muted-foreground">{searchError}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {valuation && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Live Property Valuation
              {valuation.source ? (
                <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
                  {valuation.source}
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                <p className="text-sm text-muted-foreground mb-1">Low Estimate</p>
                <p className="text-xl font-bold text-foreground">${valuation.priceRangeLow.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-sm text-primary mb-1">Estimated Value</p>
                <p className="text-2xl font-bold text-primary">${valuation.price.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                <p className="text-sm text-muted-foreground mb-1">High Estimate</p>
                <p className="text-xl font-bold text-foreground">${valuation.priceRangeHigh.toLocaleString()}</p>
              </div>
            </div>

            <Button
              onClick={applyValuationAsARV}
              variant="outline"
              className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Use ${valuation.price.toLocaleString()} as ARV
            </Button>

            {valuation.comparables?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Comparable Properties ({valuation.comparables.length})
                </h4>
                <div className="space-y-2">
                  {valuation.comparables.map((comp, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-card border border-border/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{comp.formattedAddress}</p>
                        <p className="text-xs text-muted-foreground">
                          {comp.city}, {comp.state}
                          {comp.bedrooms && comp.bathrooms && ` • ${comp.bedrooms}bd/${comp.bathrooms}ba`}
                          {comp.squareFootage && ` • ${comp.squareFootage.toLocaleString()} sqft`}
                        </p>
                      </div>
                      {comp.price ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          ${comp.price.toLocaleString()}
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
