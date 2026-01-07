"use client"

import Head from 'next/head';
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

// Helper function to convert Firebase errors to user-friendly messages
const getAuthErrorMessage = (error: any): string => {
  const errorCode = error?.code || ""

  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Invalid email or password. Please try again."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support."
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection."
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled."
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups for this site."
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in method."
    default:
      return "An error occurred during sign-in. Please try again."
  }
}

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"

  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      router.push(redirectUrl)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push(redirectUrl)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - Access Your PrismMinds Account</title>
        <meta name="description" content="Sign in to your PrismMinds account to access AI-powered debates, manage your discussions, and explore intellectual discourse." />
        <meta name="keywords" content="login PrismMinds, sign in, AI debate account, user authentication" />
        <meta property="og:title" content="Login - PrismMinds AI Debate Platform" />
        <meta property="og:description" content="Access your PrismMinds account to engage in AI debates and explore critical thinking." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prismminds.vercel.app/login" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Login to PrismMinds" />
        <meta name="twitter:description" content="Sign in to access AI debate features." />
        <link rel="canonical" href="https://prismminds.vercel.app/login" />
      </Head>
      <main className="relative w-full min-h-screen overflow-hidden bg-[#fafafa] flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-20 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-[#fafafa] to-amber-50/30" />

          {/* Animated gradient orbs - Orange/Amber theme */}
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-r from-orange-400/20 to-amber-400/20 blur-3xl"
            animate={{
              x: [0, 80, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-amber-300/15 to-orange-300/15 blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, delay: 2, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-orange-200/20 to-amber-200/20 blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255, 0, 0, .05) 25%, rgba(255, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, .05) 75%, rgba(255, 0, 0, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 0, 0, .05) 25%, rgba(255, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, .05) 75%, rgba(255, 0, 0, .05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-xl bg-white/90 rounded-[2rem] border-2 border-slate-100 shadow-2xl shadow-slate-900/5 p-8 space-y-6"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <motion.div
                className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-transparent"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/mainlogo.png"  // ← replace with your actual logo file path
                  alt="PrismMinds Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  PrismMinds
                </h1>
                <p className="text-sm text-slate-600">Sign in to your account</p>
              </div>
            </motion.div>


            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* Email Input */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/30 to-amber-400/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    className="relative w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-300"
                  />
                </div>
              </motion.div>

              {/* Password Input with Show/Hide Toggle */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/30 to-amber-400/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="relative w-full pl-12 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-orange-600 transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Login Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  {loading ? (
                    <motion.span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Signing in...
                    </motion.span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-xs text-slate-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </motion.div>

            {/* Google Sign-In */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md hover:border-orange-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-2"
            >
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-orange-600 hover:text-orange-700 font-bold transition-colors duration-300"
                >
                  Register
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-1 mt-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full"
          />
        </div >
      </main >
    </>
  )
}
