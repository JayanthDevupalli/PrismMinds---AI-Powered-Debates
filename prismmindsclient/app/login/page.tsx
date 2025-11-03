// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { auth, googleProvider } from "@/lib/firebase"
// import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
// import { Button } from "@/components/ui/button"
// import { motion } from "framer-motion"
// import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

// export default function Login() {
//   const router = useRouter()
//   const [form, setForm] = useState({ email: "", password: "" })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     setLoading(true)
//     try {
//       await signInWithEmailAndPassword(auth, form.email, form.password)
//       router.push("/dashboard")
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGoogleSignIn = async () => {
//     setError("")
//     setLoading(true)
//     try {
//       await signInWithPopup(auth, googleProvider)
//       router.push("/dashboard")
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <main className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-background text-foreground">
//       {/* Animated Prism SVG background */}
//       <div className="absolute inset-0 -z-10 opacity-40">
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full h-full">
//           <defs>
//             <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
//               <stop offset="0%" stopColor="#7dd3fc" />
//               <stop offset="100%" stopColor="#c084fc" />
//             </linearGradient>
//           </defs>
//           <path
//             fill="url(#grad)"
//             d="M0 300 Q400 150 800 300 Q400 450 0 300 Z"
//             opacity="0.5"
//           >
//             <animate
//               attributeName="d"
//               dur="10s"
//               repeatCount="indefinite"
//               values="
//               M0 300 Q400 150 800 300 Q400 450 0 300 Z;
//               M0 300 Q400 250 800 300 Q400 350 0 300 Z;
//               M0 300 Q400 150 800 300 Q400 450 0 300 Z;"
//             />
//           </path>
//         </svg>
//       </div>

//       {/* Login Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="glass max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl border border-border/50 backdrop-blur-md bg-card/40"
//       >
//         <div className="text-center mb-8">
//           <div className="w-12 h-12 mx-auto bg-primary text-white flex items-center justify-center rounded-xl text-2xl font-bold shadow-sm">
//             🧠
//           </div>
//           <h2 className="text-3xl font-semibold mt-4">Welcome back</h2>
//           <p className="text-muted-foreground text-sm mt-2">
//             Sign in to continue exploring AI debates
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="relative">
//             <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
//             <input
//               required
//               type="email"
//               name="email"
//               placeholder="Email Address"
//               value={form.email}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-2 rounded-lg bg-background/40 border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all outline-none"
//             />
//           </div>

//           <div className="relative">
//             <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
//             <input
//               required
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={form.password}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-2 rounded-lg bg-background/40 border border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all outline-none"
//             />
//           </div>

//           {error && (
//             <p className="text-red-500 text-sm text-center mt-2">{error}</p>
//           )}

//           <Button
//             type="submit"
//             className="w-full py-2 mt-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition"
//             disabled={loading}
//           >
//             {loading ? "Signing in..." : "Login"}
//           </Button>
//         </form>

//         <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
//           <div className="h-px w-16 bg-border/50" />
//           <span className="mx-3">or</span>
//           <div className="h-px w-16 bg-border/50" />
//         </div>

//         <Button
//           onClick={handleGoogleSignIn}
//           variant="outline"
//           className="w-full mt-4 flex items-center justify-center gap-2 border border-border/40 hover:bg-primary/10 transition"
//         >
//           <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
//           Continue with Google
//         </Button>

//         <p className="text-center text-sm text-muted-foreground mt-6">
//           Don’t have an account?{" "}
//           <Link href="/register" className="text-primary hover:underline">
//             Register
//           </Link>
//         </p>
//       </motion.div>
//     </main>
//   )
// }
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="relative w-full min-h-screen overflow-hidden bg-background flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-20 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-background to-cyan-900/15" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, delay: 2, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-3xl"
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
          className="backdrop-blur-xl bg-gradient-to-br from-card/80 to-card/40 rounded-2xl border border-primary/20 shadow-2xl p-8 space-y-6"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-3"
          >
            <motion.div
              className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-2xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              🧠
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                PrismMinds
              </h1>
              <p className="text-sm text-foreground/70">Sign in to your account</p>
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
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-4 top-3.5 text-foreground/40" />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="relative w-full pl-12 pr-4 py-3 bg-card/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-card/70 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Password Input with Show/Hide Toggle */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-4 top-3.5 text-foreground/40" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="relative w-full pl-12 pr-12 py-3 bg-card/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-card/70 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-foreground/40 hover:text-foreground/70 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

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
                className="w-full py-3 mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
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
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <span className="text-xs text-foreground/50 font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </motion.div>

          {/* Google Sign-In */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-card/50 hover:bg-card/70 border border-primary/20 text-foreground rounded-lg font-medium flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
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
            <p className="text-sm text-foreground/60">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-accent font-semibold transition-colors duration-300"
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
          className="h-1 mt-8 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
        />
      </div>
    </main>
  )
}
