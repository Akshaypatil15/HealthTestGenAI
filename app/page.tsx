"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Brain, Shield, Zap, TestTube, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Automate <span className="text-primary">Healthcare Test Case Generation</span> with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Transform healthcare software requirements into compliant, traceable test cases using advanced AI. Reduce
            manual testing effort while ensuring FDA, IEC 62304, and ISO compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/chat">Start Generating Tests</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/chat">Try Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful AI-Driven Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage Google AI technologies to automate complex healthcare test case generation and compliance
            validation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Document Processing</CardTitle>
              <CardDescription>
                Convert natural language and structured specifications (PDF, Word, XML) into comprehensive test cases
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TestTube className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Healthcare Compliance</CardTitle>
              <CardDescription>
                Ensure FDA, IEC 62304, ISO 9001, ISO 13485, and ISO 27001 standards with full requirement traceability
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Powered by Google Gemini and Vertex AI for intelligent requirement interpretation and test generation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Enterprise Integration</CardTitle>
              <CardDescription>
                Seamlessly connect with ALM platforms like Jira, Polarion, and Azure DevOps
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>GDPR-Compliant</CardTitle>
              <CardDescription>
                Built on Google Cloud Platform with GDPR compliance for secure healthcare data processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Automated Validation</CardTitle>
              <CardDescription>
                Reduce manual testing effort by up to 80% while maintaining regulatory compliance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Testing Process?</CardTitle>
              <CardDescription>
                Join healthcare organizations already using AI to automate test case generation and ensure compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
