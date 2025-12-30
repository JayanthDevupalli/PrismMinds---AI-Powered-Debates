"use client"

import Head from 'next/head';
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Check, ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react"
import { sendForgotPasswordEmail, verifyOTP, resetPasswordWithOtp } from "@/lib/api"

export default function ForgotPassword() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPass, setShowPass] = useState(false)

    // Step 1: Send OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            await sendForgotPasswordEmail(email)
            setStep(2)
            setSuccess("OTP sent to your email")
        } catch (err: any) {
            setError(err.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")
        try {
            await verifyOTP(email, otp)
            setStep(3)
        } catch (err: any) {
            setError(err.message || "Invalid OTP")
        } finally {
            setLoading(false)
        }
    }

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        setError("")
        try {
            await resetPasswordWithOtp(email, otp, newPassword)
            setSuccess("Password reset successfully! Redirecting...")
            setTimeout(() => router.push("/login"), 2000)
        } catch (err: any) {
            setError(err.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.form
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleRequestOtp}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Forgot Password?</h2>
                            <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset code.</p>
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                required
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </Button>
                    </motion.form>
                )
            case 2:
                return (
                    <motion.form
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
                            <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to {email}</p>
                        </div>

                        <div className="relative">
                            <input
                                required
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full text-center tracking-[1em] text-lg font-bold py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
                        >
                            Change Email
                        </button>
                    </motion.form>
                )
            case 3:
                return (
                    <motion.form
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleResetPassword}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-sm text-gray-500 mt-1">Create a new secure password.</p>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                required
                                type={showPass ? "text" : "password"}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
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

                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                required
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </motion.form>
                )
        }
    }

    return (
        <>
            <Head>
                <title>Forgot Password - PrismMinds</title>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 overflow-hidden relative">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    {/* Soft base glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-purple-50" />

                    {/* Aurora-style flowing light waves */}
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
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-7">

                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl text-center mt-4"
                            >
                                {error}
                            </motion.p>
                        )}

                        {success && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-green-600 text-sm bg-green-50 px-4 py-2.5 rounded-xl text-center mt-4"
                            >
                                {success}
                            </motion.p>
                        )}

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    )
}
