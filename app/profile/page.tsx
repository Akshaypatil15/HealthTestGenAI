"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

function getUserInitials(user: any): string {
  if (user.displayName) {
    const names = user.displayName.trim().split(" ")
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }
    return names[0].charAt(0).toUpperCase()
  }

  if (user.email) {
    const emailName = user.email.split("@")[0]
    const names = emailName.split(/[._-]/)
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
    }
    return names[0].charAt(0).toUpperCase()
  }

  return "U"
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      await updateProfile(displayName)
      setMessage("Profile updated successfully!")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                <AvatarFallback className="text-2xl">{getUserInitials(user)}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information for the Healthcare Test Case Generator</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email || ""} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This name will be used for your profile initials and display
                </p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    message.includes("successfully")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
