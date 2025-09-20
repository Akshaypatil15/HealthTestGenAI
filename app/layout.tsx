import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Healthcare Test Case Generator - AI-Powered Compliance Testing",
  description:
    "Automate healthcare software test case generation with AI. Convert requirements into FDA, IEC 62304, and ISO compliant test cases using Google AI technologies.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
            <main className="min-h-screen">{children}</main>
          </Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
