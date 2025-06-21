"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUserProfile, getUserProfile, type UserProfile } from "@/lib/firestore"

interface AuthContextType {
  user: UserProfile | null
  firebaseUser: FirebaseUser | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)

      if (firebaseUser) {
        setFirebaseUser(firebaseUser)

        // Get or create user profile
        try {
          let userProfile = await getUserProfile(firebaseUser.uid)

          if (!userProfile) {
            // Create profile if it doesn't exist
            userProfile = await createUserProfile(firebaseUser.uid, {
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
            })
          }

          setUser(userProfile)
        } catch (error) {
          console.error("Error loading user profile:", error)
          setUser(null)
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, {
        name,
        email,
      })

      return true
    } catch (error) {
      console.error("Signup error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!firebaseUser) throw new Error("No user logged in")

    try {
      const { updateUserProfile } = await import("@/lib/firestore")
      await updateUserProfile(firebaseUser.uid, updates)

      // Update local state
      if (user) {
        setUser({ ...user, ...updates })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        signup,
        logout,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
