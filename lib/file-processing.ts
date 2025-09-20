// Utility functions for file processing and AI analysis

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const result = event.target?.result as string

      if (file.type === "text/plain") {
        resolve(result)
      } else if (file.type === "application/pdf") {
        // In a real implementation, you would use a PDF parsing library
        // For now, we'll simulate PDF text extraction
        resolve(`[PDF Content] ${result.substring(0, 1000)}...`)
      } else {
        reject(new Error("Unsupported file type"))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))

    if (file.type === "text/plain") {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  })
}

export async function analyzeFileWithAI(fileName: string, content: string, userId: string) {
  try {
    const response = await fetch("/api/analyze-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileContent: content,
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze file")
    }

    const result = await response.json()
    return result.analysis
  } catch (error) {
    console.error("File analysis error:", error)
    throw error
  }
}

export async function generateInsights(topic: string, context: string, fileAnalyses: any[], userId: string) {
  try {
    const response = await fetch("/api/generate-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        context,
        fileAnalyses,
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate insights")
    }

    const result = await response.json()
    return result.insights
  } catch (error) {
    console.error("Insights generation error:", error)
    throw error
  }
}
