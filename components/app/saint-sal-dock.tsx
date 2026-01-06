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

function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = localStorage.getItem("saintsal_session_id")
  if (!sessionId) {
    sessionId = `ss_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem("saintsal_session_id", sessionId)
  }
  return sessionId
}

export function SaintSalDock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to SaintSal™ - your HACP™-powered decision engine.\n\nI'm your all-in-one expert for:\n• Real Estate Deal Analysis\n• Lending & Financing Options\n• Legal Guidance & Strategy\n• Investment Planning\n\nNo login needed - just ask me anything!\n\nWhat can I help you with?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

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

  const trackConversationToGHL = async (query: string) => {
    try {
      await fetch("/api/saintsal/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "conversation.started",
          query,
          source: "SaintSal Dock",
          conversationId: sessionId,
        }),
      })
    } catch (error) {
      // Non-critical - don't block user experience
    }
  }

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

    if (messages.length <= 1) {
      trackConversationToGHL(userMessage.content)
    }

    try {
      const response = await fetch("/api/saintsal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.id !== "welcome"), userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const newSessionId = response.headers.get("X-SaintSal-Session")
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId)
        localStorage.setItem("saintsal_session_id", newSessionId)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2))
              fullContent += text
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)),
              )
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("[SaintSal] Error:", error)
      const errorMessage =
        error instanceof Error ? error.message : "I encountered an issue. Please try again in a moment."
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMessage.includes("AI service")
            ? "I'm having trouble connecting right now. Please try again in a moment, or contact our team directly at 949-997-2097."
            : `I encountered an issue: ${errorMessage}. Please try again or contact us at 949-997-2097.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { icon: Calculator, label: "Analyze Deal", prompt: "Help me analyze a fix and flip deal" },
    { icon: DollarSign, label: "Loan Options", prompt: "What loan products do you offer for investment properties?" },
    { icon: TrendingUp, label: "Investment Returns", prompt: "Tell me about your investment fund returns" },
    { icon: Building, label: "Find Properties", prompt: "Help me find motivated seller leads in Orange County" },
    { icon: Scale, label: "Legal Help", prompt: "I need guidance on entity structure for real estate investing" },
  ]

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome back! Ready to help with:\n• Deal Analysis\n• Lending Options\n• Investment Planning\n• Property Search\n\nWhat's on your mind?",
      },
    ])
  }

  if (!isOpen) {
    return (
      <button onClick={openDock} className="fixed bottom-6 right-6 z-50 group" aria-label="Open SaintSal Assistant">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl border-2 border-amber-400/50 group-hover:scale-110 transition-transform overflow-hidden">
            <Image src="/logo.png" alt="SaintSal" width={48} height={48} className="object-contain" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
        </div>
        <span className="absolute -top-8 right-0 bg-[#1a1a1a] text-amber-500 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-amber-500/20">
          SaintSal™ AI
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-[#0f0f0f] border border-amber-500/20 rounded-2xl shadow-2xl transition-all duration-300",
        isMinimized ? "bottom-6 right-6 w-72 h-14" : "bottom-6 right-6 w-[420px] h-[600px] max-h-[80vh] flex flex-col",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20 bg-[#0a0a0a] rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="SaintSal" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">SaintSal™</h3>
            <p className="text-xs text-amber-500/80">HACP™ Decision Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={handleClearChat}
            title="Clear Chat"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "")}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <Image src="/logo.png" alt="SaintSal" width={24} height={24} className="object-contain" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-amber-500 text-black"
                      : "bg-[#1a1a1a] text-gray-200 border border-amber-500/10",
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-black animate-spin" />
                </div>
                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 text-sm text-gray-400 border border-amber-500/10">
                  Analyzing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-amber-500/20 rounded-full text-xs text-gray-300 transition-colors"
                  >
                    <action.icon className="h-3 w-3 text-amber-500" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-amber-500/20 bg-[#0a0a0a] rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SaintSal anything..."
                className="flex-1 bg-[#1a1a1a] border-amber-500/20 text-white placeholder:text-gray-500 focus:border-amber-500/50 rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-black rounded-xl px-4"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              No login required • Your conversation is saved •{" "}
              <Link href="/apply" className="text-amber-500/70 hover:text-amber-500">
                Apply for capital
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  )
}
