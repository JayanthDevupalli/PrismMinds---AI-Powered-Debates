"use client"

import { useSearchParams, useParams, useRouter } from "next/navigation"
import React, { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { X, Download, Play, Pause, SkipForward, RotateCcw } from "lucide-react"
import { DebateSidebar } from "@/components/debate-sidebar"
import { DebateTimer } from "@/components/debate-timer"
import { fetchDebateById } from "@/lib/api"
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
}

/**
 * Lightweight expressive TTS helper.
 * Uses browser speechSynthesis where available.
 */

async function speakTextSync(
  text: string,
  speaker: string,
  onProgress?: (charIndex: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return resolve()

    const synth = window.speechSynthesis
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)

    const loadVoices = (): SpeechSynthesisVoice[] => synth.getVoices()
    let voices = loadVoices()

    // fallback for Chrome voice delay
    if (!voices.length) {
      synth.onvoiceschanged = () => {
        voices = loadVoices()
      }
    }

    const lower = speaker.toLowerCase()
    if (lower.includes("pros") || lower.includes("support")) {
      utter.voice =
        voices.find((v) => /male|daniel|mark|david/i.test(v.name)) || voices[0]
      utter.rate = 1.15
      utter.pitch = 1.0
    } else if (lower.includes("cons") || lower.includes("against")) {
      utter.voice =
        voices.find((v) => /female|amy|victoria|zira|susan/i.test(v.name)) ||
        voices.find((v) => /english/i.test(v.lang)) ||
        voices[1] ||
        voices[0]
      utter.rate = 1.05
      utter.pitch = 1.25
    }

    if (text.includes("?")) utter.pitch += 0.1
    if (text.includes("!")) utter.rate += 0.1

    utter.text = text.replace(/([.?!])\s/g, "$1 ... ")

    utter.onboundary = (e) => {
      if (e.name === "word" && onProgress) onProgress(e.charIndex)
    }

    utter.onend = resolve
    utter.onerror = resolve
    synth.speak(utter)
  })
}

/* ---------------------------
   DebateVisualizer (Aurora Professional)
   --------------------------- */
function DebateVisualizer({ debate }: { debate: Debate }) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [displayText, setDisplayText] = useState<string>("")
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [started, setStarted] = useState<boolean>(false)
  const [thinking, setThinking] = useState<boolean>(false)
  const [showTranscript, setShowTranscript] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const synthRef = useRef<typeof window.speechSynthesis | null>(typeof window !== "undefined" ? window.speechSynthesis : null)
  const queue = debate.transcript || []

  const phaseColors: Record<string, string> = {
    opening: "from-sky-50 via-sky-100 to-white",
    discussion: "from-indigo-50 via-violet-50 to-white",
    closing: "from-amber-50 via-orange-50 to-white",
  }

  // natural delay + typing & speaking
  const playNext = useCallback(
    async (idxOverride?: number) => {
      if (!started || !queue.length || !isPlaying) return
      const idx = typeof idxOverride === "number" ? idxOverride : currentIndex
      const msg = queue[idx]
      if (!msg) return

      // micro thinking delay
      setThinking(true)
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 600))
      setThinking(false)

      setSpeaking(msg.speaker)
      setDisplayText("")

      await speakTextSync(msg.message, msg.speaker, (charIndex) => {
        // progressively reveal text
        setDisplayText(msg.message.slice(0, Math.max(0, Math.min(msg.message.length, charIndex))))
      })

      setDisplayText(msg.message)
      setSpeaking(null)

      // final message: reveal transcript
      if (idx === queue.length - 1) {
        setIsPlaying(false)
        await new Promise((r) => setTimeout(r, 800))
        setShowTranscript(true)
        return
      }

      // next
      if (isPlaying) setTimeout(() => setCurrentIndex((i) => i + 1), 420)
    },
    [currentIndex, isPlaying, queue, started],
  )

  useEffect(() => {
    if (started && isPlaying && countdown === null) {
      playNext()
    }
  }, [currentIndex, isPlaying, started, countdown, playNext])

  const personaAIsSpeaking = speaking === debate.personaA
  const personaBIsSpeaking = speaking === debate.personaB

  const currentMsg = queue[currentIndex]
  const bgPhase = currentMsg?.phase ? phaseColors[currentMsg.phase] : phaseColors.opening

  // Start button logic with a short 3..2..1 countdown
  const startWithCountdown = () => {
    synthRef.current?.cancel()
    setCountdown(3)
    let c = 3
    const int = setInterval(() => {
      c -= 1
      setCountdown(c > 0 ? c : 0)
      if (c <= 0) {
        clearInterval(int)
        setCountdown(null)
        setStarted(true)
        setIsPlaying(true)
      }
    }, 1000)
  }

  return (
    <motion.div
      layout
      className={`w-full rounded-2xl p-8 shadow-lg bg-gradient-to-br ${bgPhase} transition-all duration-700`}
    >
      {/* Header / Phase badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {currentMsg?.phase && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-sky-600 uppercase tracking-wide px-3 py-1 bg-white/70 rounded-full"
            >
              {currentMsg.phase === "opening"
                ? "Opening"
                : currentMsg.phase === "discussion"
                  ? "Discussion"
                  : "Closing"}
            </motion.div>
          )}
        </div>


        <div className="flex items-center gap-3">
          {!started ? (
            <>
              <button
                onClick={startWithCountdown}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:scale-[1.02] transition-transform"
              >
                Start Debate
              </button>
            </>
          ) : (
            <>
              {isPlaying ? (
                <button
                  onClick={() => {
                    setIsPlaying(false)
                    synthRef.current?.cancel()
                  }}
                  className="p-2 rounded-lg bg-white/60"
                  title="Pause"
                >
                  <Pause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="p-2 rounded-lg bg-white/60"
                  title="Play"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setCurrentIndex((i) => Math.min(i + 1, queue.length - 1))}
                className="p-2 rounded-lg bg-white/60"
                title="Next"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Countdown visual */}
      {countdown !== null && (
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-semibold text-sky-600 bg-white/90 px-6 py-2 rounded-xl shadow-sm"
          >
            {countdown > 0 ? countdown : "Go!"}
          </motion.div>
        </div>
      )}

      {/* Avatars & Speech */}
      <div className="flex items-start justify-center gap-16 md:gap-24">
        {/* Persona A */}
        <div className="flex flex-col items-center max-w-xs">
          <motion.div
            animate={
              personaAIsSpeaking
                ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 28px rgba(59,130,246,0.25)", "0 0 0 rgba(0,0,0,0)"] }
                : { opacity: [0.9, 1, 0.9] }
            }
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-sky-700 font-semibold text-xl shadow-md"
          >
            {debate.personaA.slice(0, 2).toUpperCase()}
          </motion.div>

          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-4 w-[18rem] sm:w-[20rem] bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            {thinking && personaBIsSpeaking ? (
              <div className="h-3 rounded-full bg-gradient-to-r from-sky-200 via-indigo-200 to-sky-200 animate-pulse" />
            ) : (
              <p className="text-sm text-slate-800 leading-relaxed">
                {currentMsg?.speaker === debate.personaA
                  ? displayText
                  : queue
                    .slice(0, currentIndex)
                    .reverse()
                    .find((m) => m.speaker === debate.personaA)?.message || ""}
              </p>
            )}
          </motion.div>
        </div>

        {/* Persona B */}
        <div className="flex flex-col items-center max-w-xs">
          <motion.div
            animate={
              personaBIsSpeaking
                ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 28px rgba(249,115,22,0.2)", "0 0 0 rgba(0,0,0,0)"] }
                : { opacity: [0.9, 1, 0.9] }
            }
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-amber-600 font-semibold text-xl shadow-md"
          >
            {debate.personaB.slice(0, 2).toUpperCase()}
          </motion.div>

          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-4 w-[18rem] sm:w-[20rem] bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            {thinking && personaAIsSpeaking ? (
              <div className="h-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 animate-pulse" />
            ) : (
              <p className="text-sm text-slate-800 leading-relaxed">
                {currentMsg?.speaker === debate.personaB
                  ? displayText
                  : queue
                    .slice(0, currentIndex)
                    .reverse()
                    .find((m) => m.speaker === debate.personaB)?.message || ""}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Transcript / Summary */}
      {showTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Full Transcript</h3>
            <div className="flex gap-2">
              <button
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
                className="px-3 py-2 rounded-md bg-sky-500 text-white"
              >
                <Download className="w-4 h-4 inline-block" />
                <span className="sr-only">Download</span>
              </button>

              <button
                onClick={() => {
                  synthRef.current?.cancel()
                  // replay
                  setShowTranscript(false)
                  setCurrentIndex(0)
                  setStarted(false)
                  setIsPlaying(false)
                }}
                className="px-3 py-2 rounded-md bg-white/60"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="sr-only">Replay</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-2">
            {queue.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-sky-600">{m.speaker}</div>
                  <div className="text-xs text-slate-500">
                    {m.phase} • {m.timestamp ?? "-"}
                  </div>
                </div>
                <div className="text-sm text-slate-700">{m.message}</div>
              </div>
            ))}
          </div>

          {debate.summary && (
            <div className="mt-6 p-4 bg-sky-50 rounded-lg">
              <h4 className="text-sm font-semibold text-sky-700 mb-2">Summary</h4>
              <p className="text-sm text-slate-700">{debate.summary}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ---------------------------
   Main DebateArea page (wraps sidebar + visualizer)
   --------------------------- */
export default function DebateArea() {
  const params = useSearchParams()
  const routeParams = useParams()
  const router = useRouter()
  const debateId = params.get("id") || (routeParams?.id as string | undefined)

  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [statusMessage, setStatusMessage] = useState<string>("")

  useEffect(() => {
    if (!debateId) {
      setStatusMessage("No debate ID found.")
      setLoading(false)
      return
    }

    let mounted = true
    async function loadDebate() {
      if(!debateId) return;
      try {
        const data = await fetchDebateById(debateId)
        if (!mounted) return
        // ensure transcript array exists
        setDebate({
          ...data,
          transcript: data.transcript ?? [],
        })
        setLoading(false)
      } catch (err) {
        console.error(err)
        if (mounted) {
          setStatusMessage("Failed to load debate.")
          setLoading(false)
        }
      }
    }

    loadDebate()
    return () => {
      mounted = false
    }
  }, [debateId])

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading debate...
      </div>
    )

  if (!debate)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Debate not found.
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50">
      <div className="flex w-full">
        {/* Sidebar on desktop */}
        <div className="hidden md:block">
          <DebateSidebar
            topic={debate.topic}
            personaA={debate.personaA}
            personaB={debate.personaB}
            duration={debate.duration}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-80 p-6">
          <div className="fixed top-0 left-0 md:left-80 right-0 z-30 backdrop-blur-sm bg-white/70 border-b border-white/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-sky-600">{debate.personaA}</span>
                <span className="mx-2 text-slate-500">vs</span>
                <span className="font-semibold text-amber-500">{debate.personaB}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
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
                className="p-2 rounded-lg bg-white/80"
                title="Download"
              >
                <Download className="w-4 h-4 text-slate-700" />
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 rounded-lg bg-white/80"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* page content */}
          <div className="pt-20">
            <div className="max-w-5xl mx-auto">
              <DebateVisualizer debate={debate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
