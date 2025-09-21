import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import agentsConfig from "@/config/agents.json"

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  temperature: number
  maxSteps: number
  systemPrompt: string
  authenticatedSystemPrompt?: string
  tools: string[]
  requiresAuth: boolean
  endpoint: string
}

export interface AgentTool {
  description: string
  inputSchema: Record<string, string>
}

export class AgentManager {
  private agents: Map<string, Agent> = new Map()
  private tools: Map<string, AgentTool> = new Map()
  private defaultAgentId: string

  constructor() {
    this.loadConfiguration()
  }

  private loadConfiguration() {
    // Load agents
    agentsConfig.agents.forEach((agent: Agent) => {
      this.agents.set(agent.id, agent)
    })

    // Load tools
    Object.entries(agentsConfig.tools).forEach(([toolId, tool]) => {
      this.tools.set(toolId, tool as AgentTool)
    })

    this.defaultAgentId = agentsConfig.defaultAgent
  }

  getAgent(agentId: string): Agent | null {
    return this.agents.get(agentId) || null
  }

  getDefaultAgent(): Agent {
    const agent = this.agents.get(this.defaultAgentId)
    if (!agent) {
      throw new Error(`Default agent ${this.defaultAgentId} not found`)
    }
    return agent
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  getAvailableAgents(isAuthenticated: boolean): Agent[] {
    return Array.from(this.agents.values()).filter((agent) => !agent.requiresAuth || isAuthenticated)
  }

  getTool(toolId: string): AgentTool | null {
    return this.tools.get(toolId) || null
  }

  getAgentTools(agentId: string): AgentTool[] {
    const agent = this.getAgent(agentId)
    if (!agent) return []

    return agent.tools.map((toolId) => this.getTool(toolId)).filter((tool): tool is AgentTool => tool !== null)
  }

  getModelProvider(modelName: string) {
    console.log("[v0] Getting model provider for:", modelName)

    if (modelName.startsWith("gemini")) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      const googleModelName = process.env.GOOGLE_MODEL_NAME || "gemini-2.0-flash-exp"

      console.log("[v0] Google API key check:", {
        hasKey: !!apiKey,
        keyLength: apiKey?.length,
        keyPrefix: apiKey?.substring(0, 10) + "...",
        modelName: googleModelName,
      })

      if (!apiKey) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is required")
      }
      // console.log("[v0] Created Google model:", model)
      return google(googleModelName, {
        apiKey: apiKey,
      })
    } else if (modelName.startsWith("gpt")) {
      return openai(modelName)
    }

    // Default to Gemini with API key and configurable model name
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const googleModelName = process.env.GOOGLE_MODEL_NAME || "gemini-2.0-flash-exp"

    if (!apiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is required")
    }

    return google(googleModelName, {
      apiKey: apiKey,
    })
  }

  getSystemPrompt(agentId: string, isAuthenticated: boolean): string {
    const agent = this.getAgent(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    // Use authenticated system prompt if available and user is authenticated
    if (isAuthenticated && agent.authenticatedSystemPrompt) {
      return agent.authenticatedSystemPrompt
    }

    return agent.systemPrompt
  }

  combinePrompts(systemPrompt: string, userPrompt: string): string {
    return `${systemPrompt}\n\nUser: ${userPrompt}`
  }
}

// Singleton instance
export const agentManager = new AgentManager()
