import { resolveStateCode, resolveStateLabel } from "@/lib/us-states"

export type PlaceLocationType = "city" | "state" | "county" | "zip" | "address" | "place"

export interface FormattedPlacePrediction {
  placeId: string
  /** Clean label shown in the input after selection */
  description: string
  /** Query sent to PropertyRadar / geocoding */
  searchQuery: string
  mainText: string
  secondaryText?: string
  locationType: PlaceLocationType
}

interface GooglePredictionTerm {
  offset: number
  value: string
}

interface GooglePrediction {
  place_id: string
  description: string
  terms?: GooglePredictionTerm[]
  types?: string[]
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
}

function stripCountry(terms: string[]): string[] {
  return terms.filter((term) => !/^(USA|United States)$/i.test(term.trim()))
}

export function formatPlacePrediction(p: GooglePrediction): FormattedPlacePrediction {
  const terms = stripCountry((p.terms ?? []).map((t) => t.value))

  // Whole state: "Texas, USA" or "New York State, USA"
  if (terms.length === 1) {
    const stateLabel = resolveStateLabel(terms[0])
    if (stateLabel) {
      return {
        placeId: p.place_id,
        description: stateLabel.displayName,
        searchQuery: stateLabel.displayName,
        mainText: stateLabel.displayName,
        secondaryText: "State",
        locationType: "state",
      }
    }
  }

  // Ends with two-letter state: "City, ST" or "County, ST" or "ZIP, City, ST"
  const lastTerm = terms[terms.length - 1]
  if (lastTerm && lastTerm.length === 2 && /^[A-Za-z]{2}$/.test(lastTerm)) {
    const state = lastTerm.toUpperCase()
    const localityParts = terms.slice(0, -1)
    const locality = localityParts.join(", ")
    const formatted = `${locality}, ${state}`

    if (/^\d{5}(-\d{4})?$/.test(localityParts[0])) {
      return {
        placeId: p.place_id,
        description: formatted,
        searchQuery: formatted,
        mainText: localityParts[0],
        secondaryText: [localityParts.slice(1).join(", "), state].filter(Boolean).join(", "),
        locationType: "zip",
      }
    }

    if (/county$/i.test(locality)) {
      return {
        placeId: p.place_id,
        description: formatted,
        searchQuery: formatted,
        mainText: locality.replace(/\s+county$/i, ""),
        secondaryText: `${state} · County`,
        locationType: "county",
      }
    }

    const looksLikeAddress = /^\d+\s/.test(localityParts[0])
    return {
      placeId: p.place_id,
      description: formatted,
      searchQuery: formatted,
      mainText: looksLikeAddress ? localityParts[0] : locality,
      secondaryText: looksLikeAddress
        ? [localityParts.slice(1).join(", "), state].filter(Boolean).join(", ")
        : state,
      locationType: looksLikeAddress ? "address" : "city",
    }
  }

  // Fallback — strip trailing USA from Google's description
  const description = (p.description || terms.join(", ")).replace(/,\s*USA$/i, "").trim()

  if (p.types?.includes("administrative_area_level_1")) {
    const stateLabel = resolveStateLabel(description)
    if (stateLabel) {
      return {
        placeId: p.place_id,
        description: stateLabel.displayName,
        searchQuery: stateLabel.displayName,
        mainText: stateLabel.displayName,
        secondaryText: "State",
        locationType: "state",
      }
    }
  }

  return {
    placeId: p.place_id,
    description,
    searchQuery: description,
    mainText: p.structured_formatting?.main_text?.replace(/,\s*USA$/i, "") || terms[0] || description,
    secondaryText: p.structured_formatting?.secondary_text?.replace(/,\s*USA$/i, "") || terms.slice(1).join(", "),
    locationType: "place",
  }
}
