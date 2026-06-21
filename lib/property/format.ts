import type { PropertyResult } from "@/lib/property/types"
import { PROPERTY_TYPES } from "@/lib/property/constants"

export function formatCurrency(num: number | undefined, options?: { empty?: string }) {
  const empty = options?.empty ?? "—"
  if (num == null || num <= 0) return empty
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num.toLocaleString()}`
}

const PROPERTY_TYPE_LABELS = Object.fromEntries(
  PROPERTY_TYPES.filter((t) => t.value).map((t) => [t.value, t.label]),
) as Record<string, string>

const PTYPE_LABELS: Record<string, string> = {
  SFR: "Single Family",
  MFR: "Multi-Family",
  CND: "Condo / Townhouse",
  COM: "Commercial",
  VL: "Vacant Land",
  MH: "Mobile / Manufactured",
  APT: "Apartment",
  LND: "Land",
  IND: "Industrial",
  UTL: "Utility",
  TRA: "Transportation",
  ...PROPERTY_TYPE_LABELS,
}

export function formatPropertyType(code?: string) {
  if (!code) return "—"
  return PTYPE_LABELS[code.toUpperCase()] || code
}

export function getDistressBadges(property: PropertyResult) {
  const badges: { label: string; color: string }[] = []
  if (property.foreclosureStatus) {
    badges.push({ label: `Foreclosure: ${property.foreclosureStatus}`, color: "bg-red-500/15 text-red-400" })
  }
  if (property.inTaxDelinquency || (property.taxDefaultYears && property.taxDefaultYears > 0)) {
    badges.push({ label: "Tax Delinquent", color: "bg-orange-500/15 text-orange-400" })
  }
  if (property.inBankruptcy) {
    badges.push({
      label: `Bankruptcy${property.bankruptcyChapter ? ` Ch.${property.bankruptcyChapter}` : ""}`,
      color: "bg-red-500/15 text-red-400",
    })
  }
  if (property.inDivorce) badges.push({ label: "Divorce", color: "bg-purple-500/15 text-purple-400" })
  if (property.isVacant) badges.push({ label: "Vacant", color: "bg-yellow-500/15 text-yellow-400" })
  if (property.isDeceased) badges.push({ label: "Deceased Owner", color: "bg-gray-500/15 text-gray-400" })
  if (property.listedForSale) badges.push({ label: "Listed", color: "bg-green-500/15 text-green-400" })
  return badges
}

export function propertySummaryLine(property: PropertyResult) {
  return `${property.address}, ${property.city}, ${property.state} ${property.zip}`.replace(/\s+/g, " ").trim()
}

export function propertyStorageId(property: Pick<PropertyResult, "radarId" | "address" | "city" | "state" | "zip">) {
  return property.radarId || `${property.address}-${property.city}-${property.state}-${property.zip}`.toLowerCase()
}
