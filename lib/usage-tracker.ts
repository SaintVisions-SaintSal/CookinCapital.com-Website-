import { createClient } from "@/lib/supabase/server"

export interface UsageMetrics {
  conversationId: string
  userId?: string
  model: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  toolsUsed: string[]
  costUSD: number
  intent: string
  success: boolean
  errorMessage?: string
  timestamp: Date
}

// Token cost per 1M tokens (USD)
const MODEL_COSTS = {
  "anthropic/claude-opus-4-20250514": { input: 15, output: 75 },
  "anthropic/claude-sonnet-4-20250514": { input: 3, output: 15 },
  "anthropic/claude-3.5-sonnet-20241022": { input: 3, output: 15 },
  "anthropic/claude-haiku-3.5-20241022": { input: 0.8, output: 4 },
  "openai/gpt-4o": { input: 2.5, output: 10 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.6 },
  "openai/o1": { input: 15, output: 60 },
  "xai/grok-beta": { input: 5, output: 15 },
  "google/gemini-2.0-flash-exp": { input: 0, output: 0 }, // Free tier
  "perplexity/sonar-pro": { input: 3, output: 15 },
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || { input: 3, output: 15 }
  return (inputTokens / 1_000_000) * costs.input + (outputTokens / 1_000_000) * costs.output
}

export async function trackUsage(metrics: UsageMetrics): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Save to Supabase analytics table
    await supabase.from("saintsal_analytics").insert({
      event_type: "ai_usage",
      user_id: metrics.userId || null,
      data: {
        conversationId: metrics.conversationId,
        model: metrics.model,
        inputTokens: metrics.inputTokens,
        outputTokens: metrics.outputTokens,
        latencyMs: metrics.latencyMs,
        toolsUsed: metrics.toolsUsed,
        costUSD: metrics.costUSD,
        intent: metrics.intent,
        success: metrics.success,
        errorMessage: metrics.errorMessage,
      },
      created_at: metrics.timestamp.toISOString(),
    })

    // Log to console for monitoring
    console.log("[v0] AI Usage Tracked:", {
      model: metrics.model,
      tokens: `${metrics.inputTokens}→${metrics.outputTokens}`,
      cost: `$${metrics.costUSD.toFixed(4)}`,
      latency: `${metrics.latencyMs}ms`,
      intent: metrics.intent,
    })
  } catch (error) {
    console.error("[v0] Usage tracking failed (non-critical):", error)
    // Don't throw - tracking failures shouldn't break user experience
  }
}

export function createUsageTracker(conversationId: string, userId?: string) {
  const startTime = Date.now()
  
  return {
    track: async (
      model: string,
      inputTokens: number,
      outputTokens: number,
      intent: string,
      toolsUsed: string[] = [],
      success: boolean = true,
      errorMessage?: string
    ) => {
      const latencyMs = Date.now() - startTime
      const costUSD = calculateCost(model, inputTokens, outputTokens)
      
      await trackUsage({
        conversationId,
        userId,
        model,
        inputTokens,
        outputTokens,
        latencyMs,
        toolsUsed,
        costUSD,
        intent,
        success,
        errorMessage,
        timestamp: new Date(),
      })
    },
  }
}
