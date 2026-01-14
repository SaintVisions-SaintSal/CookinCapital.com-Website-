"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  Globe,
  Building2,
  Calculator,
  DollarSign,
  MapPin,
  Users,
  User,
  MessageCircle,
  Mic,
  Camera,
  Upload,
  X,
  Wand2,
  FileText,
  TrendingUp,
  Home,
  Phone,
  Mail,
  Zap,
  Target,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ===========================================
// SAINTSAL™ RESEARCH COMMAND CENTER v3.0
// Perplexity-Level • AI Orchestration
// Lead Finding • Intent Detection
// ===========================================

interface FileAttachment {
  id: string
  file: File
  preview?: string
  type: "image" | "document"
}

interface SearchResult {
  title: string
  url: string
  snippet: string
  favicon?: string
}

interface PropertyResult {
  address: string
  city: string
  state: string
  zip: string
  value?: number
  equity?: number
  equityPercent?: number
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
  foreclosureStatus?: string
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
}

interface LeadResult {
  name: string
  company?: string
  title?: string
  phone?: string
  email?: string
  location?: string
  source?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: SearchResult[]
  properties?: PropertyResult[]
  leads?: LeadResult[]
  images?: string[]
  attachments?: FileAttachment[]
  summary?: string
  intent?: string
  isStreaming?: boolean
}

const QUICK_PROMPTS = [
  { text: "Find foreclosures in Orange County", icon: Home, category: "property" },
  { text: "Analyze 123 Main St Huntington Beach", icon: Calculator, category: "deal" },
  { text: "Find investor leads in LA", icon: Users, category: "leads" },
  { text: "Compare bridge loan rates", icon: TrendingUp, category: "lending" },
]

const MOBILE_NAV = [
  { label: "Chat", icon: MessageCircle, href: "/research", active: true },
  { label: "Property", icon: Building2, href: "/app/properties" },
  { label: "Deals", icon: Calculator, href: "/app/analyzer" },
  { label: "Leads", icon: Users, href: "/app/opportunities" },
  { label: "Loans", icon: DollarSign, href: "/capital" },
  { label: "Account", icon: User, href: "/app/settings" },
]

// Detect user intent for AI orchestration
function detectIntent(query: string): string {
  const q = query.toLowerCase()

  // Property/Real Estate Intent
  if (q.includes("foreclosure") || q.includes("pre-foreclosure") || q.includes("nod") || q.includes("auction")) {
    return "foreclosure_search"
  }
  if (q.includes("property") && (q.includes("find") || q.includes("search") || q.includes("look"))) {
    return "property_search"
  }
  if (
    q.includes("owner") &&
    (q.includes("find") || q.includes("contact") || q.includes("phone") || q.includes("email"))
  ) {
    return "owner_lookup"
  }
  if (q.match(/\d+\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court)/i)) {
    return "property_lookup"
  }

  // Lead Generation Intent
  if (q.includes("lead") || q.includes("investor") || q.includes("buyer") || q.includes("seller")) {
    if (q.includes("find") || q.includes("search") || q.includes("get")) {
      return "lead_generation"
    }
  }
  if (q.includes("enrich") || q.includes("contact info") || q.includes("phone number") || q.includes("email")) {
    return "lead_enrichment"
  }

  // Deal Analysis Intent
  if (q.includes("analyze") || q.includes("analysis") || q.includes("roi") || q.includes("deal")) {
    return "deal_analysis"
  }
  if (q.includes("flip") || q.includes("arv") || q.includes("rehab") || q.includes("profit")) {
    return "deal_analysis"
  }

  // Lending Intent
  if (
    q.includes("loan") ||
    q.includes("lend") ||
    q.includes("rate") ||
    q.includes("finance") ||
    q.includes("mortgage")
  ) {
    return "lending_info"
  }
  if (q.includes("bridge") || q.includes("hard money") || q.includes("dscr") || q.includes("fix and flip")) {
    return "lending_info"
  }

  // Image Generation
  if (q.includes("generate image") || q.includes("create image") || q.includes("make image") || q.includes("draw")) {
    return "image_generation"
  }

  // Default to research
  return "web_research"
}

// Property Card Component
function PropertyCard({ property }: { property: PropertyResult }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-amber-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Home className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{property.address}</p>
            <p className="text-xs text-gray-500">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>
        </div>
        {property.foreclosureStatus && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
            {property.foreclosureStatus}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {property.value && (
          <div className="text-center p-2 bg-[#0a0a0a] rounded-lg">
            <p className="text-xs text-gray-500">Value</p>
            <p className="text-sm font-semibold text-white">${(property.value / 1000).toFixed(0)}K</p>
          </div>
        )}
        {property.equityPercent !== undefined && (
          <div className="text-center p-2 bg-[#0a0a0a] rounded-lg">
            <p className="text-xs text-gray-500">Equity</p>
            <p className={cn("text-sm font-semibold", property.equityPercent > 30 ? "text-green-400" : "text-white")}>
              {property.equityPercent}%
            </p>
          </div>
        )}
        {property.sqft && (
          <div className="text-center p-2 bg-[#0a0a0a] rounded-lg">
            <p className="text-xs text-gray-500">Sq Ft</p>
            <p className="text-sm font-semibold text-white">{property.sqft.toLocaleString()}</p>
          </div>
        )}
      </div>

      {property.ownerName && (
        <div className="pt-3 border-t border-[#222]">
          <p className="text-xs text-gray-500 mb-2">Owner Contact</p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-white font-medium">{property.ownerName}</p>
            {property.ownerPhone && (
              <a href={`tel:${property.ownerPhone}`} className="text-amber-500 hover:text-amber-400">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {property.ownerEmail && (
              <a href={`mailto:${property.ownerEmail}`} className="text-amber-500 hover:text-amber-400">
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Link
          href={`/app/analyzer?address=${encodeURIComponent(property.address)}&city=${encodeURIComponent(property.city)}&state=${encodeURIComponent(property.state)}`}
          className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold rounded-lg text-center transition-colors"
        >
          Analyze Deal
        </Link>
        <button className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white text-xs rounded-lg transition-colors">
          Save
        </button>
      </div>
    </div>
  )
}

// Lead Card Component
function LeadCard({ lead }: { lead: LeadResult }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-amber-500/30 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold">
          {lead.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{lead.name}</p>
          {lead.title && <p className="text-xs text-gray-400">{lead.title}</p>}
          {lead.company && <p className="text-xs text-amber-500">{lead.company}</p>}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-amber-500 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {lead.phone}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-amber-500 transition-colors truncate"
          >
            <Mail className="h-3.5 w-3.5" />
            {lead.email}
          </a>
        )}
        {lead.location && (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {lead.location}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold rounded-lg transition-colors">
          Add to CRM
        </button>
        <button className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white text-xs rounded-lg transition-colors">
          Enrich
        </button>
      </div>
    </div>
  )
}

// Source Pill Component
function SourcePill({ source, index }: { source: SearchResult; index: number }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-full text-xs transition-colors group"
    >
      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">
        {index + 1}
      </span>
      <span className="text-gray-300 group-hover:text-white truncate max-w-[120px]">
        {source.title || new URL(source.url).hostname}
      </span>
      <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-amber-500" />
    </a>
  )
}

// Rich Content Renderer
function RichContent({ content }: { content: string }) {
  // Simple markdown parsing
  const renderContent = () => {
    const lines = content.split("\n")
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">
            {line.slice(4)}
          </h3>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-xl font-bold text-white mt-4 mb-3">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.match(/^[-*]\s/)) {
        return (
          <li key={i} className="text-sm text-gray-300 ml-4 mb-1 list-disc">
            {renderInline(line.slice(2))}
          </li>
        )
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="text-sm text-gray-300 ml-4 mb-1 list-decimal">
            {renderInline(line.replace(/^\d+\.\s/, ""))}
          </li>
        )
      }
      if (line.trim() === "") return <br key={i} />
      return (
        <p key={i} className="text-sm text-gray-300 mb-2 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    })
  }

  const renderInline = (text: string): React.ReactNode => {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      // Inline code
      if (part.includes("`")) {
        const codeParts = part.split(/(`[^`]+`)/)
        return codeParts.map((cp, j) => {
          if (cp.startsWith("`") && cp.endsWith("`")) {
            return (
              <code key={j} className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-amber-500 text-xs font-mono">
                {cp.slice(1, -1)}
              </code>
            )
          }
          return cp
        })
      }
      return part
    })
  }

  return <div className="prose-invert max-w-none">{renderContent()}</div>
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
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) setIsDragging(false)
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
      .slice(0, 4)
      .map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: file.type.startsWith("image/") ? "image" : "document",
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }))
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 4))
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id)
      if (att?.preview) URL.revokeObjectURL(att.preview)
      return prev.filter((a) => a.id !== id)
    })
  }

  // Voice recording (placeholder - would integrate with ElevenLabs)
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Integrate with ElevenLabs voice agent
  }

  // Image generation
  const handleGenerateImage = async () => {
    if (!input?.trim()) return
    setIsGeneratingImage(true)
    const prompt = input.trim()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Generate image: ${prompt}`,
      timestamp: new Date(),
      intent: "image_generation",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `generate image: ${prompt}`, tool: "fal_generate_image" }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Here's the generated image:",
          timestamp: new Date(),
          images: data.images || [],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't generate that image.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Main submit handler with AI orchestration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input?.trim() && attachments.length === 0) || isLoading) return

    const query = input.trim()
    const intent = detectIntent(query)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      intent,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    // Add streaming placeholder
    const streamingId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: streamingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        intent,
      },
    ])

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          intent,
          conversationHistory: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      // Update streaming message with real content
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                content: data.summary || data.response || "I couldn't process that request.",
                sources: data.sources,
                properties: data.properties,
                leads: data.leads,
                images: data.images,
                summary: data.summary,
                isStreaming: false,
              }
            : m,
        ),
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                content: "Sorry, there was an error. Please try again.",
                isStreaming: false,
              }
            : m,
        ),
      )
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
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="border-2 border-dashed border-amber-500 rounded-3xl p-12 text-center">
            <Upload className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">Drop files here</p>
            <p className="text-sm text-gray-400 mt-2">Images & PDFs supported</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Image src="/saintsal-logo.png" alt="SaintSal" width={36} height={36} className="rounded-xl" />
          <div>
            <h1 className="font-bold text-white text-sm">
              SaintSal<span className="text-amber-500">™</span>
            </h1>
            <p className="text-[10px] text-gray-500">Research Command Center</p>
          </div>
        </div>
        <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          // Landing View
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
            <Image src="/saintsal-logo.png" alt="SaintSal" width={80} height={80} className="rounded-2xl mb-6" />

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Ask SaintSal<span className="text-amber-500">™</span> Anything
            </h2>
            <p className="text-gray-400 text-center text-sm mb-8 max-w-md">
              Find properties, generate leads, analyze deals, research markets—all in one conversation.
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt.text)
                    inputRef.current?.focus()
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-[#222] hover:border-amber-500/50 rounded-full text-sm text-gray-300 hover:text-white transition-all group"
                >
                  <prompt.icon className="h-4 w-4 text-amber-500" />
                  {prompt.text}
                </button>
              ))}
            </div>

            {/* Capability Pills */}
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              <span className="px-3 py-1 bg-[#111] rounded-full border border-[#1a1a1a]">
                <Zap className="h-3 w-3 inline mr-1 text-amber-500" />
                35+ Data Sources
              </span>
              <span className="px-3 py-1 bg-[#111] rounded-full border border-[#1a1a1a]">
                <Target className="h-3 w-3 inline mr-1 text-amber-500" />
                Lead Enrichment
              </span>
              <span className="px-3 py-1 bg-[#111] rounded-full border border-[#1a1a1a]">
                <BarChart3 className="h-3 w-3 inline mr-1 text-amber-500" />
                Deal Analysis
              </span>
            </div>
          </div>
        ) : (
          // Chat View
          <div className="px-4 py-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl",
                    message.role === "user"
                      ? "bg-amber-500 text-black px-4 py-3"
                      : "bg-[#111] border border-[#222] px-4 py-4",
                  )}
                >
                  {/* User attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {message.attachments.map((att) => (
                        <div key={att.id} className="relative">
                          {att.preview ? (
                            <img
                              src={att.preview || "/placeholder.svg"}
                              alt=""
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-[#222] rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Streaming indicator */}
                  {message.isStreaming && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-sm">Searching...</span>
                    </div>
                  )}

                  {/* Sources at top (Perplexity style) */}
                  {message.sources && message.sources.length > 0 && !message.isStreaming && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.slice(0, 5).map((source, i) => (
                          <SourcePill key={i} source={source} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main content */}
                  {!message.isStreaming && (
                    <div className={message.role === "user" ? "text-sm font-medium" : ""}>
                      {message.role === "user" ? message.content : <RichContent content={message.content} />}
                    </div>
                  )}

                  {/* Property results */}
                  {message.properties && message.properties.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <Home className="h-3 w-3" /> {message.properties.length} Properties Found
                      </p>
                      <div className="grid gap-3">
                        {message.properties.slice(0, 4).map((property, i) => (
                          <PropertyCard key={i} property={property} />
                        ))}
                      </div>
                      {message.properties.length > 4 && (
                        <button className="w-full mt-3 py-2 text-sm text-amber-500 hover:text-amber-400 transition-colors">
                          View all {message.properties.length} properties →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Lead results */}
                  {message.leads && message.leads.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {message.leads.length} Leads Found
                      </p>
                      <div className="grid gap-3">
                        {message.leads.slice(0, 4).map((lead, i) => (
                          <LeadCard key={i} lead={lead} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {message.images.map((img, i) => (
                        <img key={i} src={img || "/placeholder.svg"} alt="" className="rounded-xl w-full" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
      <div className="flex-shrink-0 p-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((att) => (
              <div key={att.id} className="relative flex-shrink-0">
                {att.preview ? (
                  <img
                    src={att.preview || "/placeholder.svg"}
                    alt=""
                    className="h-16 w-16 object-cover rounded-lg border border-[#2a2a2a]"
                  />
                ) : (
                  <div className="h-16 w-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* File upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))}
            accept="image/*,.pdf"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Camera className="h-5 w-5" />
          </button>

          {/* Voice */}
          <button
            type="button"
            onClick={toggleRecording}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white",
            )}
          >
            <Mic className="h-5 w-5" />
          </button>

          {/* Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full h-12 px-4 pr-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />

            {/* Image gen button */}
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={!input?.trim() || isGeneratingImage}
              className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#222] hover:bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors disabled:opacity-50"
            >
              {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={(!input?.trim() && attachments.length === 0) || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-2">
          SaintSal™ can make mistakes. Verify important information.
        </p>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="flex-shrink-0 flex items-center justify-around py-2 border-t border-[#1a1a1a] bg-[#0a0a0a] md:hidden">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
              item.active ? "text-amber-500" : "text-gray-500 hover:text-gray-300",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
