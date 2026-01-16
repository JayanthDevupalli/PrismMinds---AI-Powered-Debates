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
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  // Gamification fields
  xp: number
  level: number
  badges: string[] // REMOVED but keeping type definition safe if needed, though we removed it from logic. Actually, let's keep it clean.
  lastActivityDate: string | null
  bio?: string
}


type AuthContextType = {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  logout: () => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  updateBio: (bio: string) => Promise<void>
  deleteUserAccount: () => Promise<void>
  updateUserPassword: (password: string) => Promise<void>
  reauthenticate: (password: string) => Promise<void>
}



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 🔹 Track user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended data from Firestore
        try {
          // Import dynamic to avoid circular dep issues if any, or just use db from outer scope
          const { doc, getDoc } = await import("firebase/firestore")
          const { db } = await import("./firebase") // Ensure correct path

          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.exists() ? userDoc.data() : {}

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            xp: userData.xp || 0,
            level: userData.level || 1,
            badges: userData.badges || [],
            lastActivityDate: userData.lastActivityDate || null,
            bio: userData.bio || ""
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Fallback minimal user if firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            xp: 0,
            level: 1,
            badges: [],
            lastActivityDate: null
          })
        }
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
        updateDisplayName: async (name: string) => {
          if (user && auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: name });
            // Update local state to reflect change immediately
            setUser(prev => prev ? { ...prev, displayName: name } : null);

            // Update Firestore as well
            await setDoc(doc(db, "users", user.uid), { name }, { merge: true });
          }
        },
        updateBio: async (bio: string) => {
          if (user) {
            // Update local state
            setUser(prev => prev ? { ...prev, bio } : null);
            // Update Firestore
            await setDoc(doc(db, "users", user.uid), { bio }, { merge: true });
          }
        },
        deleteUserAccount: async () => {
          // Deleting logic handled by API, but we can sign out client-side cleanup here if needed
          if (auth.currentUser) {
            await auth.currentUser.delete();
          }
        },
        updateUserPassword: async (password: string) => {
          if (auth.currentUser) {
            await updatePassword(auth.currentUser, password)
          }
        },
        reauthenticate: async (password: string) => {
          if (auth.currentUser && auth.currentUser.email) {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
            await reauthenticateWithCredential(auth.currentUser, credential)
          }
        }
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
