import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "adam" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Use ElevenLabs for voice synthesis
    if (process.env.ELEVENLABS_API_KEY) {
      // Voice IDs: adam, rachel, domi, bella, antoni, elli, josh, arnold, sam
      const voiceId = voice === "adam" ? "pNInz6obpgDQGcFmaJgB" : "21m00Tcm4TlvDq8ikWAM"

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
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

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer()
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
          },
        })
      }
    }

    return NextResponse.json({ error: "No synthesis service available" }, { status: 500 })
  } catch (error) {
    console.error("[Voice Synthesize] Error:", error)
    return NextResponse.json({ error: "Synthesis failed" }, { status: 500 })
  }
}
