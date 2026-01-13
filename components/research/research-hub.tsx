"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Mic,
  MicOff,
  Send,
  Sparkles,
  DollarSign,
  Home,
  Users,
  ArrowRight,
  Loader2,
  FileText,
  MessageSquare,
  ImageIcon,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ===========================================
// SAINTSAL™ RESEARCH COMMAND CENTER
// Full Arsenal UI | HACP™ Protocol
// ===========================================

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  type: "text" | "image" | "property" | "lead" | "research" | "deal" | "trading"
  data?: any
  timestamp: Date
  tool?: string
}

// Tool categories for sidebar
const TOOL_CATEGORIES = [
  {
    name: "Search & Research",
    icon: Search,
    tools: [
      { label: "Web Search", prompt: "Search for ", tool: "tavily_search" },
      { label: "Deep Research", prompt: "Do deep research on ", tool: "tavily_research" },
      { label: "Extract URL", prompt: "Extract content from ", tool: "tavily_extract" },
      { label: "Crawl Website", prompt: "Crawl website ", tool: "tavily_crawl" },
    ],
  },
  {
    name: "Real Estate",
    icon: Home,
    tools: [
      { label: "Property Lookup", prompt: "Look up property at ", tool: "property_radar_lookup" },
      { label: "Foreclosures", prompt: "Find foreclosures in ", tool: "property_radar_foreclosures" },
      { label: "Analyze Deal", prompt: "Analyze deal: purchase $200k, ARV $300k, rehab $30k", tool: "analyze_deal" },
      { label: "Lending Calc", prompt: "Calculate loan: $500k at 12% for 12 months", tool: "calculate_lending_terms" },
    ],
  },
  {
    name: "Leads & CRM",
    icon: Users,
    tools: [
      { label: "Create Contact", prompt: "Create contact: ", tool: "ghl_create_contact" },
      { label: "Search Contacts", prompt: "Search contacts for ", tool: "ghl_search_contacts" },
      { label: "Create Opportunity", prompt: "Create opportunity for ", tool: "ghl_create_opportunity" },
      { label: "Add Note", prompt: "Add note to contact: ", tool: "ghl_add_note" },
    ],
  },
  {
    name: "Trading",
    icon: BarChart3,
    tools: [
      { label: "Stock Quote", prompt: "Get quote for AAPL", tool: "alpaca_get_quote" },
      { label: "Portfolio", prompt: "Show my positions", tool: "alpaca_get_positions" },
      { label: "Account", prompt: "Show trading account", tool: "alpaca_get_account" },
    ],
  },
  {
    name: "Media & Comms",
    icon: ImageIcon,
    tools: [
      { label: "Generate Image", prompt: "Generate image of ", tool: "generate_image_flux" },
      { label: "Send Email", prompt: "Send email to: ", tool: "send_email" },
      { label: "Send SMS", prompt: "Send SMS to +1234567890: ", tool: "send_sms" },
    ],
  },
  {
    name: "AI Models",
    icon: MessageSquare,
    tools: [
      { label: "Ask Perplexity", prompt: "Research with Perplexity: ", tool: "ask_perplexity" },
      { label: "Ask Grok", prompt: "Ask Grok: ", tool: "ask_grok" },
      { label: "Ask Groq", prompt: "Ask Groq: ", tool: "ask_groq" },
    ],
  },
]

// Quick start actions for landing
const QUICK_START = [
  { icon: Search, label: "Search Web", prompt: "Search for " },
  { icon: Home, label: "Property Lookup", prompt: "Look up property at " },
  { icon: Users, label: "Enrich Lead", prompt: "Find info about " },
  { icon: DollarSign, label: "Analyze Deal", prompt: "Analyze deal: " },
  { icon: BarChart3, label: "Stock Quote", prompt: "Get quote for " },
  { icon: ImageIcon, label: "Generate Image", prompt: "Generate image of " },
]

export function ResearchHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = inputRef.current.scrollHeight + "px"
    }
  }, [input])

  // Detect intent from query to determine which tool to use
  const detectIntent = (query: string): { tool: string; type: Message["type"] } => {
    const q = query.toLowerCase()

    if (q.includes("generate image") || q.includes("create image") || q.includes("make image")) {
      return { tool: "generate_image_flux", type: "image" }
    }
    if (q.includes("property") || q.match(/\d+\s+\w+\s+(st|street|ave|avenue|blvd|dr|rd|ln|way|ct)/i)) {
      return { tool: "property_radar_lookup", type: "property" }
    }
    if (q.includes("foreclosure") || q.includes("distressed")) {
      return { tool: "property_radar_foreclosures", type: "property" }
    }
    if (q.includes("create contact") || q.includes("add to crm") || q.includes("save lead")) {
      return { tool: "ghl_create_contact", type: "lead" }
    }
    if (q.includes("analyze deal") || q.includes("mao") || q.includes("arv") || q.includes("roi")) {
      return { tool: "analyze_deal", type: "deal" }
    }
    if (q.includes("lending") || q.includes("loan") || q.includes("payment") || q.includes("calculate loan")) {
      return { tool: "calculate_lending_terms", type: "deal" }
    }
    if (q.includes("stock") || q.includes("quote") || q.includes("price of") || q.includes("trading")) {
      return { tool: "alpaca_get_quote", type: "trading" }
    }
    if (q.includes("positions") || q.includes("portfolio")) {
      return { tool: "alpaca_get_positions", type: "trading" }
    }
    if (q.includes("send sms") || q.includes("text message")) {
      return { tool: "send_sms", type: "text" }
    }
    if (q.includes("send email")) {
      return { tool: "send_email", type: "text" }
    }
    if (q.includes("crawl") || q.includes("scrape website")) {
      return { tool: "tavily_crawl", type: "research" }
    }
    if (q.includes("extract") || q.includes("get content from")) {
      return { tool: "tavily_extract", type: "research" }
    }
    if (q.includes("research") || q.includes("deep dive")) {
      return { tool: "tavily_research", type: "research" }
    }
    if (q.includes("perplexity")) {
      return { tool: "ask_perplexity", type: "research" }
    }
    if (q.includes("grok")) {
      return { tool: "ask_grok", type: "research" }
    }
    if (q.includes("groq")) {
      return { tool: "ask_groq", type: "research" }
    }

    // Default to search
    return { tool: "tavily_search", type: "research" }
  }

  // Build tool arguments from natural language query
  const buildToolArgs = (tool: string, query: string): Record<string, any> => {
    if (
      tool === "tavily_search" ||
      tool === "tavily_research" ||
      tool === "ask_perplexity" ||
      tool === "ask_grok" ||
      tool === "ask_groq"
    ) {
      return { query }
    }
    if (tool === "property_radar_lookup") {
      const addressMatch = query.match(/(\d+\s+.+?(?:st|street|ave|avenue|blvd|dr|rd|ln|way|ct).+?)(?:\?|$)/i)
      return { address: addressMatch?.[1] || query }
    }
    if (tool === "property_radar_foreclosures") {
      const locationMatch = query.match(/in\s+(.+?)(?:\?|$)/i)
      return { location: locationMatch?.[1] || "Orange County, CA" }
    }
    if (tool === "generate_image_flux") {
      const prompt = query.replace(/generate image|create image|make image/gi, "").trim()
      return { prompt: prompt || query }
    }
    if (tool === "analyze_deal") {
      const purchaseMatch = query.match(/purchase[:\s]*\$?([\d,]+)/i)
      const arvMatch = query.match(/arv[:\s]*\$?([\d,]+)/i)
      const rehabMatch = query.match(/rehab[:\s]*\$?([\d,]+)/i)
      return {
        purchase_price: purchaseMatch ? Number.parseInt(purchaseMatch[1].replace(/,/g, "")) : 200000,
        arv: arvMatch ? Number.parseInt(arvMatch[1].replace(/,/g, "")) : 300000,
        rehab_cost: rehabMatch ? Number.parseInt(rehabMatch[1].replace(/,/g, "")) : 30000,
      }
    }
    if (tool === "calculate_lending_terms") {
      const amountMatch = query.match(/\$?([\d,]+k?)/i)
      const rateMatch = query.match(/(\d+(?:\.\d+)?)\s*%/i)
      const termMatch = query.match(/(\d+)\s*months?/i)
      let amount = 500000
      if (amountMatch) {
        amount = Number.parseInt(amountMatch[1].replace(/,/g, ""))
        if (amountMatch[1].toLowerCase().includes("k")) amount *= 1000
      }
      return {
        loan_amount: amount,
        interest_rate: rateMatch ? Number.parseFloat(rateMatch[1]) : 12,
        term_months: termMatch ? Number.parseInt(termMatch[1]) : 12,
      }
    }
    if (tool === "alpaca_get_quote") {
      const symbolMatch = query.match(/(?:quote|price of|stock)\s+(\w+)/i)
      return { symbol: symbolMatch?.[1]?.toUpperCase() || "AAPL" }
    }
    return { query }
  }

  // Format response based on tool type
  const formatResponse = (tool: string, data: any): string => {
    if (tool.includes("tavily") && data.answer) {
      return data.answer
    }
    if (tool === "analyze_deal") {
      return `## Deal Analysis\n\n**Signal: ${data.signal}**\n\n- MAO: $${data.mao?.toLocaleString()}\n- Purchase: $${data.purchase_price?.toLocaleString()}\n- ARV: $${data.arv?.toLocaleString()}\n- Rehab: $${data.rehab_cost?.toLocaleString()}\n- Net Profit: $${data.net_profit?.toLocaleString()}\n- ROI: ${data.roi}`
    }
    if (tool === "calculate_lending_terms") {
      return `## Lending Terms\n\n**${data.loan_type?.toUpperCase()} Loan**\n\n- Loan Amount: $${data.loan_amount?.toLocaleString()}\n- Interest Rate: ${data.interest_rate}\n- Term: ${data.term_months} months\n- Monthly (Interest Only): $${data.monthly_interest_only?.toLocaleString()}\n- Monthly (P&I): $${data.monthly_pi?.toLocaleString()}\n- Points: ${data.points}\n- Origination Fee: $${data.origination_fee?.toLocaleString()}\n- Total Cost: $${data.total_cost?.toLocaleString()}`
    }
    if (tool === "alpaca_get_quote" && data.quote) {
      return `## Stock Quote: ${data.symbol}\n\n- Bid: $${data.quote.bp}\n- Ask: $${data.quote.ap}\n- Bid Size: ${data.quote.bs}\n- Ask Size: ${data.quote.as}`
    }
    if (tool === "ask_perplexity" || tool === "ask_grok" || tool === "ask_groq") {
      return data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2)
    }
    return JSON.stringify(data, null, 2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "text",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const query = input
    setInput("")
    setIsLoading(true)

    try {
      const { tool, type } = detectIntent(query)
      setActiveTool(tool)

      const toolArgs = buildToolArgs(tool, query)

      // Call MCP endpoint
      const response = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "tools/call",
          params: { name: tool, arguments: toolArgs },
        }),
      })

      const data = await response.json()

      let content = ""
      let parsedData = null

      try {
        parsedData = JSON.parse(data.content?.[0]?.text || "{}")
        content = formatResponse(tool, parsedData)
      } catch {
        content = data.content?.[0]?.text || JSON.stringify(data)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        type,
        data: parsedData,
        timestamp: new Date(),
        tool,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "text",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setActiveTool(null)
    }
  }

  const handleToolClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return (
        <div key={message.id} className="flex justify-end mb-6">
          <div className="max-w-[80%] bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl px-5 py-4">
            <p className="text-foreground/90">{message.content}</p>
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className="flex justify-start mb-6">
        <div className="max-w-[90%]">
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            {message.tool && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-border/60 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-primary text-xs font-mono">{message.tool}</span>
              </div>
            )}
            <div className="p-5">
              {message.type === "image" && message.data?.output?.[0] && (
                <img
                  src={message.data.output[0] || "/placeholder.svg"}
                  alt="Generated"
                  className="rounded-xl w-full max-w-lg mb-4"
                />
              )}
              <div className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
              {message.type === "deal" && message.data && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Export Report
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Users className="h-4 w-4" />
                    Save to CRM
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="CookinCap" width={40} height={40} className="rounded-xl shadow-lg" />
            <div>
              <h1 className="text-foreground font-bold text-lg">
                SaintSal™ <span className="text-primary">Research</span>
              </h1>
              <p className="text-muted-foreground text-xs">Command Center • 35+ Tools</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">HACP™</span>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Sidebar - Tool Categories */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card/50 border-r border-border/40 overflow-y-auto p-4 hidden lg:block">
          {TOOL_CATEGORIES.map((category, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-muted-foreground text-xs font-semibold mb-2 px-2 flex items-center gap-2">
                <category.icon className="h-4 w-4" />
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.tools.map((tool, j) => (
                  <button
                    key={j}
                    onClick={() => handleToolClick(tool.prompt)}
                    className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all flex items-center justify-between group"
                  >
                    <span>{tool.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-48 px-6">
          <div className="max-w-4xl mx-auto pt-8">
            {/* Welcome State */}
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-3">Research Command Center</h2>
                <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
                  35+ tools at your command. Search, research, enrich leads, analyze deals, generate images, trade
                  stocks - all in one place.
                </p>
                <p className="text-primary/70 text-sm mb-8">Powered by HACP™ Protocol • US Patent #10,290,222</p>

                {/* Quick Start Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {QUICK_START.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleToolClick(item.prompt)}
                      className="p-4 bg-card hover:bg-muted/50 border border-border/60 hover:border-primary/30 rounded-xl text-left transition-all group"
                    >
                      <item.icon className="h-6 w-6 text-primary mb-2" />
                      <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-2">
              {messages.map(renderMessage)}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-card border border-border/60 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {activeTool ? `Running ${activeTool}...` : "Processing..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-card border border-border/60 focus-within:border-primary/50 rounded-2xl overflow-hidden transition-all shadow-xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Search, research, lookup properties, enrich leads, analyze deals..."
                className="w-full bg-transparent text-foreground placeholder-muted-foreground px-5 py-4 pr-32 resize-none focus:outline-none min-h-[56px] max-h-[200px]"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isRecording ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <Button type="submit" disabled={!input.trim() || isLoading} className="rounded-xl px-4">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-3">
            SaintSal™ Research Command Center • CookinCapital
          </p>
        </div>
      </div>
    </div>
  )
}
