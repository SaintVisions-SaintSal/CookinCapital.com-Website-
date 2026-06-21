import {
  FAVORITES_COOKIE,
  MAX_COOKIE_FAVORITES,
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_COOKIE,
  SEARCH_RESULTS_CACHE_KEY,
} from "@/lib/property/constants"
import { propertyStorageId } from "@/lib/property/format"
import type { PropertyResult, RecentSearchItem, SavedPropertyItem } from "@/lib/property/types"

interface PropertySearchCache {
  paramsKey: string
  results: PropertyResult[]
  resultCount: number
}

function readCookieJson<T>(name: string, fallback: T): T {
  if (typeof document === "undefined") return fallback
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=")
    if (!raw) return fallback
    return JSON.parse(decodeURIComponent(raw)) as T
  } catch {
    return fallback
  }
}

function writeCookieJson(name: string, value: unknown, days = 365) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; expires=${expires}; SameSite=Lax`
}

export function getRecentSearchesFromCookie(): RecentSearchItem[] {
  return readCookieJson<RecentSearchItem[]>(RECENT_SEARCHES_COOKIE, [])
}

export function addRecentSearchToCookie(item: Omit<RecentSearchItem, "id" | "searchedAt">) {
  const existing = getRecentSearchesFromCookie().filter((entry) => entry.searchQuery !== item.searchQuery)
  const next: RecentSearchItem[] = [
    {
      ...item,
      id: crypto.randomUUID(),
      searchedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_RECENT_SEARCHES)
  writeCookieJson(RECENT_SEARCHES_COOKIE, next)
  return next
}

export function getFavoritesFromCookie(): SavedPropertyItem[] {
  return readCookieJson<SavedPropertyItem[]>(FAVORITES_COOKIE, [])
}

export function saveFavoriteToCookie(property: PropertyResult): SavedPropertyItem[] {
  const id = propertyStorageId(property)
  const key = property.radarId || id

  const item: SavedPropertyItem = {
    id,
    radarId: key,
    address: property.address,
    city: property.city,
    state: property.state,
    zip: property.zip,
    value: property.value,
    imageUrl: property.imageUrl,
    savedAt: new Date().toISOString(),
  }

  const next = [item, ...getFavoritesFromCookie().filter((f) => f.radarId !== key)].slice(
    0,
    MAX_COOKIE_FAVORITES,
  )
  writeCookieJson(FAVORITES_COOKIE, next)
  return next
}

export function removeFavoriteFromCookie(radarId: string): SavedPropertyItem[] {
  const next = getFavoritesFromCookie().filter((f) => f.radarId !== radarId)
  writeCookieJson(FAVORITES_COOKIE, next)
  return next
}

export function isFavoriteInCookie(radarId: string) {
  return getFavoritesFromCookie().some((f) => f.radarId === radarId)
}

export function readPropertySearchCache(paramsKey: string): PropertySearchCache | null {
  if (typeof sessionStorage === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SEARCH_RESULTS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PropertySearchCache
    return parsed.paramsKey === paramsKey ? parsed : null
  } catch {
    return null
  }
}

export function writePropertySearchCache(
  paramsKey: string,
  results: PropertyResult[],
  resultCount: number,
) {
  if (typeof sessionStorage === "undefined") return
  try {
    sessionStorage.setItem(
      SEARCH_RESULTS_CACHE_KEY,
      JSON.stringify({ paramsKey, results, resultCount }),
    )
  } catch {
    // Ignore quota errors
  }
}

export function propertyToSavedItem(property: PropertyResult): SavedPropertyItem {
  return {
    id: propertyStorageId(property),
    radarId: property.radarId || propertyStorageId(property),
    address: property.address,
    city: property.city,
    state: property.state,
    zip: property.zip,
    value: property.value,
    imageUrl: property.imageUrl,
    savedAt: new Date().toISOString(),
  }
}
