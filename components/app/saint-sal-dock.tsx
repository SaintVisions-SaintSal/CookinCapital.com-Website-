"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Send,
  Minimize2,
  Maximize2,
  Loader2,
  Calculator,
  Scale,
  DollarSign,
  TrendingUp,
  Building,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  toolInvocations?: any[]
}

export function SaintSalDock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to SaintSal™ - your HACP™-powered decision engine.\n\nI'm your all-in-one expert for:\n• Real Estate Deal Analysis\n• Lending & Financing Options\n• Legal Guidance & Strategy\n• Investment Planning\n\nI can analyze deals, calculate loan costs, compare financing, and guide you through any real estate challenge.\n\nWhat can I help you with?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const openDock = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  useEffect(() => {
    ;(window as any).openSaintSalDock = openDock
    return () => {
      delete (window as any).openSaintSalDock
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("[v0] Sending message to SaintSal API:", userMessage.content)

      const response = await fetch("/api/saintsal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      console.log("[v0] SaintSal API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] SaintSal API error:", errorData)

        throw new Error(
          errorData.error ||
            "Failed to get response. Please check your AI service configuration or add credits to your Vercel AI Gateway account.",
        )
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          console.log("[v0] Received chunk from SaintSal:", chunk.substring(0, 100))

          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("0:")) {
              const text = line.slice(2).replace(/^"|"$/g, "")
              assistantContent += text
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: assistantContent } : m)),
              )
            }
          }
        }
      }

      console.log("[v0] SaintSal response complete")
    } catch (error) {
      console.error("[v0] SaintSal error:", error)

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? `⚠️ ${error.message}\n\nTo fix this:\n1. Add credits to your Vercel AI Gateway at https://vercel.com/ai\n2. Or add XAI_API_KEY or ANTHROPIC_API_KEY to your environment variables\n3. Contact support at support@cookin.io if you need help`
              : "I apologize, but I encountered an issue. Please try again or contact support@cookin.io if the problem persists.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const setQuickAction = (text: string) => {
    setInput(text)
  }

  const resetConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome to SaintSal™ - your HACP™-powered decision engine.\n\nI'm your all-in-one expert for:\n• Real Estate Deal Analysis\n• Lending & Financing Options\n• Legal Guidance & Strategy\n• Investment Planning\n\nI can analyze deals, calculate loan costs, compare financing, and guide you through any real estate challenge.\n\nWhat can I help you with?",
      },
    ])
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/25 transition-transform hover:scale-105 overflow-hidden"
        aria-label="Open SaintSal"
      >
        <Image src="/logo.png" alt="SaintSal" width={40} height={40} className="object-contain" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card shadow-2xl transition-all",
        isMinimized ? "h-14" : "h-[600px]",
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
            <Image src="/logo.png" alt="SaintSal" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">SaintSal™</p>
            {!isMinimized && (
              <div className="flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                <p className="text-xs text-muted-foreground">HACP™ Powered</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={resetConversation}
            className="rounded-md p-1.5 transition-colors hover:bg-secondary"
            aria-label="Reset conversation"
            title="New conversation"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-md p-1.5 transition-colors hover:bg-secondary"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Minimize2 className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 transition-colors hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[480px] flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("rounded-lg p-3", message.role === "assistant" ? "bg-secondary" : "ml-8 bg-primary/10")}
              >
                {message.role === "assistant" && (
                  <div className="mb-2 flex items-center gap-2">
                    <Image src="/logo.png" alt="SaintSal" width={14} height={14} className="object-contain" />
                    <span className="text-xs font-medium text-primary">SaintSal™</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm text-foreground">{message.content}</p>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="rounded-lg bg-secondary p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">SaintSal™ is analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* Quick Actions - only show at start */}
            {messages.length <= 1 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</p>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/app/analyzer">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent text-xs h-9">
                      <Calculator className="mr-2 h-3 w-3 text-blue-500" />
                      Deal Analyzer
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent text-xs h-9"
                    onClick={() => setQuickAction("What are my financing options for a $300K fix and flip?")}
                  >
                    <DollarSign className="mr-2 h-3 w-3 text-green-500" />
                    Financing Options
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent text-xs h-9"
                    onClick={() => setQuickAction("I need help with an eviction situation")}
                  >
                    <Scale className="mr-2 h-3 w-3 text-purple-500" />
                    Legal Help
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent text-xs h-9"
                    onClick={() => setQuickAction("How do I invest in CookinCapital Fund?")}
                  >
                    <TrendingUp className="mr-2 h-3 w-3 text-amber-500" />
                    Fund Investment
                  </Button>
                </div>

                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-4">Ask About</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs bg-secondary/50"
                    onClick={() => setQuickAction("Analyze a deal: $200K purchase, $320K ARV, $40K rehab")}
                  >
                    <Building className="mr-1 h-3 w-3" />
                    Deal Analysis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs bg-secondary/50"
                    onClick={() => setQuickAction("Compare hard money vs bridge loan for my flip")}
                  >
                    Loan Comparison
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs bg-secondary/50"
                    onClick={() => setQuickAction("What's the best entity structure for rental properties?")}
                  >
                    Entity Setup
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs bg-secondary/50"
                    onClick={() => setQuickAction("Explain the BRRRR strategy")}
                  >
                    BRRRR Strategy
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about deals, financing, legal..."
                className="flex-1 border-0 bg-secondary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 bg-primary text-primary-foreground"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
