"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { fetchRecentDebates, createDebate, deleteDebate } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"
import { SparklesIcon, Trash2Icon, X, History, Download } from "lucide-react"
import { downloadDebateTranscriptPDF } from "@/lib/pdf-generator"

type DebateMessage = {
  speaker: string
  message: string
  phase?: "opening" | "discussion" | "closing"
  timestamp?: string
}

type Debate = {
  id: string
  topic: string
  personaA: string
  personaB: string
  duration: string
  transcript?: DebateMessage[]
  summary?: string
  createdAt: string
  debate_metrics?: {
    total_duration: string
    exchanges_per_phase: {
      opening: number
      discussion: number
      closing: number
    }
    key_themes: string[]
  }
}

const ITEMS_PER_PAGE = 12;

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [recentDebates, setRecentDebates] = useState<Debate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
  const [currentView, setCurrentView] = useState<"main" | "transcripts">("main")
  const [searchQuery, setSearchQuery] = useState("")
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [transcriptIndex, setTranscriptIndex] = useState(0)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    topic: "",
    personaA: "",
    personaB: "",
    duration: "5",
  })
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [typing, setTyping] = useState<{ speaker?: string } | null>(null)

  const filteredDebates = recentDebates.filter(
    (debate) =>
      debate.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debate.personaA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debate.personaB.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Pagination support to show more debates when scrolling
  const displayedDebates = filteredDebates.slice(0, displayedCount)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredDebates.length) {
          setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredDebates.length))
        }
      },
      { threshold: 0.1 },
    )

    if (transcriptEndRef.current) {
      observer.observe(transcriptEndRef.current)
    }

    return () => observer.disconnect()
  }, [displayedCount, filteredDebates.length])

  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
    // reset index when search changes so pager stays within bounds
    setTranscriptIndex(0)
  }, [searchQuery])

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

  async function revealTranscript(fullTranscript: DebateMessage[] | undefined, durationMin: number | string) {
    if (!fullTranscript || fullTranscript.length === 0) return
    const duration = typeof durationMin === "string" ? Number.parseInt(durationMin || "5") : durationMin || 5

    // Calculate timings for a natural feel
    const perMinuteMs = 10000
    const capMs = 30000
    const revealDurationMs = Math.min(duration * perMinuteMs, capMs)
    const basePerMsgDelay = Math.max(200, Math.round(revealDurationMs / fullTranscript.length))
    const avgCharactersPerMsg = fullTranscript.reduce((sum, msg) => sum + msg.message.length, 0) / fullTranscript.length
    const msPerCharacter = Math.min(50, basePerMsgDelay / avgCharactersPerMsg) // Adjust typing speed

    // Reset transcript
    setSelectedDebate((prev) => (prev ? { ...prev, transcript: [] } : prev))

    for (let i = 0; i < fullTranscript.length; i++) {
      const msg = fullTranscript[i]

      // Show typing indicator
      setTyping({ speaker: msg.speaker })
      setStatusMessage(`${msg.speaker} is composing...`)

      // Small delay before typing starts
      await sleep(300)

      // Initialize message with empty content
      setSelectedDebate((prev) => {
        if (!prev) return prev
        const nextTranscript = [
          ...(prev.transcript || []),
          { ...msg, message: '' } // Start with empty message
        ]
        return { ...prev, transcript: nextTranscript }
      })

      // Type out the message character by character
      let currentText = ''
      for (let charIndex = 0; charIndex < msg.message.length; charIndex++) {
        currentText += msg.message[charIndex]

        setSelectedDebate((prev) => {
          if (!prev?.transcript) return prev
          const nextTranscript = [...prev.transcript]
          nextTranscript[nextTranscript.length - 1] = {
            ...msg,
            message: currentText
          }
          // Importantly, don't include summary yet
          return { ...prev, transcript: nextTranscript, summary: undefined }
        })

        // Scroll to bottom smoothly
        const modalContent = document.querySelector('.modal-content')
        if (modalContent) {
          modalContent.scrollTo({
            top: modalContent.scrollHeight,
            behavior: 'smooth'
          })
        }

        // Vary typing speed slightly for natural feel
        const variance = Math.random() * 30 - 15 // ±15ms
        await sleep(msPerCharacter + variance)
      }

      // Small pause between messages
      setTyping(null)
      setStatusMessage("")
      await sleep(Math.max(300, msg.message.length * 0.05)) // Longer pause for longer messages
    }

    // After all messages are done, show "Generating summary..." and reveal summary
    const debateSummary = selectedDebate?.summary
    if (debateSummary) {
      setTyping(null)
      setStatusMessage("Generating summary...")
      await sleep(1000) // Pause for anticipation

      setSelectedDebate((prev) => {
        if (!prev) return prev
        // Now reveal the summary that was previously hidden
        return { ...prev, summary: debateSummary }
      })

      // Scroll to show summary
      const modalContent = document.querySelector('.modal-content')
      if (modalContent) {
        modalContent.scrollTo({
          top: modalContent.scrollHeight,
          behavior: 'smooth'
        })
      }

      await sleep(500) // Short pause after summary appears
    }

    setGenerating(false)
    setTyping(null)
    setStatusMessage("")
  }

  useEffect(() => {
    if (user) {
      // By default load only 2 items for the "Recent Debates" dashboard grid
      fetchRecentDebates(2)
        .then(setRecentDebates)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setGenerating(true)
    setStatusMessage("Preparing debate...")
    // const [mm, ss] = form.duration.split(":").map(Number)
    // const totalMinutes = mm + ss / 60

    try {
      const debateData = {
        topic: form.topic,
        personaA: form.personaA,
        personaB: form.personaB,
        // duration: totalMinutes,
        duration: form.duration,
      }

      setStatusMessage("Generating debate with the AI — this may take a few seconds...")
      const result = await createDebate(debateData)

      const updated = await fetchRecentDebates()
      setRecentDebates(updated)

      const createdDebate = updated.find((d: Debate) => d.id === result.id) || updated[0]
      if (!createdDebate) {
        throw new Error("Couldn't retrieve the created debate from server")
      }

      // setSelectedDebate({ ...createdDebate, transcript: [] })
      // setStatusMessage("Debate ready — starting live playback...")

      // await revealTranscript(createdDebate.transcript, debateData.duration)
      router.push(`dashboard/debatearea?id=${createdDebate.id}`)
      setForm({ topic: "", personaA: "", personaB: "", duration: "5" })
    } catch (err: any) {
      console.error("Debate creation error:", err)
      const errorMsg = err?.message || "Error creating debate"
      alert(errorMsg)
    } finally {
      setCreating(false)
      setGenerating(false)
      setStatusMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50 dark:from-background dark:via-background dark:to-slate-900/50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-2xl border-b border-border/40 bg-white/40 dark:bg-slate-900/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full sm:w-auto">
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest flex items-center gap-2 mb-1">
              <SparklesIcon className="w-3.5 h-3.5" />
              AI Debate Platform
            </p>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              Welcome, {user?.displayName}
            </h1>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                // When opening the full transcripts view, fetch more debates
                try {
                  setLoading(true)
                  const all = await fetchRecentDebates(100)
                  setRecentDebates(all)
                } catch (err) {
                  console.error('Failed to load transcripts:', err)
                } finally {
                        setLoading(false)
                        setCurrentView("transcripts")
                        setDisplayedCount(ITEMS_PER_PAGE)
                        setSearchQuery("")
                        setTranscriptIndex(0)
                }
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-border/50 transition-all text-xs sm:text-sm font-medium text-foreground"
              title="View all transcripts"
            >
              <History className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Transcripts</span>
            </motion.button>
            {currentView === "transcripts" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  // Return to the main dashboard and load only the 2 most recent debates
                  try {
                    setLoading(true)
                    const recent = await fetchRecentDebates(2)
                    setRecentDebates(recent)
                  } catch (err) {
                    console.error('Failed to load recent debates:', err)
                  } finally {
                    setLoading(false)
                    setCurrentView("main")
                  }
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 border border-blue-200/50 dark:border-blue-800/50 transition-all text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                ← Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await logout()
                router.push("/")
              }}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-slate-400 hover:text-red-600"
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === "transcripts" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start gap-2 sm:gap-3 mb-2">
                <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                  📜
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                  All Transcripts
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground px-12 sm:px-0">
                Showing <span className="font-bold text-foreground">{filteredDebates.length}</span> total debates
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.input
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              placeholder="Search debates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground font-medium"
            />

            {/* Transcripts Pagination */}
            {filteredDebates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-border/30"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <History className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {searchQuery ? "No debates match your search" : "No debates yet"}
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page <span className="mx-2 font-semibold text-foreground">{Math.floor(transcriptIndex / 5) + 1}</span> of <span className="mx-2 font-semibold text-foreground">{Math.ceil(filteredDebates.length / 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTranscriptIndex((i) => Math.max(0, i - 5))}
                      disabled={transcriptIndex === 0}
                      className="px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-border/50 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setTranscriptIndex((i) => Math.min(filteredDebates.length - 1, i + 5))}
                      disabled={transcriptIndex + 5 >= filteredDebates.length}
                      className="px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-border/50 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Transcript cards grid (up to 5 per page) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <AnimatePresence>
                    {filteredDebates.slice(transcriptIndex, transcriptIndex + 5).map((debate, idx) => (
                      <motion.div
                        key={debate.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/60 dark:to-slate-900/60 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => setSelectedDebate(debate)}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-foreground transition-colors mb-1 line-clamp-2 group-hover:text-primary">
                              {debate.topic}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2 break-words">
                              <span className="font-semibold text-primary">{debate.personaA}</span>
                              <span className="mx-1">vs</span>
                              <span className="font-semibold text-accent">{debate.personaB}</span>
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                📅 {new Date(debate.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                ⏱️ {debate.duration}min
                              </span>
                            </div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.2, x: 5 }}
                            className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <ArrowLeftOnRectangleIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 rotate-180" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentView !== "transcripts" && (
          <>
            {/* Create Debate Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 sm:mb-12"
            >
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/30 rounded-2xl sm:rounded-3xl border border-border/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-primary/5">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                    ✨
                  </span>
                  Start a New Debate
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <motion.input
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    type="text"
                    placeholder="What would you like to debate about?"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground font-medium"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <motion.input
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      type="text"
                      placeholder="First Persona"
                      value={form.personaA}
                      onChange={(e) => setForm({ ...form, personaA: e.target.value })}
                      className="px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
                      required
                    />
                    <motion.input
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      type="text"
                      placeholder="Second Persona"
                      value={form.personaB}
                      onChange={(e) => setForm({ ...form, personaB: e.target.value })}
                      className="px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <motion.input
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    type="text"
                    placeholder="Duration (MM:SS)"
                    pattern="^([0-5]?[0-9]):([0-5][0-9])$"
                    value={form.duration}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow typing partial valid patterns like "0" or "01:"
                      if (/^(\d{0,2}:?\d{0,2})$/.test(value)) {
                        setForm({ ...form, duration: value })
                      }
                    }}
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: <span className="font-semibold">01:00</span> = 1 minute, <span className="font-semibold">02:30</span> = 2.5 minutes
                  </p>


                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={creating}
                    className="w-full py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 via-sky-500 to-primary bg-size-200 hover:bg-pos-right text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 text-sm sm:text-base"
                  >
                    {creating ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating...
                      </span>
                    ) : (
                      "🚀 Start Debate"
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Debates Grid */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                  📚
                </span>
                Recent Debates
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-48 sm:h-64 rounded-lg sm:rounded-2xl bg-gradient-to-br from-muted to-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : recentDebates.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-lg sm:rounded-2xl border-2 border-dashed border-border/30"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No debates created yet. Start one to begin!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  <AnimatePresence>
                    {recentDebates.map((debate, index) => (
                      <motion.div
                        key={debate.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <motion.div
                          onClick={() => setSelectedDebate(debate)}
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="h-48 sm:h-64 rounded-lg sm:rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-border/50 backdrop-blur-xl p-4 sm:p-6 cursor-pointer transition-all shadow-lg hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between overflow-hidden relative"
                        >
                          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                              <span className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary/20 to-accent/20 text-primary whitespace-nowrap">
                                {debate.duration}min
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    if (window.confirm("Delete this debate?")) {
                                      try {
                                        await deleteDebate(debate.id)
                                        const updated = await fetchRecentDebates()
                                        setRecentDebates(updated)
                                        if (selectedDebate?.id === debate.id) {
                                          setSelectedDebate(null)
                                        }
                                      } catch (err) {
                                        console.error("Failed to delete debate:", err)
                                        alert("Failed to delete debate.")
                                      }
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-red-100/80 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-all"
                                  title="Delete"
                                >
                                  <Trash2Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                </motion.button>
                              </div>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                              {debate.topic}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                              <span className="font-semibold text-primary">{debate.personaA}</span>
                              <span className="mx-1">vs</span>
                              <span className="font-semibold text-accent">{debate.personaB}</span>
                            </p>
                          </div>

                          <div className="relative z-10 pt-3 sm:pt-4 border-t border-border/30">
                            <p className="text-xs text-muted-foreground">
                              {new Date(debate.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </main>

      {/* Fullscreen Debate Modal */}
      <AnimatePresence>
        {selectedDebate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDebate(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/95 dark:to-slate-900/90 border border-border/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-xl border-b border-border/30 p-4 sm:p-6 flex justify-between items-start">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 break-words">
                    {selectedDebate.topic}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{selectedDebate.personaA}</span>
                    <span className="mx-1 sm:mx-2">vs</span>
                    <span className="font-semibold text-accent">{selectedDebate.personaB}</span>
                  </p>

                  {generating && statusMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full"
                      />
                      {statusMessage}
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (!selectedDebate) return
                      try {
                        // Basic UX: show a small generating state
                        setStatusMessage("Preparing PDF...")
                        await downloadDebateTranscriptPDF(
                          selectedDebate.topic,
                          selectedDebate.personaA,
                          selectedDebate.personaB,
                          selectedDebate.transcript,
                          selectedDebate.createdAt,
                          selectedDebate.summary,
                        )
                      } catch (err) {
                        console.error('Failed to download PDF', err)
                        alert('Failed to generate PDF. Please try again.')
                      } finally {
                        setStatusMessage("")
                      }
                    }}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                    title="Download transcript as PDF"
                  >
                    <Download className="w-4 sm:w-5 h-4 sm:h-5 text-foreground/70" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDebate(null)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 sm:w-5 h-4 sm:h-5 text-foreground/60" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="modal-content flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence>
                    {selectedDebate.transcript?.map((message, i, arr) => {
                      const showPhaseHeader = i === 0 || message.phase !== arr[i - 1]?.phase

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {showPhaseHeader && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-3 sm:gap-4 my-4 sm:my-8"
                            >
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                              <span className="text-xs font-bold text-primary/70 uppercase tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 bg-primary/5 rounded-full border border-primary/20 whitespace-nowrap">
                                {message.phase === "opening"
                                  ? "🎤 Opening"
                                  : message.phase === "discussion"
                                    ? "💬 Discussion"
                                    : "🎯 Closing"}
                              </span>
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                            </motion.div>
                          )}

                          {/* Typing Indicator */}
                          {typing && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${typing.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-sm p-4 rounded-2xl ${typing.speaker === selectedDebate.personaA
                                    ? "bg-white dark:bg-slate-800 text-foreground"
                                    : "bg-gradient-to-br from-primary to-accent text-white"
                                  } shadow-lg`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">{typing.speaker}</span>
                                  <div className="flex gap-1">
                                    {[0, 1, 2].map((j) => (
                                      <motion.div
                                        key={j}
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{
                                          delay: j * 0.15,
                                          duration: 0.6,
                                          repeat: Number.POSITIVE_INFINITY,
                                        }}
                                        className="w-2 h-2 bg-current rounded-full"
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-xs sm:max-w-sm p-3 sm:p-4 rounded-lg sm:rounded-2xl ${message.speaker === selectedDebate.personaA
                                  ? "bg-white dark:bg-slate-800 text-foreground rounded-tl-none"
                                  : "bg-gradient-to-br from-primary to-accent text-white rounded-tr-none"
                                } shadow-lg`}
                            >
                              <div className="flex items-center justify-between mb-1 sm:mb-2 pb-1 sm:pb-2 border-b border-current/10">
                                <p className="text-xs font-bold">{message.speaker}</p>
                                {message.timestamp && (
                                  <span
                                    className={`text-xs ml-2 ${message.speaker === selectedDebate.personaA
                                        ? "text-muted-foreground"
                                        : "text-white/60"
                                      }`}
                                  >
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm leading-relaxed">{message.message}</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {/* Summary */}
                  {selectedDebate.summary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-lg sm:rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/30 dark:border-accent/30"
                    >
                      <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-foreground">📊 Summary</h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-foreground/75">{selectedDebate.summary}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

