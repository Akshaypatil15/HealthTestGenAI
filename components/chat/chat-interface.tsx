"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, Paperclip } from "lucide-react"
import { extractTextFromFile } from "@/lib/file-processing"
import { AgentSelector } from "./agent-selector"
import { agentManager } from "@/lib/agent-manager"
import { firestoreService } from "@/lib/firestore-service" // Import Firestore service for chat backup

interface ChatInterfaceProps {
  initialMessage?: string
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState("")
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState(agentManager.getDefaultAgent().id)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        isAuthenticated: !!user,
        agentId: selectedAgentId,
      },
    }),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: user
              ? `Welcome to the Healthcare Test Case Generator! I can help you convert healthcare software requirements into compliant test cases. Upload your specifications (PDF, TXT) and I'll analyze them to generate comprehensive test cases following FDA, IEC 62304, and ISO standards. How can I assist you today?`
              : `Hello! I'm your Healthcare Test Case Generator. I can help analyze requirements and generate compliant test cases. You can chat with me right now! Sign in to unlock file uploads, document analysis, and chat history backup features.`,
          },
        ],
      },
    ],
    onError: (error) => {
      console.error("[v0] Chat API error:", error)
    },
  })

  const currentAgent = agentManager.getAgent(selectedAgentId) || agentManager.getDefaultAgent()

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user || !selectedAgentId) return

      setIsLoadingHistory(true)
      try {
        const history = await firestoreService.getChatHistoryByAgent(selectedAgentId, 50)

        const chatMessages = history.map((msg, index) => ({
          id: msg.id || `history-${index}`,
          role: msg.role,
          parts: [{ type: "text" as const, text: msg.content }],
        }))

        const welcomeMessage = {
          id: "welcome",
          role: "assistant" as const,
          parts: [
            {
              type: "text" as const,
              text: `Welcome back! I've loaded your previous conversation with ${currentAgent.name}. How can I help you continue with your healthcare test case generation?`,
            },
          ],
        }

        setMessages(chatMessages.length > 0 ? [welcomeMessage, ...chatMessages] : [welcomeMessage])
      } catch (error) {
        console.error("[v0] Error loading chat history:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
  }, [selectedAgentId, user, setMessages, currentAgent.name])

  const safeSendMessage = async (content: string, fileExtractedText?: string) => {
    try {
      console.log("[v0] Sending message:", content)
      await sendMessage({ text: content })

      if (user) {
        const saved = await firestoreService.saveChatMessage("user", content, selectedAgentId, fileExtractedText)
        if (!saved) {
          console.log("[v0] Chat backup unavailable - continuing without backup")
        }
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    }
  }

  useEffect(() => {
    const saveAssistantMessages = async () => {
      if (user && messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        if (lastMessage.role === "assistant" && lastMessage.id !== "welcome") {
          const content = lastMessage.parts.map((part) => (part.type === "text" ? part.text : "")).join("")

          const saved = await firestoreService.saveChatMessage("assistant", content, selectedAgentId)
          if (!saved) {
            console.log("[v0] Assistant message backup unavailable - continuing without backup")
          }
        }
      }
    }

    saveAssistantMessages()
  }, [messages, user, selectedAgentId])

  useEffect(() => {
    if (initialMessage && initialMessage !== inputValue) {
      setInputValue(initialMessage)
    }
  }, [initialMessage])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleFileUpload = async (files: FileList) => {
    if (!user || files.length === 0) return

    setIsProcessingFile(true)

    try {
      for (const file of Array.from(files)) {
        const allowedTypes = ["application/pdf", "text/plain"]
        const maxSize = 10 * 1024 * 1024

        if (!allowedTypes.includes(file.type)) {
          await safeSendMessage(
            `❌ File "${file.name}" rejected: Only PDF and TXT files are allowed for healthcare requirement analysis.`,
          )
          continue
        }

        if (file.size > maxSize) {
          await safeSendMessage(`❌ File "${file.name}" rejected: File size must be less than 10MB.`)
          continue
        }

        const extractedText = await extractTextFromFile(file)

        await safeSendMessage(
          `📄 Healthcare Requirements Document Uploaded: "${file.name}"\n\nExtracted Content:\n\n${extractedText}\n\nPlease analyze this healthcare software requirement and generate compliant test cases following FDA, IEC 62304, ISO 9001, ISO 13485, and ISO 27001 standards. Include traceability matrix and compliance validation.`,
          extractedText, // Pass extracted text for Firestore storage
        )
      }
    } catch (error) {
      await safeSendMessage(
        `❌ Error processing healthcare requirement document: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    } finally {
      setIsProcessingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || status === "in_progress" || isProcessingFile) return

    await safeSendMessage(inputValue)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-4">
      <AgentSelector selectedAgentId={selectedAgentId} onAgentChange={setSelectedAgentId} />

      <div className="flex flex-col h-[600px]">
        <Card className="rounded-b-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle>{currentAgent.name}</CardTitle>
                {isLoadingHistory && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="flex items-center space-x-2">
                {user ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Authenticated + Backup
                  </Badge>
                ) : (
                  <Badge variant="outline">Guest Mode</Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="flex-1 rounded-none border-t-0">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.role === "assistant" ? (
                        <>
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={user?.photoURL || ""} />
                          <AvatarFallback className="bg-secondary/10">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.parts
                            .map((part, index) => {
                              if (part.type === "text") {
                                return part.text
                              }
                              return ""
                            })
                            .join("")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleTimeString()}
                        {!user && message.role === "user" && " (Guest)"}
                      </p>
                    </div>
                  </div>
                ))}
                {(status === "in_progress" || isProcessingFile) && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-muted">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            {isProcessingFile ? "Processing file..." : "AI is thinking..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="rounded-t-none border-t-0">
          <CardContent className="p-4">
            {!user && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      You can chat freely! Sign in to unlock healthcare document uploads, test case generation, and chat
                      history backup
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your healthcare software requirements or upload specification documents..."
                  disabled={status === "in_progress" || isProcessingFile}
                  className="pr-12"
                />
                {user && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.txt"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="chat-file-upload"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingFile}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={status === "in_progress" || !inputValue.trim() || isProcessingFile}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {user && <span>Upload healthcare requirements • Chat history automatically backed up</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
