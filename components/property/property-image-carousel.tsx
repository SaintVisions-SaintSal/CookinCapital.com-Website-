"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PropertyResult } from "@/lib/property/types"

interface PropertyImageCarouselProps {
  property: PropertyResult
}

function buildSlides(property: PropertyResult) {
  const slides: { src: string; label: string }[] = []

  if (property.latitude != null && property.longitude != null) {
    const base = `/api/property-image?lat=${property.latitude}&lng=${property.longitude}`
    ;[
      { heading: 0, label: "Street View" },
      { heading: 90, label: "Street View · East" },
      { heading: 180, label: "Street View · South" },
      { heading: 270, label: "Street View · West" },
    ].forEach(({ heading, label }) => {
      slides.push({ src: `${base}&heading=${heading}`, label })
    })
    slides.push({ src: `${base}&view=satellite`, label: "Satellite View" })
  } else if (property.imageUrl) {
    slides.push({ src: property.imageUrl, label: "Property View" })
  }

  return slides
}

export function PropertyImageCarousel({ property }: PropertyImageCarouselProps) {
  const slides = useMemo(() => buildSlides(property), [property])
  const [index, setIndex] = useState(0)

  if (!slides.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-secondary/30 md:h-[420px]">
        <p className="text-sm text-muted-foreground">No imagery available for this property</p>
      </div>
    )
  }

  const current = slides[index]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-80 md:h-[420px]">
        <img src={current.src} alt={current.label} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-sm font-medium text-white">{current.label}</p>
        </div>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {slides.map((slide, idx) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setIndex(idx)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                idx === index ? "border-primary" : "border-border"
              }`}
            >
              <img src={slide.src} alt={slide.label} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
