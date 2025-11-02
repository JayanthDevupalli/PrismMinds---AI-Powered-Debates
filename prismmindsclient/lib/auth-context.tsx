"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  googleSignIn: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔹 Track user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 🔹 Register new user
  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser = userCredential.user

    await updateProfile(newUser, { displayName: name })

    // ✅ Store uniquely by UID (prevents overriding)
    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid,
      name,
      email,
      createdAt: new Date().toISOString(),
    })
  }

  // 🔹 Email + Password login
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  // 🔹 Google Sign-In
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // ✅ Merge ensures old data isn’t lost
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    )
  }

  // 🔹 Logout
  const logout = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
