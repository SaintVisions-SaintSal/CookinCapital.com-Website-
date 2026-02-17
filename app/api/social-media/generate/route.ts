import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, type = "post", platform = "instagram" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
    const XAI_API_KEY = process.env.XAI_API_KEY

    // Step 1: Generate social media copy and concept using Grok
    const { text: socialCopyRaw } = await generateText({
      model: XAI_API_KEY ? "xai/grok-beta" : "anthropic/claude-sonnet-4-20250514",
      system: `You are an elite social media strategist specializing in real estate, finance, and investment content.

Create high-converting social media content that:
- Hooks attention in the first 3 seconds
- Uses pattern interrupts and curiosity gaps
- Includes relevant emojis and formatting
- Drives engagement and conversions
- Matches the platform's best practices

Platform specifications:
- Instagram: 2200 char limit, visual focus, lifestyle + education
- TikTok: Short hooks, trending sounds, entertainment value
- LinkedIn: Professional, data-driven, thought leadership
- YouTube Shorts: Strong opener, retention hooks, clear CTA`,
      prompt: `Create a ${platform} ${type} about: "${prompt}"

Return ONLY valid JSON in this exact format:
{
  "hook": "First 3-second attention grabber (10-15 words)",
  "caption": "Main caption (150-200 chars for Instagram, 100 for TikTok)",
  "fullCopy": "Complete post copy with emojis and line breaks",
  "videoConcept": "30-60 second video concept with specific scenes",
  "videoPrompt": "Detailed AI video generation prompt with cinematography, lighting, mood",
  "visualElements": ["element1", "element2", "element3"],
  "hashtags": ["hashtag1", "hashtag2"],
  "cta": "Clear call to action",
  "musicSuggestion": "Trending audio or music style",
  "estimatedEngagementRate": "3.5%"
}`,
    })

    // Parse the JSON response
    let socialData: any
    try {
      const jsonMatch = socialCopyRaw.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        socialData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("[Social Media] JSON parse error:", parseError)
      // Fallback to basic structure
      socialData = {
        hook: "Check this out! 👀",
        caption: socialCopyRaw.split("\n")[0].substring(0, 150),
        fullCopy: socialCopyRaw,
        videoConcept: `Engaging ${platform} video about ${prompt}`,
        videoPrompt: `Create a professional, high-quality video about ${prompt}. Cinematic lighting, modern aesthetic, engaging visuals.`,
        visualElements: ["text overlay", "dynamic transitions", "brand colors"],
        hashtags: ["realestate", "investing", "wealth", "property", "finance"],
        cta: "Learn more at CookinCapital.com 🔥",
        musicSuggestion: "Upbeat, motivational",
        estimatedEngagementRate: "2.5%",
      }
    }

    // Step 2: Generate video using Runway or Replicate
    let videoUrl: string | null = null
    let videoStatus = "pending"
    let videoProvider = "none"
    let videoTaskId: string | null = null

    // Try Runway first (higher quality)
    if (RUNWAY_API_KEY) {
      try {
        const runwayResponse = await fetch("https://api.runwayml.com/v1/tasks", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RUNWAY_API_KEY}`,
            "Content-Type": "application/json",
            "X-Runway-Version": "2024-11-06",
          },
          body: JSON.stringify({
            taskType: "gen3a_turbo",
            internal: false,
            options: {
              name: `CookinCapital_${Date.now()}`,
              seconds: 5,
              text_prompt: socialData.videoPrompt,
              watermark: false,
              enhance_prompt: true,
            },
          }),
        })

        if (runwayResponse.ok) {
          const runwayData = await runwayResponse.json()
          videoTaskId = runwayData.id
          videoUrl = runwayData.artifacts?.[0]?.url || null
          videoStatus = videoUrl ? "completed" : "processing"
          videoProvider = "runway"
          console.log("[Runway] Video generation initiated:", videoTaskId)
        } else {
          const errorText = await runwayResponse.text()
          console.error("[Runway] Error:", runwayResponse.status, errorText)
        }
      } catch (error) {
        console.error("[Runway] Request failed:", error)
      }
    }

    // Fallback to Replicate if Runway unavailable or failed
    if (!videoTaskId && REPLICATE_API_TOKEN) {
      try {
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
            Prefer: "wait",
          },
          body: JSON.stringify({
            version: "lucataco/animate-diff:1531004ee4c98894ab11f8a4ce6206099e732c1da15121987a8eef54828f0663",
            input: {
              path: "toonyou_beta3.safetensors",
              seed: Math.floor(Math.random() * 1000000),
              steps: 25,
              prompt: socialData.videoPrompt,
              n_prompt: "low quality, blurry, distorted",
              motion_module: "mm_sd_v15_v2",
              guidance_scale: 7.5,
            },
          }),
        })

        if (replicateResponse.ok) {
          const replicateData = await replicateResponse.json()
          videoTaskId = replicateData.id
          videoUrl = replicateData.output?.[0] || replicateData.urls?.get || null
          videoStatus = replicateData.status === "succeeded" ? "completed" : "processing"
          videoProvider = "replicate"
          console.log("[Replicate] Video generation initiated:", videoTaskId)
        } else {
          const errorText = await replicateResponse.text()
          console.error("[Replicate] Error:", replicateResponse.status, errorText)
        }
      } catch (error) {
        console.error("[Replicate] Request failed:", error)
      }
    }

    // Step 3: Return complete social media package
    const result = {
      success: true,
      content: {
        ...socialData,
        platform,
        type,
        originalPrompt: prompt,
      },
      video: {
        url: videoUrl,
        status: videoStatus,
        provider: videoProvider,
        taskId: videoTaskId,
        checkStatusUrl: videoTaskId ? `/api/social-media/video-status?id=${videoTaskId}&provider=${videoProvider}` : null,
      },
      generatedAt: new Date().toISOString(),
      ready: videoStatus === "completed",
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Social Media API] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate social media content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check video generation status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("id")
    const provider = searchParams.get("provider")

    if (!taskId || !provider) {
      return NextResponse.json({ error: "Task ID and provider required" }, { status: 400 })
    }

    let videoUrl: string | null = null
    let status = "processing"

    if (provider === "runway" && process.env.RUNWAY_API_KEY) {
      const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      })

      if (response.ok) {
        const data = await response.json()
        status = data.status === "SUCCEEDED" ? "completed" : data.status === "FAILED" ? "failed" : "processing"
        videoUrl = data.artifacts?.[0]?.url || null
      }
    } else if (provider === "replicate" && process.env.REPLICATE_API_TOKEN) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${taskId}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        status = data.status === "succeeded" ? "completed" : data.status === "failed" ? "failed" : "processing"
        videoUrl = data.output?.[0] || null
      }
    }

    return NextResponse.json({
      taskId,
      provider,
      status,
      videoUrl,
      ready: status === "completed" && videoUrl !== null,
    })
  } catch (error) {
    console.error("[Video Status] Error:", error)
    return NextResponse.json({ error: "Failed to check video status" }, { status: 500 })
  }
}
