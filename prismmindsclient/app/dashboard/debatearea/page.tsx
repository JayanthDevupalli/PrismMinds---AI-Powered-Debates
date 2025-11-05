"use client"

import { useSearchParams, useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { fetchDebateById } from "@/lib/api"
import { downloadDebateTranscriptPDF } from "@/lib/pdf-generator"
import { X, Download } from "lucide-react"
import { DebateSidebar } from "@/components/debate-sidebar"

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
}

export default function DebateArea() {
  const params = useSearchParams()
  const routeParams = useParams()
  const router = useRouter()

  const debateId = params.get("id") || (routeParams?.id as string | undefined)
  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState<{ speaker?: string } | null>(null)
  const [statusMessage, setStatusMessage] = useState("")
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  async function revealTranscript(fullTranscript?: DebateMessage[], summary?: string) {
    if (!fullTranscript?.length) return
    setDebate((prev) => (prev ? { ...prev, transcript: [] } : prev))

    for (let i = 0; i < fullTranscript.length; i++) {
      const msg = fullTranscript[i]
      setTyping({ speaker: msg.speaker })
      setStatusMessage(`${msg.speaker} is typing...`)
      await sleep(300)

      setDebate((prev) => {
        if (!prev) return prev
        const next = [...(prev.transcript || []), { ...msg, message: "" }]
        return { ...prev, transcript: next }
      })

      const chunkSize = Math.ceil(msg.message.length / 20)
      for (let j = 0; j < msg.message.length; j += chunkSize) {
        const partial = msg.message.slice(0, j + chunkSize)
        setDebate((prev) => {
          if (!prev?.transcript) return prev
          const next = [...prev.transcript]
          next[next.length - 1] = { ...msg, message: partial }
          return { ...prev, transcript: next }
        })
        await sleep(155)
      }

      setTyping(null)
      setStatusMessage("")
      await sleep(200)
    }

    if (summary) {
      setStatusMessage("Summarizing debate...")
      await sleep(700)
      setDebate((prev) => ({ ...prev!, summary }))
      setStatusMessage("")
    }
  }

  useEffect(() => {
    if (!debateId) {
      setStatusMessage("No debate ID found.")
      setLoading(false)
      return
    }

    async function loadDebate() {
      if (!debateId) return
      try {
        const data = await fetchDebateById(debateId)
        setDebate({ ...data, transcript: [] })
        setLoading(false)
        await revealTranscript(data.transcript, data.summary)
      } catch (err: any) {
        console.error(err)
        setStatusMessage("Failed to load debate.")
        setLoading(false)
      }
    }

    loadDebate()
  }, [debateId])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [debate?.transcript, typing])

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground text-lg">
        Loading debate...
      </div>
    )

  if (!debate)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        Debate not found.
      </div>
    )

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 min-h-screen w-full">
      <div className="flex w-full">
        {/* ✅ Sidebar visible only on desktop */}
        <div className="hidden md:block">
          <DebateSidebar
            topic={debate.topic}
            personaA={debate.personaA}
            personaB={debate.personaB}
            duration={debate.duration}
          />
        </div>

        {/* ✅ Main Area */}
        <div className="flex-1 md:ml-80 flex flex-col relative">
          {/* ✅ Fixed Header */}
          <div className="fixed top-0 left-0 md:left-80 right-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border-b border-border/40 p-4 sm:p-6 flex justify-between items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{debate.personaA}</span>
                <span className="mx-1 sm:mx-2">vs</span>
                <span className="font-semibold text-accent">{debate.personaB}</span>
              </p>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2"
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

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () =>
                  await downloadDebateTranscriptPDF(
                    debate.topic,
                    debate.personaA,
                    debate.personaB,
                    debate.transcript,
                    debate.createdAt,
                    debate.summary,
                  )
                }
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-foreground/70" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-foreground/70" />
              </motion.button>
            </div>
          </div>

          {/* ✅ Scrollable content */}
          <div className="w-full px-4 sm:px-6 py-6 space-y-5 sm:space-y-6 mt-[90px] md:mt-[100px]">
            {debate.transcript?.map((msg, i, arr) => {
              const showPhase = i === 0 || msg.phase !== arr[i - 1]?.phase
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {showPhase && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 my-6 sm:my-10"
                    >
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                      <span className="text-xs font-bold text-primary/70 uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/20 whitespace-nowrap">
                        {msg.phase === "opening"
                          ? "🎤 Opening"
                          : msg.phase === "discussion"
                          ? "💬 Discussion"
                          : "🎯 Closing"}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    </motion.div>
                  )}

                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.speaker === debate.personaA ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm p-4 rounded-lg sm:rounded-2xl shadow-md ${
                        msg.speaker === debate.personaA
                          ? "bg-white dark:bg-slate-800 text-foreground rounded-tl-none"
                          : "bg-gradient-to-br from-primary to-accent text-white rounded-tr-none"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-current/10">
                        <p className="text-xs font-semibold">{msg.speaker}</p>
                        {msg.timestamp && (
                          <span
                            className={`text-[10px] ${
                              msg.speaker === debate.personaA ? "text-muted-foreground" : "text-white/70"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}

            {typing && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${typing.speaker === debate.personaA ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-sm p-4 rounded-2xl shadow-lg ${
                    typing.speaker === debate.personaA
                      ? "bg-white dark:bg-slate-800 text-foreground"
                      : "bg-gradient-to-br from-primary to-accent text-white"
                  }`}
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

            {debate.summary && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-border/40 shadow"
              >
                <h3 className="text-sm font-bold mb-2">📊 Summary</h3>
                <p className="text-sm leading-relaxed text-foreground/80">{debate.summary}</p>
              </motion.div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
