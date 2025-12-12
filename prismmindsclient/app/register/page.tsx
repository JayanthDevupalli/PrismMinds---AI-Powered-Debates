"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, googleProvider, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react"

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const checks = [
    { test: form.password.length >= 8, text: "8+ characters" },
    { test: /[A-Z]/.test(form.password), text: "Uppercase" },
    { test: /[0-9]/.test(form.password), text: "Number" },
    { test: /[^A-Za-z0-9]/.test(form.password), text: "Symbol" },
  ]
  const passed = checks.filter(c => c.test).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passed < 3) return setError("Password too weak")

    setLoading(true)
    setError("")
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })
      await setDoc(doc(db, "users", cred.user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
      })
      router.push("/dashboard")
    } catch (err: any) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email already in use"
          : "Failed to sign up"
      )
    } finally {
      setLoading(false)
    }
  }

  const googleSignIn = async () => {
    setLoading(true)
    try {
      const res = await signInWithPopup(auth, googleProvider)
      await setDoc(doc(db, "users", res.user.uid), {
        name: res.user.displayName || "User",
        email: res.user.email,
        createdAt: new Date(),
      }, { merge: true })
      router.push("/dashboard")
    } catch {
      setError("Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Soft base glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-purple-50" />

        {/* Aurora-style flowing light waves – pure 2025 magic */}
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-40"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #dbeafe 20%, #e0e7ff 40%, #f0abfc 60%, #fce7f3 80%, transparent 100%)",
            backgroundSize: "300% 100%",
            filter: "blur(80px)"
          }}
        />

        {/* Floating pastel orbs with gentle movement */}
        <motion.div
          animate={{ y: [-60, 60, -60], x: [-40, 40, -40] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-20 w-[420px] h-[420px] bg-gradient-to-br from-blue-200/50 via-purple-200/40 to-pink-200/30 rounded-full blur-3xl"
        />

        <motion.div
          animate={{ y: [40, -80, 40], x: [60, -60, 60] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-gradient-to-tl from-cyan-200/40 via-indigo-200/30 to-purple-200/40 rounded-full blur-3xl"
        />

        {/* Center soft glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-100/30 via-purple-100/20 to-transparent rounded-full blur-3xl opacity-60"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-7">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden bg-transparent">
              <img
                src="mainlogo.png"  // ← your real logo path
                alt="PrismMinds Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mt-4">Join PrismMinds Now</h1>
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                required
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                required
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                required
                type={showPass ? "text" : "password"}
                placeholder="Create password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password checklist */}
            {form.password && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {checks.map((c, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${c.test ? "text-emerald-600" : "text-gray-400"}`}>
                    <Check className="w-3.5 h-3.5" />
                    {c.text}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || passed < 3}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button
            onClick={googleSignIn}
            disabled={loading}
            className="w-full h-11 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-800 font-medium flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 6.75c1.63 0 3.06.56 4.21 1.65l3.15-3.15C16.85 2.23 14.46 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-md text-gray-600 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}