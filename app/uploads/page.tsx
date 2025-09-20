"use client"

import { useAuth } from "@/contexts/auth-context"
import { FileUpload } from "@/components/upload/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Brain, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UploadedFileInfo {
  name: string
  url: string
  uploadedAt: Date
}

export default function UploadsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    const newFile: UploadedFileInfo = {
      name: fileName,
      url: fileUrl,
      uploadedAt: new Date(),
    }
    setUploadedFiles((prev) => [newFile, ...prev])
  }

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
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">File Upload & Management</h1>
        <p className="text-muted-foreground">
          Upload PDF and TXT files for AI-powered analysis and insights. Your files are securely stored in Google Cloud
          Storage.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        <div className="space-y-6">
          {/* Upload Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Analysis</span>
              </CardTitle>
              <CardDescription>How your files will be processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Content Extraction</p>
                  <p className="text-xs text-muted-foreground">Text content is extracted from your files</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">AI Processing</p>
                  <p className="text-xs text-muted-foreground">Google AI Platform analyzes and generates insights</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Chat Integration</p>
                  <p className="text-xs text-muted-foreground">Ask questions about your uploaded content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Your latest uploaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg border">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.uploadedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                  <Link href="/chat">Analyze in Chat</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Your files are securely stored in Google Cloud Storage with enterprise-grade encryption and access
              controls.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
