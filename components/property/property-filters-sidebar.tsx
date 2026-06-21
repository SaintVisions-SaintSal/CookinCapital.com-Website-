"use client"

import { Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PROPERTY_TYPES } from "@/lib/property/constants"
import type { PropertySearchFilters } from "@/lib/property/types"

interface PropertyFiltersSidebarProps {
  filters: PropertySearchFilters
  onChange: (filters: PropertySearchFilters) => void
  onApply: () => void
  onReset: () => void
  loading?: boolean
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  )
}

export function PropertyFiltersSidebar({ filters, onChange, onApply, onReset, loading }: PropertyFiltersSidebarProps) {
  const update = <K extends keyof PropertySearchFilters>(key: K, value: PropertySearchFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <aside className="sticky top-24 h-fit rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">PropertyRadar Filters</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Property Type</Label>
          <select
            value={filters.propertyType}
            onChange={(e) => update("propertyType", e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value || "all"} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2 block text-xs text-muted-foreground">Distress Signals</Label>
          <div className="space-y-2">
            {[
              ["foreclosure", "Foreclosure"],
              ["taxDelinquent", "Tax Delinquent"],
              ["divorce", "Divorce"],
              ["vacant", "Vacant"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={filters[key as keyof PropertySearchFilters] as boolean}
                  onChange={(e) => update(key as keyof PropertySearchFilters, e.target.checked as never)}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-xs text-muted-foreground">Owner & Listing</Label>
          <div className="space-y-2">
            {[
              ["absenteeOwner", "Absentee Owner"],
              ["listedForSale", "Listed For Sale"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={filters[key as keyof PropertySearchFilters] as boolean}
                  onChange={(e) => update(key as keyof PropertySearchFilters, e.target.checked as never)}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FilterInput label="Beds Min" value={filters.bedsMin} onChange={(v) => update("bedsMin", v)} />
          <FilterInput label="Beds Max" value={filters.bedsMax} onChange={(v) => update("bedsMax", v)} />
          <FilterInput label="Baths Min" value={filters.bathsMin} onChange={(v) => update("bathsMin", v)} />
          <FilterInput label="Baths Max" value={filters.bathsMax} onChange={(v) => update("bathsMax", v)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FilterInput label="Value Min" value={filters.valueMin} onChange={(v) => update("valueMin", v)} />
          <FilterInput label="Value Max" value={filters.valueMax} onChange={(v) => update("valueMax", v)} />
          <FilterInput label="Equity % Min" value={filters.equityMin} onChange={(v) => update("equityMin", v)} />
          <FilterInput label="Equity % Max" value={filters.equityMax} onChange={(v) => update("equityMax", v)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FilterInput label="Year Min" value={filters.yearBuiltMin} onChange={(v) => update("yearBuiltMin", v)} />
          <FilterInput label="Year Max" value={filters.yearBuiltMax} onChange={(v) => update("yearBuiltMax", v)} />
        </div>

        <Button onClick={onApply} disabled={loading} className="w-full rounded-xl">
          {loading ? "Searching..." : "Apply Filters"}
        </Button>
      </div>
    </aside>
  )
}
