"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

declare global {
  interface Window {
    vbpx?: (action: string, event?: string) => void
  }
}

export function VibePageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Fire page_view on route changes (SPA navigation)
    if (typeof window !== "undefined" && window.vbpx) {
      window.vbpx("event", "page_view")
    }
  }, [pathname])

  return null
}
