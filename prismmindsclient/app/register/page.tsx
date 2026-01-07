"use client"

import Head from 'next/head';
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { auth, googleProvider, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile, getAdditionalUserInfo } from "firebase/auth"
import { sendWelcomeEmail } from "@/lib/api"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, Check, Loader2 } from "lucide-react"

export default function Register() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-600" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"

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

      // Send welcome email (non-blocking)
      sendWelcomeEmail(form.email, form.name).catch(console.error)


      router.push(redirectUrl)
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

      const details = getAdditionalUserInfo(res)
      if (details?.isNewUser) {
        sendWelcomeEmail(res.user.email || "", res.user.displayName || "User").catch(console.error)
      }

      router.push(redirectUrl)
    } catch {
      setError("Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Register - Join PrismMinds AI Debate Platform</title>
        <meta name="description" content="Create your free PrismMinds account to start engaging in AI-powered debates, explore critical thinking, and participate in structured discussions." />
        <meta name="keywords" content="register PrismMinds, sign up, create account, AI debate platform, free registration" />
        <meta property="og:title" content="Register - Join PrismMinds AI Debate Platform" />
        <meta property="og:description" content="Sign up for free and start your journey in AI-powered debates and critical thinking." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prismminds.vercel.app/register" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Register for PrismMinds" />
        <meta name="twitter:description" content="Join the AI debate platform for free." />
        <link rel="canonical" href="https://prismminds.vercel.app/register" />
      </Head>
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Soft base glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-[#fafafa] to-amber-50/30" />

          {/* Animated gradient orbs - Orange/Amber theme */}
          <motion.div
            animate={{ y: [-60, 60, -60], x: [-40, 40, -40] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-20 w-[420px] h-[420px] bg-gradient-to-br from-orange-300/30 via-amber-300/20 to-orange-200/20 rounded-full blur-3xl"
          />

          <motion.div
            animate={{ y: [40, -80, 40], x: [60, -60, 60] }}
            transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-gradient-to-tl from-amber-300/25 via-orange-200/20 to-amber-200/25 rounded-full blur-3xl"
          />

          {/* Center soft glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-100/20 via-amber-100/15 to-transparent rounded-full blur-3xl opacity-60"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-slate-900/5 border-2 border-slate-100 p-7">
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden bg-transparent">
                <img
                  src="mainlogo.png"  // ← your real logo path
                  alt="PrismMinds Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-4">Join PrismMinds Now</h1>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition text-sm text-slate-900"
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition text-sm text-slate-900"
                />
                <p className="text-[10px] text-slate-500 ml-1 mt-1">Please use a valid email address that you can access.</p>
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  required
                  type={showPass ? "text" : "password"}
                  placeholder="Create password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition text-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-orange-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password checklist */}
              {form.password && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {checks.map((c, i) => (
                    <div key={i} className={`flex items-center gap-1.5 ${c.test ? "text-orange-600" : "text-slate-400"}`}>
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
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <Button
              onClick={googleSignIn}
              disabled={loading}
              className="w-full h-11 bg-white border-2 border-slate-200 hover:border-orange-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 6.75c1.63 0 3.06.56 4.21 1.65l3.15-3.15C16.85 2.23 14.46 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-md text-slate-600 mt-5">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}