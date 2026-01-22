import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    tokens?: { input: number; output: number }
    intent?: string
    tools?: string[]
  }
}

export class ConversationStore {
  private static TTL_DAYS = 7 // 7 days expiry
  private static MAX_MESSAGES = 50 // Keep last 50 messages

  static async getHistory(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const history = await redis.get<ConversationMessage[]>(`conv:${conversationId}`)
      return history || []
    } catch (error) {
      console.error("[v0] Redis get failed:", error)
      return [] // Graceful fallback
    }
  }

  static async saveMessage(
    conversationId: string,
    message: ConversationMessage
  ): Promise<void> {
    try {
      const history = await this.getHistory(conversationId)
      history.push(message)

      // Keep only last MAX_MESSAGES
      const trimmed = history.slice(-this.MAX_MESSAGES)

      await redis.set(`conv:${conversationId}`, trimmed, {
        ex: 86400 * this.TTL_DAYS, // Expire after 7 days
      })
    } catch (error) {
      console.error("[v0] Redis save failed (non-critical):", error)
      // Don't throw - persistence failures shouldn't break user experience
    }
  }

  static async clearHistory(conversationId: string): Promise<void> {
    try {
      await redis.del(`conv:${conversationId}`)
    } catch (error) {
      console.error("[v0] Redis delete failed:", error)
    }
  }

  static async getStats(conversationId: string): Promise<{
    messageCount: number
    oldestMessage?: Date
    newestMessage?: Date
  }> {
    const history = await this.getHistory(conversationId)
    return {
      messageCount: history.length,
      oldestMessage: history[0]?.timestamp,
      newestMessage: history[history.length - 1]?.timestamp,
    }
  }
}
