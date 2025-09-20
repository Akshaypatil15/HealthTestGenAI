import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const insightsSchema = z.object({
  title: z.string().describe("Title for the insight report"),
  overview: z.string().describe("High-level overview of the insights"),
  keyFindings: z
    .array(
      z.object({
        finding: z.string(),
        importance: z.enum(["high", "medium", "low"]),
        category: z.string(),
      }),
    )
    .describe("Key findings from the analysis"),
  recommendations: z.array(z.string()).describe("Actionable recommendations"),
  trends: z.array(z.string()).describe("Identified trends and patterns"),
  nextSteps: z.array(z.string()).describe("Suggested next steps"),
  confidence: z.number().min(0).max(1).describe("Overall confidence in the insights"),
})

export async function POST(req: Request) {
  try {
    const { topic, context, fileAnalyses, userId } = await req.json()

    if (!userId) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    // Combine all available context
    const combinedContext = [
      `Topic: ${topic}`,
      `Context: ${context}`,
      fileAnalyses?.length > 0 ? `File analyses: ${JSON.stringify(fileAnalyses)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n")

    const { object: insights } = await generateObject({
      model: openai("gpt-4"),
      schema: insightsSchema,
      messages: [
        {
          role: "system",
          content:
            "You are an expert business analyst and insights generator. Create comprehensive, actionable insights based on the provided information. Focus on practical recommendations and clear next steps.",
        },
        {
          role: "user",
          content: `Generate comprehensive insights based on this information:\n\n${combinedContext}`,
        },
      ],
      temperature: 0.4,
    })

    return Response.json({
      success: true,
      insights: {
        ...insights,
        generatedAt: new Date().toISOString(),
        userId,
        sources: {
          topic,
          context,
          fileCount: fileAnalyses?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error("Insights generation error:", error)
    return Response.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
