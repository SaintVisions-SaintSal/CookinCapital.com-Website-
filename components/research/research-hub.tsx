"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Send,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Building2,
  Calculator,
  DollarSign,
  MapPin,
  Search,
  Users,
  User,
  MessageCircle,
  Mic,
  Camera,
  Upload,
  X,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ===========================================
// SAINTSAL™ RESEARCH COMMAND CENTER
// Mobile-First • ChatGPT/Claude Feel
// With ElevenLabs Voice Integration
// ===========================================

interface FileAttachment {
  id: string
  file: File
  preview?: string
  type: "image" | "document"
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: Array<{ title: string; url: string }>
  images?: string[]
  attachments?: FileAttachment[]
}

const SAINTSAL_FEATURES = [
  "BUY / PASS / RENEGOTIATE signals",
  "A-F Deal Grading with ROI analysis",
  "Risk flags & next best moves",
  "Full audit trail of sources",
]

const QUICK_ACTIONS = [
  { label: "Properties", href: "/app/properties", icon: Building2, desc: "Find motivated sellers" },
  { label: "Analyzer", href: "/app/analyzer", icon: Calculator, desc: "Run the numbers" },
  { label: "Capital", href: "/capital", icon: DollarSign, desc: "Get funded fast" },
  {
    label: "Get SaintSal",
    href: "https://www.saintsal.ai/pricing",
    icon: Sparkles,
    desc: "Full access",
    external: true,
  },
]

const QUICK_PROMPTS = [
  "Search properties in LA",
  "Analyze a fix & flip deal",
  "Find property owner",
  "Compare loan options",
]

// Code block component
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-border/60 bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border-b border-border/40">
        <span className="text-xs text-muted-foreground font-mono">{language || "code"}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs">
        <code className="text-foreground/90 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

// Rich content renderer - mobile optimized
function RichContent({ content, sources }: { content: string; sources?: Array<{ title: string; url: string }> }) {
  const renderContent = () => {
    const lines = content.split("\n")
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeContent = ""
    let codeLanguage = ""
    let listItems: string[] = []
    let listType: "ul" | "ol" | null = null

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType === "ol" ? "ol" : "ul"
        elements.push(
          <ListTag
            key={elements.length}
            className={cn("my-2 ml-5 text-sm", listType === "ol" ? "list-decimal" : "list-disc")}
          >
            {listItems.map((item, i) => (
              <li key={i} className="text-foreground/90 mb-1">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>,
        )
        listItems = []
        listType = null
      }
    }

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(<CodeBlock key={elements.length} code={codeContent.trim()} language={codeLanguage} />)
          codeContent = ""
          codeLanguage = ""
          inCodeBlock = false
        } else {
          flushList()
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
        }
        return
      }

      if (inCodeBlock) {
        codeContent += line + "\n"
        return
      }

      if (line.startsWith("### ")) {
        flushList()
        elements.push(
          <h3 key={elements.length} className="text-base font-semibold text-foreground mt-3 mb-2">
            {renderInline(line.slice(4))}
          </h3>,
        )
        return
      }
      if (line.startsWith("## ")) {
        flushList()
        elements.push(
          <h2 key={elements.length} className="text-lg font-bold text-foreground mt-4 mb-2">
            {renderInline(line.slice(3))}
          </h2>,
        )
        return
      }
      if (line.startsWith("# ")) {
        flushList()
        elements.push(
          <h1 key={elements.length} className="text-xl font-bold text-foreground mt-4 mb-3">
            {renderInline(line.slice(2))}
          </h1>,
        )
        return
      }

      if (line.match(/^[-*]\s/)) {
        if (listType !== "ul") flushList()
        listType = "ul"
        listItems.push(line.slice(2))
        return
      }
      if (line.match(/^\d+\.\s/)) {
        if (listType !== "ol") flushList()
        listType = "ol"
        listItems.push(line.replace(/^\d+\.\s/, ""))
        return
      }

      if (line.startsWith("> ")) {
        flushList()
        elements.push(
          <blockquote
            key={elements.length}
            className="border-l-2 border-amber-500/50 pl-3 my-3 italic text-foreground/80 text-sm"
          >
            {renderInline(line.slice(2))}
          </blockquote>,
        )
        return
      }

      if (line.trim() === "") {
        flushList()
        return
      }

      flushList()
      elements.push(
        <p key={elements.length} className="text-foreground/90 mb-2 leading-relaxed text-sm">
          {renderInline(line)}
        </p>,
      )
    })

    flushList()
    return elements
  }

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`)/)
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1 py-0.5 bg-muted rounded text-xs font-mono text-amber-500">
            {part.slice(1, -1)}
          </code>
        )
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/)
      if (boldParts.length > 1) {
        return boldParts.map((bp, j) => {
          if (bp.startsWith("**") && bp.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-foreground">
                {bp.slice(2, -2)}
              </strong>
            )
          }
          return bp
        })
      }
      return part
    })
  }

  return (
    <div className="prose-invert max-w-none">
      {renderContent()}
      {sources && sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/40">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Sources
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {sources.slice(0, 4).map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 hover:bg-muted rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                {source.title?.slice(0, 20) || new URL(source.url).hostname}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (address: string) => void
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<
    Array<{
      address: string
      city: string
      state: string
      zip: string
      full: string
    }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        // Use Nominatim (OpenStreetMap) for free geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
        )
        const data = await response.json()

        const formatted = data
          .filter((item: any) => item.address)
          .map((item: any) => {
            const addr = item.address
            const street = [addr.house_number, addr.road].filter(Boolean).join(" ")
            const city = addr.city || addr.town || addr.village || addr.municipality || ""
            const state = addr.state || ""
            const zip = addr.postcode || ""

            return {
              address: street || item.display_name.split(",")[0],
              city,
              state,
              zip,
              full: `${street ? street + ", " : ""}${city}${city && state ? ", " : ""}${state}${zip ? " " + zip : ""}`,
            }
          })
          .filter((item: any) => item.city || item.address)

        setSuggestions(formatted)
        setShowDropdown(formatted.length > 0)
      } catch (error) {
        console.error("Geocoding error:", error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (suggestion: (typeof suggestions)[0]) => {
    setQuery(suggestion.full)
    setShowDropdown(false)
    onSelect(suggestion.full)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Enter address, city, state, or zip..."
          className="w-full h-14 pl-12 pr-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-base"
        />
        {isSearching ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 animate-spin" />
        ) : query.length > 0 ? (
          <button
            onClick={() => {
              setQuery("")
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            ×
          </button>
        ) : (
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl z-50"
        >
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSelect(suggestion)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#222] transition-colors text-left border-b border-[#222] last:border-0"
            >
              <MapPin className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{suggestion.address || suggestion.city}</p>
                <p className="text-xs text-gray-500 truncate">
                  {suggestion.city && suggestion.address ? `${suggestion.city}, ` : ""}
                  {suggestion.state} {suggestion.zip}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ResearchHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const processFiles = (files: File[]) => {
    const newAttachments: FileAttachment[] = files
      .filter((file) => file.type.startsWith("image/") || file.type === "application/pdf")
      .slice(0, 4) // Max 4 attachments
      .map((file) => {
        const attachment: FileAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          type: file.type.startsWith("image/") ? "image" : "document",
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          attachment.preview = URL.createObjectURL(file)
        }

        return attachment
      })

    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 4))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id)
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview)
      }
      return prev.filter((a) => a.id !== id)
    })
  }

  const handleGenerateImage = async () => {
    if (!input?.trim()) return

    setIsGeneratingImage(true)
    const prompt = input.trim()

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Generate image: ${prompt}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `generate an image of: ${prompt}`,
          tool: "fal_generate_image",
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Here's the generated image:",
        timestamp: new Date(),
        images: data.images || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't generate that image. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input?.trim() && attachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    try {
      const attachmentData = await Promise.all(
        (userMessage.attachments || []).map(async (att) => {
          const buffer = await att.file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")
          return {
            type: att.type,
            name: att.file.name,
            data: base64,
            mimeType: att.file.type,
          }
        }),
      )

      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage.content,
          attachments: attachmentData,
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "I couldn't process that request.",
        timestamp: new Date(),
        sources: data.sources,
        images: data.images,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div
      className="flex flex-col h-[100dvh] bg-[#0a0a0a]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="border-2 border-dashed border-amber-500 rounded-3xl p-12 text-center">
            <Upload className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">Drop files here</p>
            <p className="text-sm text-gray-400 mt-2">Images and PDFs supported</p>
          </div>
        </div>
      )}

      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="SaintSal" width={36} height={36} className="rounded-full" />
          <div>
            <h1 className="text-white font-semibold text-base">SaintSal™</h1>
            <p className="text-[10px] text-gray-500">Command Center</p>
          </div>
        </div>
        <Link href="/auth/login" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
          Sign In
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="SaintSal"
                width={80}
                height={80}
                className="rounded-2xl shadow-lg shadow-amber-500/20"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Ask SaintSal<span className="text-amber-500">™</span> Anything
            </h2>

            <p className="text-gray-400 text-sm text-center mb-8 max-w-xs">
              Research properties, analyze deals, explore lending options, or get investment guidance.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-amber-500/30 rounded-full text-sm text-gray-300 hover:text-white transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "")}>
                {message.role === "assistant" && (
                  <Image src="/logo.png" alt="SaintSal" width={32} height={32} className="rounded-full flex-shrink-0" />
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === "user" ? "bg-amber-600 text-white" : "bg-[#1a1a1a] border border-[#2a2a2a]",
                  )}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {message.attachments.map(
                        (att) =>
                          att.preview && (
                            <img
                              key={att.id}
                              src={att.preview || "/placeholder.svg"}
                              alt="Attachment"
                              className="h-20 w-20 object-cover rounded-lg"
                            />
                          ),
                      )}
                    </div>
                  )}

                  {message.role === "assistant" ? (
                    <>
                      <RichContent content={message.content} sources={message.sources} />
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 grid gap-2">
                          {message.images.map((img, i) => (
                            <img
                              key={i}
                              src={img || "/placeholder.svg"}
                              alt={`Generated image ${i + 1}`}
                              className="w-full rounded-xl border border-[#2a2a2a]"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Image src="/logo.png" alt="SaintSal" width={32} height={32} className="rounded-full flex-shrink-0" />
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex-shrink-0 border-t border-[#1a1a1a] bg-[#0d0d0d] px-4 py-2">
          <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
            {attachments.map((att) => (
              <div key={att.id} className="relative group">
                {att.preview ? (
                  <img
                    src={att.preview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg border border-[#2a2a2a]"
                  />
                ) : (
                  <div className="h-16 w-16 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] flex items-center justify-center">
                    <span className="text-xs text-gray-500">PDF</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 pb-safe">
        <form id="chat-form" onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-4 text-gray-500 hover:text-amber-500 transition-colors"
            >
              <Camera className="h-5 w-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full h-12 pl-12 pr-28 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm"
            />

            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={!input?.trim() || isLoading || isGeneratingImage}
                className="h-8 w-8 rounded-full bg-transparent hover:bg-[#222] flex items-center justify-center text-gray-500 hover:text-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Generate image"
              >
                {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                className="h-8 w-8 rounded-full bg-transparent hover:bg-[#222] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                type="submit"
                disabled={(!input?.trim() && attachments.length === 0) || isLoading}
                className="h-8 w-8 rounded-full bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-2">
          SaintSal™ can make mistakes. Verify important information.
        </p>
      </div>

      <nav className="flex-shrink-0 md:hidden border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="flex justify-around py-2">
          {[
            { icon: MessageCircle, label: "Chat", href: "/research", active: true },
            { icon: Building2, label: "Property", href: "/app/properties" },
            { icon: Calculator, label: "Deals", href: "/app/analyzer" },
            { icon: Users, label: "Leads", href: "/app/opportunities" },
            { icon: DollarSign, label: "Loans", href: "/capital" },
            { icon: User, label: "Account", href: "/app/settings" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1",
                item.active ? "text-amber-500" : "text-gray-500 hover:text-gray-300",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
