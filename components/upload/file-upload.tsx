"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle, AlertCircle, Brain } from "lucide-react"
import { extractTextFromFile } from "@/lib/file-processing"

interface FileUploadProps {
  onUploadComplete?: (fileName: string, extractedText: string, analysis?: any) => void
}

interface ProcessedFile {
  id: string
  name: string
  size: number
  type: string
  status: "processing" | "completed" | "error"
  progress: number
  error?: string
  extractedText?: string
  analysis?: any
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { user } = useAuth()
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["application/pdf", "text/plain"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return "Only PDF and TXT files are allowed"
    }

    if (file.size > maxSize) {
      return "File size must be less than 10MB"
    }

    return null
  }

  const handleFileUpload = async (selectedFiles: FileList) => {
    if (!user) return

    const newFiles: ProcessedFile[] = Array.from(selectedFiles).map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "processing" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    for (const [index, file] of Array.from(selectedFiles).entries()) {
      const fileId = newFiles[index].id
      const validationError = validateFile(file)

      if (validationError) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error" as const,
                  error: validationError,
                }
              : f,
          ),
        )
        continue
      }

      let progressInterval: NodeJS.Timeout | null = null

      try {
        progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId && f.progress < 70
                ? {
                    ...f,
                    progress: f.progress + Math.random() * 15,
                  }
                : f,
            ),
          )
        }, 200)

        const extractedText = await extractTextFromFile(file)

        clearInterval(progressInterval)

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "completed" as const,
                  progress: 100,
                  extractedText,
                }
              : f,
          ),
        )

        onUploadComplete?.(file.name, extractedText)
      } catch (error) {
        clearInterval(progressInterval)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Processing failed",
                }
              : f,
          ),
        )
      }
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please sign in to upload files.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>File Upload</span>
          </CardTitle>
          <CardDescription>
            Upload PDF and TXT files for AI analysis - text content will be extracted and sent to the AI agent (max 10MB
            per file)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
            <p className="text-muted-foreground mb-4">Supports PDF and TXT files up to 10MB</p>
            <input
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Files</CardTitle>
            <CardDescription>
              Track your file processing progress - text content is extracted for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        {file.status === "completed" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Text Extracted
                          </Badge>
                        )}
                        {file.status === "processing" && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Brain className="h-3 w-3 mr-1" />
                            Processing
                          </Badge>
                        )}
                        {file.status === "error" && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatFileSize(file.size)} • {file.type === "application/pdf" ? "PDF" : "TXT"}
                    </p>
                    {file.status === "processing" && <Progress value={file.progress} className="h-2" />}
                    {file.status === "error" && file.error && <p className="text-xs text-destructive">{file.error}</p>}
                    {file.extractedText && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <p className="font-medium">Text Extracted Successfully</p>
                        <p className="text-muted-foreground">
                          {file.extractedText.length} characters extracted • Ready for AI analysis
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
