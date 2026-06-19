/**
 * Parse a free-text location query into PropertyRadar search params.
 */
import { resolveStateCode, resolveStateLabel } from "@/lib/us-states"

export function parseAddressQuery(input: string): {
  address?: string
  city?: string
  state?: string
  zip?: string
  county?: string
  hasStreetNumber: boolean
  stateOnly?: boolean
  countyOnly?: boolean
} {
  const trimmed = input.trim()
  if (!trimmed) return { hasStreetNumber: false }

  const hasStreetNumber = /^\d+\s/.test(trimmed)

  // Zip only
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return { zip: trimmed.slice(0, 5), hasStreetNumber: false }
  }

  // County: "Los Angeles County, CA"
  const countyMatch = trimmed.match(/^(.+?\s+county)(?:,\s*([A-Za-z]{2}))?(?:,\s*USA)?$/i)
  if (countyMatch) {
    const stateCode = countyMatch[2]?.toUpperCase() || resolveStateCode(countyMatch[1])
    return {
      county: countyMatch[1].replace(/\s+county$/i, "").trim(),
      state: stateCode,
      countyOnly: true,
      hasStreetNumber: false,
    }
  }

  // Comma-separated: "123 Main St, Los Angeles, CA 90001" or "Los Angeles, CA, USA"
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean)

    // Google Places format ending in USA
    if (parts[parts.length - 1]?.toUpperCase() === "USA") {
      // "Texas, USA" or "California, USA" — whole-state search
      if (parts.length === 2) {
        const stateCode = resolveStateCode(parts[0])
        if (stateCode) {
          return { state: stateCode, stateOnly: true, hasStreetNumber: false }
        }
      }

      const statePart = parts.length >= 3 ? parts[parts.length - 2] : undefined
      const stateFromAbbr = statePart?.match(/^([A-Za-z]{2})$/)?.[1]?.toUpperCase()
      const stateFromName = statePart ? resolveStateCode(statePart) : undefined
      const stateCode = stateFromAbbr || stateFromName
      const cityParts = parts.slice(0, Math.max(1, parts.length - (stateCode ? 2 : 1)))

      if (cityParts[0] && /^\d+\s/.test(cityParts[0])) {
        return {
          address: cityParts[0],
          city: cityParts[1] ? titleCase(cityParts[1]) : undefined,
          state: stateCode,
          hasStreetNumber: true,
        }
      }

      if (stateCode) {
        return {
          city: titleCase(cityParts.join(", ")),
          state: stateCode,
          hasStreetNumber: false,
        }
      }

      // "Some Region, USA" with no state code — treat region as city, no default state
      return {
        city: titleCase(parts[0]),
        hasStreetNumber: false,
      }
    }

    if (parts.length >= 3) {
      const stateZip = parts[parts.length - 1]
      const match = stateZip.match(/^([A-Za-z]{2})\s*(\d{5})?/)
      return {
        address: parts[0],
        city: parts[parts.length - 2],
        state: match?.[1]?.toUpperCase(),
        zip: match?.[2],
        hasStreetNumber,
      }
    }
    if (parts.length === 2) {
      const stateMatch = parts[1].match(/^([A-Za-z]{2})\s*(\d{5})?$/)
      if (stateMatch) {
        return {
          city: parts[0],
          state: stateMatch[1].toUpperCase(),
          zip: stateMatch[2],
          hasStreetNumber: false,
        }
      }
      const stateFromName = resolveStateCode(parts[1])
      if (stateFromName) {
        return {
          city: titleCase(parts[0]),
          state: stateFromName,
          hasStreetNumber: false,
        }
      }
      return {
        address: parts[0],
        city: parts[1],
        hasStreetNumber,
      }
    }
  }

  // "City ST" without comma: "Los Angeles CA"
  const cityStateMatch = trimmed.match(/^(.+?)\s+([A-Za-z]{2})$/)
  if (cityStateMatch && !hasStreetNumber) {
    return {
      city: titleCase(cityStateMatch[1]),
      state: cityStateMatch[2].toUpperCase(),
      hasStreetNumber: false,
    }
  }

  // Whole state name: "Texas" or "New York State"
  const stateLabel = resolveStateLabel(trimmed)
  if (stateLabel) {
    return { state: stateLabel.state, stateOnly: true, hasStreetNumber: false }
  }

  if (hasStreetNumber) {
    return { address: trimmed, hasStreetNumber: true }
  }

  // Plain city/area name — no default state; geocoding should resolve it
  return { city: titleCase(trimmed), hasStreetNumber: false }
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function formatApiError(raw: string): string {
  if (/invalid.?token|invalid access token|401/i.test(raw)) {
    return "PropertyRadar API key is invalid or expired. Update PROPERTY_RADAR_API_TOKEN in .env.local and restart the dev server."
  }

  if (/timeout|fetch failed|UND_ERR_CONNECT_TIMEOUT|ETIMEDOUT|temporarily unreachable/i.test(raw)) {
    return "PropertyRadar is taking longer than usual to respond. Please try again in a moment."
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed.error) return String(parsed.error)
    if (parsed.message) return String(parsed.message)
  } catch {
    // not JSON
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.error) return String(parsed.error)
      if (parsed.message) return String(parsed.message)
    } catch {
      // ignore
    }
  }

  return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw
}

export function getPropertySearchErrorStatus(message: string): number {
  if (/invalid.?token|invalid access token|401/i.test(message)) return 503
  if (/timeout|fetch failed|UND_ERR_CONNECT_TIMEOUT|ETIMEDOUT/i.test(message)) return 503
  return 502
}
