"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, FileText, TrendingUp, Clock, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function InsightsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mock insights data (will be replaced with real data from AI processing)
  const insights = [
    {
      id: "1",
      title: "Document Summary Analysis",
      description: "Key themes and topics extracted from your uploaded documents",
      type: "summary",
      createdAt: new Date("2024-01-15"),
      fileCount: 3,
      status: "completed",
    },
    {
      id: "2",
      title: "Content Sentiment Analysis",
      description: "Emotional tone and sentiment patterns across your documents",
      type: "sentiment",
      createdAt: new Date("2024-01-14"),
      fileCount: 2,
      status: "processing",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
        <p className="text-muted-foreground">
          View AI-generated insights and analysis from your uploaded documents. Get summaries, key themes, and
          intelligent recommendations.
        </p>
      </div>

      {insights.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Insights Yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload some files to start generating AI-powered insights and analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/uploads">Upload Files</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/chat">Start Chatting</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {insight.type === "summary" ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="mt-1">{insight.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={insight.status === "completed" ? "secondary" : "outline"}>
                      {insight.status === "completed" ? "Ready" : "Processing"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{insight.fileCount} files analyzed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{insight.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled={insight.status !== "completed"}>
                      View Details
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/chat">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Discuss
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Generate New Insights */}
          <Card className="border-dashed">
            <CardContent className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Generate New Insights</h3>
              <p className="text-muted-foreground mb-4">
                Upload more files or request specific analysis types to generate additional insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild>
                  <Link href="/uploads">Upload More Files</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/chat">Request Analysis</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
