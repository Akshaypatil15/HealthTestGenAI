"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatSuggestions } from "@/components/chat/chat-suggestions"

export default function ChatPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("")

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Healthcare Test Case Generator</h1>
        <p className="text-muted-foreground">
          Upload healthcare requirements and specifications to automatically generate compliant test cases. Sign in for
          advanced features and chat history backup.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
        <ChatInterface initialMessage={selectedSuggestion} />
      </div>
    </div>
  )
}
