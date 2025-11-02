"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-background text-foreground">
      {/* Animated Prism SVG background */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full h-full">
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <path
            fill="url(#grad)"
            d="M0 300 Q400 150 800 300 Q400 450 0 300 Z"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
              M0 300 Q400 150 800 300 Q400 450 0 300 Z;
              M0 300 Q400 250 800 300 Q400 350 0 300 Z;
              M0 300 Q400 150 800 300 Q400 450 0 300 Z;"
            />
          </path>
        </svg>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl border border-border/50 backdrop-blur-md bg-card/40"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto bg-primary text-white flex items-center justify-center rounded-xl text-2xl font-bold shadow-sm">
            🧠
          </div>
          <h2 className="text-3xl font-semibold mt-4">Welcome back</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Sign in to continue exploring AI debates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
            <input
              required
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background/40 border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
            <input
              required
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background/40 border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full py-2 mt-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
          <div className="h-px w-16 bg-border/50" />
          <span className="mx-3">or</span>
          <div className="h-px w-16 bg-border/50" />
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full mt-4 flex items-center justify-center gap-2 border border-border/40 hover:bg-primary/10 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
