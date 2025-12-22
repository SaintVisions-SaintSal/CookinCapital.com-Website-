"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Check } from "lucide-react"

interface SignaturePadProps {
  onSignatureChange: (signature: string | null, timestamp: string | null) => void
  label?: string
  required?: boolean
}

export function SignaturePad({ onSignatureChange, label = "Signature", required = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up high-DPI canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Set drawing styles
    ctx.strokeStyle = "#C9A227"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Fill background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw signature line
    ctx.beginPath()
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()

    // Reset stroke style for signature
    ctx.strokeStyle = "#C9A227"
    ctx.lineWidth = 2.5
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.strokeStyle = "#C9A227"
    ctx.lineWidth = 2.5
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Check if there's actual drawing (not just blank)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setHasSignature(true)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()

    // Clear and redraw background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Redraw signature line
    ctx.beginPath()
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()

    // Reset stroke style
    ctx.strokeStyle = "#C9A227"
    ctx.lineWidth = 2.5

    setHasSignature(false)
    setSignedAt(null)
    onSignatureChange(null, null)
  }

  const confirmSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL("image/png")
    const timestamp = new Date().toISOString()
    const formattedTime = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    })

    setSignedAt(formattedTime)
    onSignatureChange(signatureData, timestamp)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {signedAt && (
          <span className="text-xs text-primary flex items-center gap-1">
            <Check className="h-3 w-3" />
            Signed
          </span>
        )}
      </div>

      <div className="relative rounded-lg border border-border overflow-hidden bg-[#1a1a1a]">
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute bottom-2 left-4 text-xs text-muted-foreground pointer-events-none">
          Sign above the line
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="gap-1.5 bg-transparent">
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </Button>

        {hasSignature && !signedAt && (
          <Button type="button" size="sm" onClick={confirmSignature} className="gap-1.5 bg-primary hover:bg-primary/90">
            <Check className="h-3.5 w-3.5" />
            Confirm Signature
          </Button>
        )}
      </div>

      {signedAt && (
        <div className="rounded-lg bg-secondary/50 p-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Electronically signed on:</span>
          </div>
          <div className="text-foreground font-medium mt-1">{signedAt}</div>
        </div>
      )}
    </div>
  )
}
