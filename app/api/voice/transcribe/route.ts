import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as Blob

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 })
    }

    // Use Deepgram for transcription
    if (process.env.DEEPGRAM_API_KEY) {
      const audioBuffer = await audio.arrayBuffer()

      const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": audio.type || "audio/webm",
        },
        body: audioBuffer,
      })

      if (response.ok) {
        const result = await response.json()
        const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""
        return NextResponse.json({ transcript })
      }
    }

    // Fallback to AssemblyAI
    if (process.env.ASSEMBLYAI_API_KEY) {
      // Upload audio
      const audioBuffer = await audio.arrayBuffer()
      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          Authorization: process.env.ASSEMBLYAI_API_KEY!,
        },
        body: audioBuffer,
      })

      if (uploadResponse.ok) {
        const { upload_url } = await uploadResponse.json()

        // Request transcription
        const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
          method: "POST",
          headers: {
            Authorization: process.env.ASSEMBLYAI_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio_url: upload_url }),
        })

        if (transcriptResponse.ok) {
          const { id } = await transcriptResponse.json()

          // Poll for result
          let transcript = ""
          for (let i = 0; i < 30; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
              headers: { Authorization: process.env.ASSEMBLYAI_API_KEY! },
            })
            const pollResult = await pollResponse.json()
            if (pollResult.status === "completed") {
              transcript = pollResult.text
              break
            }
            if (pollResult.status === "error") break
          }

          return NextResponse.json({ transcript })
        }
      }
    }

    return NextResponse.json({ error: "No transcription service available" }, { status: 500 })
  } catch (error) {
    console.error("[Voice Transcribe] Error:", error)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}
