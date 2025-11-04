"use client"

import {useEffect ,  useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, googleProvider, db } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline"

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // prevents hydration mismatch
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === "password") evaluatePasswordStrength(value)
  }

  const evaluatePasswordStrength = (password: string) => {
    if (!password) return setStrength("")
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/
    const moderateRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?#&]{6,}$/

    if (strongRegex.test(password)) setStrength("strong")
    else if (moderateRegex.test(password)) setStrength("moderate")
    else setStrength("weak")
  }

  const getStrengthColor = () => {
    switch (strength) {
      case "weak": return "text-red-500"
      case "moderate": return "text-yellow-500"
      case "strong": return "text-green-600"
      default: return "text-gray-400"
    }
  }

  const getStrengthBarColor = () => {
    switch (strength) {
      case "weak": return "bg-red-500"
      case "moderate": return "bg-yellow-400"
      case "strong": return "bg-green-500"
      default: return "bg-gray-200"
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(userCred.user, { displayName: form.name })
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
      })
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
      const res = await signInWithPopup(auth, googleProvider)
      const user = res.user
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
        },
        { merge: true }
      )
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      {/* subtle animated background curve */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <svg viewBox="0 0 800 400" className="w-full h-full text-gray-100">
          <path
            d="M0 200 Q400 100 800 200 Q400 300 0 200 Z"
            fill="currentColor"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
              M0 200 Q400 100 800 200 Q400 300 0 200 Z;
              M0 200 Q400 150 800 200 Q400 250 0 200 Z;
              M0 200 Q400 100 800 200 Q400 300 0 200 Z;"
            />
          </path>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 p-8 rounded-2xl bg-white shadow-lg border border-gray-200"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto bg-gray-800 text-white flex items-center justify-center rounded-xl text-2xl font-bold">
            🧠
          </div>
          <h2 className="text-2xl font-semibold mt-4">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">
            Join <span className="font-medium text-gray-700">PrismMinds</span> and explore multi-perspective AI debates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              required
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              required
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength */}
          {strength && (
            <div className="mt-1">
              <div className={`h-1 rounded-full transition-all ${getStrengthBarColor()}`}></div>
              <p className={`text-xs mt-1 ${getStrengthColor()}`}>
                {strength === "weak"
                  ? "Weak password — try adding symbols or capitals"
                  : strength === "moderate"
                  ? "Moderate password"
                  : "Strong password ✅"}
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

          <Button
            type="submit"
            className="w-full py-2 mt-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
          <div className="h-px w-16 bg-gray-200" />
          <span className="mx-3">or</span>
          <div className="h-px w-16 bg-gray-200" />
        </div>

        {/* Google Button */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-700 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
