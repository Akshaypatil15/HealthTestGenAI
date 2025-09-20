"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { auth, isFirebaseConfigured } from "@/lib/firebase"

interface AuthContextType {
  user: any | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (displayName: string) => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const setupAuthListener = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth")
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        })
        return unsubscribe
      } catch (error) {
        console.error("Error setting up auth listener:", error)
        setLoading(false)
      }
    }

    setupAuthListener()
  }, [])

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add the required environment variables.")
    }
    const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth")
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add the required environment variables.")
    }
    const { signInWithEmailAndPassword } = await import("firebase/auth")
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add the required environment variables.")
    }
    const { createUserWithEmailAndPassword } = await import("firebase/auth")
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add the required environment variables.")
    }
    const { signOut: firebaseSignOut } = await import("firebase/auth")
    await firebaseSignOut(auth)
  }

  const updateProfile = async (displayName: string) => {
    if (!isFirebaseConfigured || !auth || !auth.currentUser) {
      throw new Error("Firebase is not configured or user is not authenticated.")
    }
    const { updateProfile: firebaseUpdateProfile } = await import("firebase/auth")
    await firebaseUpdateProfile(auth.currentUser, { displayName })
    // Trigger a re-render by updating the user state
    setUser({ ...auth.currentUser })
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    isConfigured: isFirebaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
