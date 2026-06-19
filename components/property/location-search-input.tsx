"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AutocompletePrediction } from "@/lib/property/types"

interface LocationSearchInputProps {
  onSelect: (suggestion: AutocompletePrediction) => void
  placeholder?: string
  buttonLabel?: string
  compact?: boolean
  initialValue?: string
}

export function LocationSearchInput({
  onSelect,
  placeholder = "Search city or state — select from suggestions",
  buttonLabel = "Search Properties",
  compact = false,
  initialValue = "",
}: LocationSearchInputProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<AutocompletePrediction | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lockedRef = useRef(Boolean(initialValue))
  const sessionTokenRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
  )

  useEffect(() => {
    setQuery(initialValue)
    if (initialValue) {
      lockedRef.current = true
      setShowSuggestions(false)
      setSuggestions([])
      setSelected({
        placeId: "initial",
        description: initialValue,
        searchQuery: initialValue,
        mainText: initialValue.split(",")[0]?.trim() || initialValue,
        secondaryText: initialValue.split(",").slice(1).join(",").trim() || undefined,
      })
    } else {
      lockedRef.current = false
      setSelected(null)
    }
  }, [initialValue])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input || input.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(
        `/api/autocomplete?input=${encodeURIComponent(input)}&sessionToken=${encodeURIComponent(sessionTokenRef.current)}`,
      )
      const data = await res.json()
      setSuggestions(data.predictions || [])
      setHighlightedIndex(-1)
      if (!lockedRef.current) {
        setShowSuggestions(Boolean(data.predictions?.length))
      }
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (lockedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchSuggestions])

  const selectSuggestion = useCallback((suggestion: AutocompletePrediction) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    lockedRef.current = true
    setQuery(suggestion.description)
    setSelected(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }, [])

  const submit = () => {
    const suggestion =
      highlightedIndex >= 0 && suggestions[highlightedIndex]
        ? suggestions[highlightedIndex]
        : selected

    if (!suggestion) return

    selectSuggestion(suggestion)
    sessionTokenRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}`
    onSelect(suggestion)
  }

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-lg ${
          compact ? "p-2" : "p-2.5"
        }`}
      >
        <MapPin className={`${compact ? "h-4 w-4 ml-2" : "h-5 w-5 ml-3"} text-primary shrink-0`} />
        <input
          value={query}
          onChange={(e) => {
            lockedRef.current = false
            setQuery(e.target.value)
            setSelected(null)
            setHighlightedIndex(-1)
            setShowSuggestions(false)
          }}
          onFocus={() => {
            if (!lockedRef.current && suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              if (!suggestions.length) return
              setShowSuggestions(true)
              setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              if (!suggestions.length) return
              setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
            }
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 ${
            compact ? "text-sm py-2" : "text-base py-3"
          }`}
          autoComplete="off"
        />
        <Button
          type="button"
          onClick={submit}
          disabled={!selected && highlightedIndex < 0}
          className={`${compact ? "h-10 px-5" : "h-12 px-7"} shrink-0 rounded-xl`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          {buttonLabel}
        </Button>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            {suggestions.map((suggestion, idx) => (
              <button
                key={suggestion.placeId}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectSuggestion(suggestion)}
                className={`flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left last:border-0 ${
                  highlightedIndex === idx ? "bg-primary/10" : "hover:bg-secondary/50"
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{suggestion.mainText}</p>
                  {suggestion.secondaryText && (
                    <p className="truncate text-xs text-muted-foreground">{suggestion.secondaryText}</p>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
