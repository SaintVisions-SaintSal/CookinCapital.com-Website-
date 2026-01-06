// SaintSal Session Management - Works without auth
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface SaintSalSession {
  id: string
  userId?: string // Optional - only set when logged in
  conversations: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  context: {
    currentPage?: string
    lastDealAnalyzed?: string
    lastPropertySearched?: string
    interests: string[]
    intent?: "lending" | "investing" | "property_search" | "general"
  }
  createdAt: string
  lastActive: string
}

// Generate anonymous session ID
export function generateSessionId(): string {
  return `ss_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Get or create session
export async function getOrCreateSession(sessionId?: string): Promise<SaintSalSession> {
  if (sessionId) {
    const existing = await redis.get<SaintSalSession>(`saintsal:session:${sessionId}`)
    if (existing) {
      // Update last active
      existing.lastActive = new Date().toISOString()
      await redis.set(`saintsal:session:${sessionId}`, existing, { ex: 86400 * 7 }) // 7 day expiry
      return existing
    }
  }

  // Create new session
  const newSession: SaintSalSession = {
    id: sessionId || generateSessionId(),
    conversations: [],
    context: {
      interests: [],
    },
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  }

  await redis.set(`saintsal:session:${newSession.id}`, newSession, { ex: 86400 * 7 })
  return newSession
}

// Update session
export async function updateSession(session: SaintSalSession): Promise<void> {
  session.lastActive = new Date().toISOString()
  await redis.set(`saintsal:session:${session.id}`, session, { ex: 86400 * 7 })
}

// Add message to session
export async function addMessageToSession(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  const session = await getOrCreateSession(sessionId)

  session.conversations.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  })

  // Keep only last 50 messages
  if (session.conversations.length > 50) {
    session.conversations = session.conversations.slice(-50)
  }

  await updateSession(session)
}

// Update session context
export async function updateSessionContext(
  sessionId: string,
  context: Partial<SaintSalSession["context"]>,
): Promise<void> {
  const session = await getOrCreateSession(sessionId)
  session.context = { ...session.context, ...context }
  await updateSession(session)
}

// Link session to user when they log in
export async function linkSessionToUser(sessionId: string, userId: string): Promise<void> {
  const session = await getOrCreateSession(sessionId)
  session.userId = userId

  // Also store user's session reference
  await redis.set(`saintsal:user:${userId}:session`, sessionId, { ex: 86400 * 30 }) // 30 days

  await updateSession(session)
}

// Get session for logged-in user
export async function getUserSession(userId: string): Promise<SaintSalSession | null> {
  const sessionId = await redis.get<string>(`saintsal:user:${userId}:session`)
  if (sessionId) {
    return await getOrCreateSession(sessionId)
  }
  return null
}

// Get conversation history for context
export async function getConversationContext(sessionId: string, limit = 10): Promise<string> {
  const session = await getOrCreateSession(sessionId)
  const recent = session.conversations.slice(-limit)

  if (recent.length === 0) return ""

  return recent.map((m) => `${m.role === "user" ? "User" : "SaintSal"}: ${m.content}`).join("\n")
}
