"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageSquare, User, LogOut } from "lucide-react"
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

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      console.log("[v0] Starting sign out process")
      await signOut()
      console.log("[v0] Sign out successful, redirecting to home")
      router.replace("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">ChatAI</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
