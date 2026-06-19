/**
 * Parse a free-text location query into PropertyRadar search params.
 */
export function parseAddressQuery(input: string): {
  address?: string
  city?: string
  state?: string
  zip?: string
  hasStreetNumber: boolean
} {
  const trimmed = input.trim()
  if (!trimmed) return { hasStreetNumber: false }

  const hasStreetNumber = /^\d+\s/.test(trimmed)

  // Zip only
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return { zip: trimmed.slice(0, 5), state: "CA", hasStreetNumber: false }
  }

  // Comma-separated: "123 Main St, Los Angeles, CA 90001" or "Los Angeles, CA, USA"
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean)

    // Google Places format: "City, ST, USA"
    if (parts[parts.length - 1]?.toUpperCase() === "USA") {
      const statePart = parts.length >= 3 ? parts[parts.length - 2] : undefined
      const stateMatch = statePart?.match(/^([A-Za-z]{2})$/)
      const cityParts = parts.slice(0, Math.max(1, parts.length - (stateMatch ? 2 : 1)))

      if (cityParts[0] && /^\d+\s/.test(cityParts[0])) {
        return {
          address: cityParts[0],
          city: cityParts[1] ? titleCase(cityParts[1]) : undefined,
          state: stateMatch?.[1]?.toUpperCase() || "CA",
          hasStreetNumber: true,
        }
      }

      return {
        city: titleCase(cityParts.join(", ")),
        state: stateMatch?.[1]?.toUpperCase() || "CA",
        hasStreetNumber: false,
      }
    }

    if (parts.length >= 3) {
      const stateZip = parts[parts.length - 1]
      const match = stateZip.match(/^([A-Za-z]{2})\s*(\d{5})?/)
      return {
        address: parts[0],
        city: parts[parts.length - 2],
        state: match?.[1]?.toUpperCase() || "CA",
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
      return {
        address: parts[0],
        city: parts[1],
        state: "CA",
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

  if (hasStreetNumber) {
    return { address: trimmed, state: "CA", hasStreetNumber: true }
  }

  // Plain city/area name
  return { city: titleCase(trimmed), state: "CA", hasStreetNumber: false }
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function formatApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw)
    if (parsed.error) return String(parsed.error)
    if (parsed.message) return String(parsed.message)
  } catch {
    // not JSON
  }
  return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw
}
