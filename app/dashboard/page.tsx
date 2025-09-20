"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Upload, FileText, Activity } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.displayName || "User"}!</h1>
        <p className="text-muted-foreground">
          Manage your conversations, uploads, and AI interactions from your dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Chat History</CardTitle>
            <CardDescription>View and continue your previous conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/chat">Open Chat</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Upload className="h-8 w-8 text-primary mb-2" />
            <CardTitle>File Uploads</CardTitle>
            <CardDescription>Manage your uploaded files and AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-transparent" variant="outline">
              <Link href="/uploads">View Uploads</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Review AI-generated insights from your files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-transparent" variant="outline">
              <Link href="/insights">View Insights</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent activity to display. Start a conversation or upload a file to see your activity here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
