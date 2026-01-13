import { NextResponse } from "next/server"

// ElevenLabs Voice API for SaintSal
// Uses the Conversational AI agent

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ElevenLabs API not configured" }, { status: 500 })
    }

    // Use ElevenLabs text-to-speech for SaintSal voice
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[ElevenLabs] Error:", error)
      return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("[ElevenLabs] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to check if ElevenLabs is configured
export async function GET() {
  return NextResponse.json({
    configured: !!ELEVENLABS_API_KEY,
    agent: "SaintSal Voice Assistant",
  })
}
