// API to initialize the SaintSal knowledge base
import { initializeKnowledgeBase } from "@/lib/saintsal/rag"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Simple auth check - require a secret
    const { secret } = await req.json()

    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initializeKnowledgeBase()

    return NextResponse.json({
      success: true,
      message: "Knowledge base initialized successfully",
    })
  } catch (error) {
    console.error("[Knowledge Init] Error:", error)
    return NextResponse.json({ error: "Failed to initialize knowledge base" }, { status: 500 })
  }
}
