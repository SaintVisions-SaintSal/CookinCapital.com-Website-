"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Globe,
  TrendingUp,
  Building2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Loader2,
  Home,
  Users,
  Landmark,
  LineChart,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TRENDING_TOPICS = [
  { label: "Stock Market Today", icon: TrendingUp, query: "What's happening in the stock market today?" },
  { label: "Orange County RE Trends", icon: Building2, query: "Real estate market trends in Orange County CA" },
  { label: "Fed Interest Rate", icon: DollarSign, query: "Current Federal Reserve interest rate and outlook" },
  { label: "Commercial Lending Rates", icon: Landmark, query: "Current commercial real estate lending rates" },
]

const QUICK_ACCESS = [
  {
    title: "Property Search",
    description: "Find motivated seller properties with PropertyRadar & Tavily",
    icon: Home,
    href: "/app/analyzer",
    color: "text-blue-400",
  },
  {
    title: "Our Team",
    description: "Meet the CookinCapital executive leadership",
    icon: Users,
    href: "/about",
    color: "text-primary",
  },
  {
    title: "Lending Products",
    description: "Explore all 23 loan products for every need",
    icon: DollarSign,
    href: "/capital",
    color: "text-green-400",
  },
  {
    title: "Investments",
    description: "Fund I Syndication - 12-16% target returns",
    icon: LineChart,
    href: "/invest",
    color: "text-purple-400",
  },
  {
    title: "SaintSal.ai",
    description: "Custom AI orchestration & platform builds",
    icon: Sparkles,
    href: "https://saintsal.ai",
    external: true,
    color: "text-primary",
  },
]

export function ResearchHub() {
  const [searchCount, setSearchCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomInputRef = useRef<HTMLInputElement>(null)

  const safeString = (str: string | undefined | null): string => str ?? ""

  const trackToGHL = async (query: string, eventType = "lead.captured") => {
    if (!query) return
    try {
      await fetch("/api/saintsal/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          query,
          source: "Research Hub",
          intent: detectIntent(query),
          conversationId: Date.now().toString(),
        }),
      })
    } catch (error) {
      console.log("[v0] GHL tracking error (non-critical):", error)
    }
  }

  const detectIntent = (query: string): string => {
    const lowerQuery = safeString(query).toLowerCase()
    if (lowerQuery.includes("loan") || lowerQuery.includes("financing") || lowerQuery.includes("lending")) {
      return "lending"
    }
    if (lowerQuery.includes("invest") || lowerQuery.includes("fund") || lowerQuery.includes("return")) {
      return "investing"
    }
    if (lowerQuery.includes("property") || lowerQuery.includes("real estate") || lowerQuery.includes("house")) {
      return "property_search"
    }
    if (lowerQuery.includes("deal") || lowerQuery.includes("analyze") || lowerQuery.includes("flip")) {
      return "deal_analysis"
    }
    return "general"
  }

  const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
    api: "/api/research",
    onFinish: () => {
      // Increment search count
      const newCount = searchCount + 1
      setSearchCount(newCount)
      localStorage.setItem("researchSearchCount", String(newCount))
    },
  })

  // Load search count from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("researchSearchCount")
    if (saved) setSearchCount(Number.parseInt(saved))
  }, [])

  // Show results view when we have messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowResults(true)
    }
  }, [messages])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!safeString(input).trim()) return
    trackToGHL(input, "lead.captured")
    handleSubmit(e)
  }

  const handleTrendingClick = (query: string) => {
    setInput(query)
    trackToGHL(query, "lead.captured")
    append({ role: "user", content: query })
  }

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach((track) => track.stop())

        // Send to transcription API
        const formData = new FormData()
        formData.append("audio", audioBlob)

        try {
          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          })
          const { transcript } = await response.json()
          if (transcript) {
            setInput(transcript)
          }
        } catch (e) {
          console.error("Transcription error:", e)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error("Recording error:", e)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Text-to-speech
  const speakText = async (text: string) => {
    try {
      setIsPlayingAudio(true)
      const response = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.substring(0, 500) }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.onended = () => setIsPlayingAudio(false)
        audio.play()
      } else {
        setIsPlayingAudio(false)
      }
    } catch (e) {
      console.error("Speech error:", e)
      setIsPlayingAudio(false)
    }
  }

  // Extract sources from message content
  const extractSources = (content: string) => {
    const urlRegex = /https?:\/\/[^\s)]+/g
    const matches = content.match(urlRegex) || []
    return [...new Set(matches)].slice(0, 5)
  }

  // Get rating color
  const getRatingColor = (rating: string) => {
    switch (rating?.toUpperCase()) {
      case "A":
        return "text-green-400 bg-green-400/10 border-green-400/30"
      case "B":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30"
      case "C":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      case "D":
        return "text-red-400 bg-red-400/10 border-red-400/30"
      default:
        return "text-primary bg-primary/10 border-primary/30"
    }
  }

  // Landing view (no search yet)
  if (!showResults) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="CookinCap" width={36} height={36} className="rounded-lg" />
              <span className="font-semibold">
                Cookin<span className="text-primary">Cap</span>
              </span>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Powered by SaintSal™ AI
            </div>

            {/* Title */}
            <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
              Search for <span className="text-primary">Anything</span>
            </h1>

            {/* Subtitle */}
            <p className="mb-2 text-lg text-muted-foreground">
              Ask us anything. SaintSal guides you, navigates you across our platform, and executes your vision.
            </p>
            <p className="mb-8 text-muted-foreground">Real-time data. AI intelligence. Actionable solutions.</p>
            <p className="mb-10 text-sm italic text-primary/80">Not just answers—complete pathways to your goals.</p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mx-auto mb-6 max-w-2xl">
              <div className="relative flex items-center rounded-full border border-border/60 bg-card shadow-lg transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="i need help finding real estate leads in Orange county ca"
                  className="h-14 w-full rounded-full bg-transparent pl-14 pr-32 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      "rounded-full p-2 transition-colors",
                      isRecording ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-full px-6"
                    disabled={isLoading || !safeString(input).trim()}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Search mode indicator */}
            <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Search + AI Analysis Mode
              </div>
              <div>
                {searchCount}/10 free searches used
                {searchCount >= 8 && <span className="ml-2 text-primary">Sign in for unlimited</span>}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="mb-12">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Trending Topics</p>
              <div className="flex flex-wrap justify-center gap-3">
                {TRENDING_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => handleTrendingClick(topic.query)}
                    className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <topic.icon className="h-4 w-4 text-primary" />
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Get Started CTA */}
            <div className="mb-16">
              <Link href="/apply">
                <Button size="lg" className="rounded-full px-8">
                  Get Started - Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Start your application for capital or investment opportunities
              </p>
            </div>

            {/* Quick Access */}
            <div>
              <h2 className="mb-6 text-xl font-semibold">Quick Access</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK_ACCESS.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    className="group flex items-start gap-4 rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className={cn("rounded-lg bg-card p-3", item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium">{item.title}</h3>
                        {item.external && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Results view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CookinCap" width={36} height={36} className="rounded-lg" />
            <span className="font-semibold">
              Cookin<span className="text-primary">Cap</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
              New Search
            </Button>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message, index) => {
              if (message.role === "user") {
                return (
                  <div key={index} className="rounded-xl bg-primary/10 p-4">
                    <div className="mb-1 text-xs font-medium text-primary">You</div>
                    <p className="text-foreground">{message.content}</p>
                  </div>
                )
              }

              // Assistant message - SaintSal Analysis
              const sources = extractSources(message.content)

              return (
                <div key={index} className="space-y-4">
                  {/* Main Analysis Card */}
                  <div className="rounded-xl border border-border/60 bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">SaintSal™ Analysis</span>
                      <button
                        onClick={() => speakText(message.content)}
                        className="ml-auto rounded-full p-2 text-muted-foreground hover:bg-muted"
                        disabled={isPlayingAudio}
                      >
                        {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-foreground/90">{message.content}</p>
                    </div>
                  </div>

                  {/* Sources */}
                  {sources.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        Top Sources
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sources.map((url, i) => {
                          const domain = new URL(url).hostname.replace("www.", "")
                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-full border border-border/60 bg-card px-3 py-1 text-xs transition-colors hover:border-primary/50"
                            >
                              {domain}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Recommendations
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-card p-4">
                        <p className="text-sm text-foreground/80">
                          Set up financing BEFORE you start hunting - our Fix & Flip loans go up to 90% LTC so you can
                          move fast on good deals
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card p-4">
                        <p className="text-sm text-foreground/80">
                          Use our CookinFlips platform to search investment properties and analyze deals in real-time
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Link href="/apply">
                      <Button variant="outline" size="sm">
                        Apply Now
                      </Button>
                    </Link>
                    <Link href="/app/analyzer">
                      <Button variant="outline" size="sm">
                        Search Properties
                      </Button>
                    </Link>
                    <Link href="/capital">
                      <Button variant="outline" size="sm">
                        Explore Lending
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">SaintSal is researching...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Input */}
      <div className="sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="relative flex items-center rounded-full border border-border/60 bg-card">
              <input
                ref={bottomInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your search..."
                className="h-12 w-full rounded-full bg-transparent pl-5 pr-24 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    isRecording ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full"
                  disabled={isLoading || !safeString(input).trim()}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-2 text-center text-xs text-muted-foreground">
            {searchCount}/10 free searches used
            {searchCount >= 8 && (
              <span className="ml-2">
                •{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in for unlimited
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
