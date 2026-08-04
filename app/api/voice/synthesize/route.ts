import { type NextRequest, NextResponse } from "next/server"
import { assertOutboundAllowed } from "@/lib/compliance/outbound-gate"

/**
 * Text-to-speech. Two purposes, deliberately separated:
 *
 *   purpose "in_app"   — the SaintSal assistant speaking to a signed-in user
 *                        inside the product. No TCPA exposure.
 *   purpose "outbound" — synthesized speech placed on a call to a consumer.
 *                        The FCC's Feb 2024 declaratory ruling (FCC-24-17) puts
 *                        an AI voice inside the TCPA's "artificial voice"
 *                        prohibition, so this path must pass the outbound gate
 *                        and the disclosure preamble is prepended to the script.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voice = "adam", purpose = "in_app" } = body
    let text: string = body.text

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (purpose === "outbound") {
      const decision = await assertOutboundAllowed({
        channel: "voice_ai",
        phone: body.phone ?? null,
        state: body.state ?? null,
        radarId: body.radarId ?? null,
        writtenConsent: body.writtenConsent ?? null,
        complianceGateCleared: body.complianceGateCleared === true,
        disclosureInScript: body.disclosureInScript === true,
        recordingConsentInScript: body.recordingConsentInScript === true,
        body: text,
      })
      if (!decision.allowed) {
        return NextResponse.json(
          {
            error: "Outbound AI voice blocked by the compliance gate.",
            blockers: decision.blockers,
            warnings: decision.warnings,
          },
          { status: 451 },
        )
      }
      text = [...decision.requiredPreamble, text].join(" ")
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
