import { convertToModelMessages, streamText, type UIMessage, tool, consumeStream } from "ai"
import { z } from "zod"
import { agentManager } from "@/lib/agent-manager"

export const maxDuration = 30

// Tool for analyzing uploaded files
const analyzeFileTool = tool({
  description: "Analyze uploaded files and provide insights",
  inputSchema: z.object({
    fileName: z.string().describe("Name of the file to analyze"),
    fileUrl: z.string().describe("URL of the uploaded file"),
    analysisType: z.enum(["summary", "insights", "questions"]).describe("Type of analysis to perform"),
  }),
  execute: async ({ fileName, fileUrl, analysisType }) => {
    // In a real implementation, this would:
    // 1. Download the file from Google Cloud Storage
    // 2. Extract text content (PDF/TXT)
    // 3. Use Google AI Platform for analysis
    // 4. Return structured insights

    // Mock analysis for demonstration
    const mockAnalysis = {
      summary: `Summary of ${fileName}: This document contains important information about the topic discussed. Key points include strategic insights, data analysis, and recommendations for future actions.`,
      insights: `Key insights from ${fileName}: 1) Market trends show positive growth, 2) Customer satisfaction is high, 3) Operational efficiency can be improved, 4) Technology adoption is accelerating.`,
      questions: `Suggested questions about ${fileName}: What are the main conclusions? How does this relate to current strategy? What actions should be taken next?`,
    }

    return {
      fileName,
      analysisType,
      result: mockAnalysis[analysisType],
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    }
  },
})

// Tool for generating document insights
const generateInsightsTool = tool({
  description: "Generate comprehensive insights from user conversation and uploaded files",
  inputSchema: z.object({
    topic: z.string().describe("Topic or theme to generate insights about"),
    context: z.string().describe("Additional context from conversation"),
  }),
  execute: async ({ topic, context }) => {
    // Mock insight generation
    return {
      topic,
      insights: [
        `Based on your conversation about ${topic}, here are key insights:`,
        "• Pattern analysis shows emerging trends in your data",
        "• Cross-referencing multiple sources reveals important connections",
        "• Recommendations include strategic adjustments and tactical improvements",
        "• Next steps should focus on implementation and monitoring",
      ].join("\n"),
      confidence: 0.92,
      sources: ["uploaded documents", "conversation context"],
      timestamp: new Date().toISOString(),
    }
  },
})

const tools = {
  analyzeFile: analyzeFileTool,
  generateInsights: generateInsightsTool,
}

console.log("[v0] Chat API: Environment check", {
  hasGoogleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  keyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
})

export async function POST(req: Request) {
  try {
    console.log("[v0] Chat API: Request received")

    const {
      messages,
      isAuthenticated,
      agentId = "chat-assistant",
    }: {
      messages: UIMessage[]
      isAuthenticated: boolean
      agentId?: string
    } = await req.json()

    console.log("[v0] Chat API: Parsed request", {
      messageCount: messages.length,
      isAuthenticated,
      agentId,
    })

    const agent = agentManager.getAgent(agentId) || agentManager.getDefaultAgent()
    console.log("[v0] Chat API: Agent loaded", { agentId: agent.id, model: agent.model })

    let model
    try {
      model = agentManager.getModelProvider(agent.model)
      console.log("[v0] Chat API: Model provider created successfully")
    } catch (error) {
      console.error("[v0] Chat API: Model provider error", error)
      return new Response(JSON.stringify({ error: "Model provider configuration error", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt = agentManager.getSystemPrompt(agentId, isAuthenticated)
    console.log("[v0] Chat API: System prompt generated", { length: systemPrompt.length })

    // Convert UI messages to model format
    const modelMessages = convertToModelMessages(messages)
    console.log("[v0] Chat API: Messages converted", { count: modelMessages.length })

    const systemMessage = {
      role: "system" as const,
      content: systemPrompt,
    }

    console.log("[v0] Chat API: Starting streamText")

    const result = streamText({
      model,
      messages: [systemMessage, ...modelMessages],
      tools: isAuthenticated ? tools : {}, // Only provide tools for authenticated users
      maxSteps: agent.maxSteps,
      temperature: agent.temperature,
      abortSignal: req.signal,
    })

    console.log("[v0] Chat API: streamText completed successfully")
    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted) {
          console.log("[v0] Chat API: Request aborted")
        }
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[v0] Chat API: Unexpected error", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
