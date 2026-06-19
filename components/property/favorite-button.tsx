"use client"

import { Heart } from "lucide-react"

interface FavoriteButtonProps {
  active: boolean
  onClick: () => void
  size?: "sm" | "md"
}

export function FavoriteButton({ active, onClick, size = "md" }: FavoriteButtonProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5"

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`${dim} inline-flex items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm transition-colors hover:bg-background`}
      aria-label={active ? "Remove favorite" : "Save favorite"}
    >
      <Heart className={`${icon} ${active ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
    </button>
  )
}
