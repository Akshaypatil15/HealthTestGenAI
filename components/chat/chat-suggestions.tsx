"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Brain, Lightbulb } from "lucide-react"

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

export function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  const { user } = useAuth()

  const guestSuggestions = [
    "What can you help me with?",
    "Tell me about your capabilities",
    "How does AI chat work?",
    "Explain a complex topic to me",
  ]

  const userSuggestions = [
    "Analyze my uploaded documents",
    "Generate insights from my files",
    "Help me understand complex topics",
    "Create a summary of my conversations",
  ]

  const suggestions = user ? userSuggestions : guestSuggestions

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Suggested Questions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-3 text-left bg-transparent"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-2">
                {user ? (
                  <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm">{suggestion}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
