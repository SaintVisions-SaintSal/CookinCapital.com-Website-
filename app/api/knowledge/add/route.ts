// API to add documents to knowledge base
import { addToKnowledgeBase, type KnowledgeDocument } from "@/lib/saintsal/rag"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { secret, document } = (await req.json()) as { secret: string; document: KnowledgeDocument }

    // Simple auth check
    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!document.id || !document.category || !document.content) {
      return NextResponse.json({ error: "Missing required fields: id, category, content" }, { status: 400 })
    }

    await addToKnowledgeBase({
      ...document,
      lastUpdated: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Document ${document.id} added to knowledge base`,
    })
  } catch (error) {
    console.error("[Knowledge Add] Error:", error)
    return NextResponse.json({ error: "Failed to add document" }, { status: 500 })
  }
}
