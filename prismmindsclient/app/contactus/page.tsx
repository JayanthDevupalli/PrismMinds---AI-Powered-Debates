"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Mail, User, MessageSquare, Instagram, Twitter, Linkedin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({ name: "", email: "", message: "" })
        setTimeout(() => setSubmitStatus("idle"), 4000)
      } else {
        setSubmitStatus("error")
        setTimeout(() => setSubmitStatus("idle"), 4000)
      }
    } catch (error) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 4000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fcfeff] via-[#eef2ff] to-[#fff6fb] dark:bg-gradient-to-br dark:from-[#071124] dark:via-[#0b1220] dark:to-[#060611] text-slate-900 dark:text-slate-50">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-16%] top-[-16%] w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-[#9f7aea] to-[#fb7185] opacity-70 blur-[28px] transform -rotate-12 mix-blend-screen" />
        <div className="absolute right-[-10%] bottom-[-10%] w-[760px] h-[760px] rounded-full bg-gradient-to-tr from-[#34d399] to-[#60a5fa] opacity-55 blur-[32px] mix-blend-screen" />
      </div>

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 px-6 pt-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Get in <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Have a question or want to collaborate? We'd love to hear from you. Drop us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>
      </section>

      {/* Contact Form Section */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-8 sm:p-10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/30 dark:border-slate-700/40 shadow-lg"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      Email Address
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      Message
                    </div>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    required
                    className="w-full rounded-lg border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                  />
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-green-100/80 dark:bg-green-900/30 border border-green-300/50 dark:border-green-700/50 p-4 text-green-800 dark:text-green-200"
                  >
                    ✓ Message sent successfully! We'll be in touch soon.
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-100/80 dark:bg-red-900/30 border border-red-300/50 dark:border-red-700/50 p-4 text-red-800 dark:text-red-200"
                  >
                    ✗ Something went wrong. Please try again.
                  </motion.div>
                )}

                {/* Send Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Right: Contact Info & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-between"
            >
              {/* Contact Info */}
              <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-900/60 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/30 dark:border-slate-700/40 shadow-lg mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Let's Connect</h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                        <a href="mailto:contact@prismmindai.com" className="text-lg font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition">
                          contact@prismmindai.com
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-900/60 dark:to-slate-900/40 backdrop-blur-xl border border-slate-200/30 dark:border-slate-700/40 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Follow Our Work</h3>

                <div className="grid grid-cols-3 gap-4">
                  {/* Instagram */}
                  <motion.a
                    href="https://instagram.com/prismmindai"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-300/30 dark:border-pink-700/30 hover:border-pink-500/60 transition-all group"
                  >
                    <Instagram className="w-7 h-7 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition mb-2" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Instagram</span>
                  </motion.a>

                  {/* Twitter */}
                  <motion.a
                    href="https://twitter.com/prismmindai"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-300/30 dark:border-blue-700/30 hover:border-blue-500/60 transition-all group"
                  >
                    <Twitter className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition mb-2" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Twitter</span>
                  </motion.a>

                  {/* LinkedIn */}
                  <motion.a
                    href="https://linkedin.com/company/prismmindai"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-blue-700/20 to-blue-600/20 border border-blue-400/30 dark:border-blue-700/30 hover:border-blue-600/60 transition-all group"
                  >
                    <Linkedin className="w-7 h-7 text-blue-700 dark:text-blue-500 group-hover:scale-110 transition mb-2" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">LinkedIn</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border-t border-slate-200/30 dark:border-slate-700/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-slate-700 dark:text-slate-300 gap-3">
          <p>© {new Date().getFullYear()} PrismMinds — Enhancing Human Understanding.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              About
            </Link>
            <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              Privacy
            </Link>
            <Link href="/blogs" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
