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
      if (!property.radarId) return

      const currentlySaved = authenticated
        ? favorites.some((f) => f.radarId === property.radarId)
        : isFavoriteInCookie(property.radarId)

      if (authenticated) {
        if (currentlySaved) {
          await fetch(`/api/property-saved?radarId=${encodeURIComponent(property.radarId)}`, {
            method: "DELETE",
          })
        } else {
          await fetch("/api/property-saved", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ property }),
          })
        }
        await refresh()
        return
      }

      if (currentlySaved) {
        setFavorites(removeFavoriteFromCookie(property.radarId))
      } else {
        setFavorites(saveFavoriteToCookie(property))
      }
    },
    [authenticated, favorites, refresh],
  )

  const isFavorite = useCallback(
    (radarId?: string) => {
      if (!radarId) return false
      return favorites.some((f) => f.radarId === radarId)
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
