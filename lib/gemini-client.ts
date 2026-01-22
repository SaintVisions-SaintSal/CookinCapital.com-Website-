import { GoogleGenerativeAI } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[v0] Gemini API key not configured")
    return null
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }

  return genAI
}

export async function generateWithGemini(prompt: string, systemPrompt?: string) {
  const client = getGeminiClient()
  if (!client) {
    throw new Error("Gemini client not available")
  }

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  return response.text()
}

export async function streamWithGemini(prompt: string, systemPrompt?: string) {
  const client = getGeminiClient()
  if (!client) {
    throw new Error("Gemini client not available")
  }

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

  const result = await model.generateContentStream(fullPrompt)
  return result.stream
}
