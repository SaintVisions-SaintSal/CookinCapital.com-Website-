"use client"

import { useCallback, useEffect, useState } from "react"
import type { PropertyResult, RecentSearchItem, SavedPropertyItem } from "@/lib/property/types"
import {
  addRecentSearchToCookie,
  getFavoritesFromCookie,
  getRecentSearchesFromCookie,
  isFavoriteInCookie,
  removeFavoriteFromCookie,
  saveFavoriteToCookie,
} from "@/lib/property/storage"
import { favoriteKey } from "@/lib/property/urls"

export function usePropertySaved() {
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])
  const [favorites, setFavorites] = useState<SavedPropertyItem[]>([])
  const [authenticated, setAuthenticated] = useState(false)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    setRecentSearches(getRecentSearchesFromCookie())

    try {
      const res = await fetch("/api/property-saved")
      const data = await res.json()
      if (data.authenticated && Array.isArray(data.favorites)) {
        setAuthenticated(true)
        setFavorites(data.favorites)
      } else {
        setAuthenticated(false)
        setFavorites(getFavoritesFromCookie())
      }
    } catch {
      setFavorites(getFavoritesFromCookie())
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const recordRecentSearch = useCallback((label: string, searchQuery: string) => {
    const next = addRecentSearchToCookie({ label, searchQuery })
    setRecentSearches(next)
  }, [])

  const toggleFavorite = useCallback(
    async (property: PropertyResult) => {
      const key = favoriteKey(property)

      const currentlySaved = authenticated
        ? favorites.some((f) => f.radarId === key)
        : isFavoriteInCookie(key)

      if (authenticated) {
        if (!property.radarId) {
          // Server favorites require a PropertyRadar ID
          if (currentlySaved) {
            setFavorites(removeFavoriteFromCookie(key))
          } else {
            setFavorites(saveFavoriteToCookie(property))
          }
          return
        }

        const res = currentlySaved
          ? await fetch(`/api/property-saved?radarId=${encodeURIComponent(property.radarId)}`, {
              method: "DELETE",
            })
          : await fetch("/api/property-saved", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ property }),
            })

        if (!res.ok) {
          console.error("[favorites] save failed:", await res.text())
          return
        }

        await refresh()
        return
      }

      if (currentlySaved) {
        setFavorites(removeFavoriteFromCookie(key))
      } else {
        setFavorites(saveFavoriteToCookie(property))
      }
    },
    [authenticated, favorites, refresh],
  )

  const isFavorite = useCallback(
    (key?: string) => {
      if (!key) return false
      return favorites.some((f) => f.radarId === key)
    },
    [favorites],
  )

  return {
    ready,
    authenticated,
    recentSearches,
    favorites,
    recordRecentSearch,
    toggleFavorite,
    isFavorite,
    refresh,
  }
}
