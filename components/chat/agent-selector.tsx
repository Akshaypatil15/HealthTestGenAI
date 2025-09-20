"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Lock, Unlock } from "lucide-react"
import { agentManager } from "@/lib/agent-manager"

interface AgentSelectorProps {
  selectedAgentId: string
  onAgentChange: (agentId: string) => void
}

export function AgentSelector({ selectedAgentId, onAgentChange }: AgentSelectorProps) {
  const { user } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  const availableAgents = agentManager.getAvailableAgents(!!user)
  const selectedAgent = agentManager.getAgent(selectedAgentId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Agent</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>
      </div>

      <Select value={selectedAgentId} onValueChange={onAgentChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an AI agent" />
        </SelectTrigger>
        <SelectContent>
          {availableAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center space-x-2">
                <span>{agent.name}</span>
                {agent.requiresAuth && <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showDetails && selectedAgent && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedAgent.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedAgent.model}</Badge>
                {selectedAgent.requiresAuth ? (
                  <Badge variant="destructive">
                    <Lock className="h-3 w-3 mr-1" />
                    Auth Required
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Unlock className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>{selectedAgent.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature:</span>
                <span>{selectedAgent.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Steps:</span>
                <span>{selectedAgent.maxSteps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tools:</span>
                <span>{selectedAgent.tools.length} available</span>
              </div>
            </div>

            {selectedAgent.requiresAuth && !user && (
              <div className="mt-3 p-2 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground">
                  This agent requires authentication. Please sign in to use advanced features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
