"use client"

import { useParams, useRouter } from "next/navigation"
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
 * Enhanced TTS helper with emotion detection and humanized voice characteristics.
 * Detects sentiment/tone in text and adjusts voice parameters accordingly.
 */

type EmotionTone = "angry" | "calm" | "cool" | "excited" | "thoughtful" | "sarcastic" | "neutral"

function detectEmotion(text: string): EmotionTone {
  const lower = text.toLowerCase()

  // Angry indicators
  if (/absolutely|ridiculous|completely wrong|nonsense|absurd|outrageous|unacceptable/i.test(lower)) {
    return "angry"
  }

  // Excited indicators
  if (/incredible|amazing|brilliant|fantastic|wonderful|excellent|wonderful|thrilled/i.test(lower)) {
    return "excited"
  }

  // Cool/confident indicators
  if (/clearly|obviously|undoubtedly|definitely|certainly|without question/i.test(lower)) {
    return "cool"
  }

  // Calm/measured indicators
  if (/perhaps|maybe|consider|however|nonetheless|alternatively|perspective/i.test(lower)) {
    return "thoughtful"
  }

  // Sarcastic indicators
  if (/right|sure|yeah|of course|naturally|supposedly/i.test(lower) && text.includes("?")) {
    return "sarcastic"
  }

  return "neutral"
}

interface VoiceConfig {
  rate: number
  pitch: number
  volume: number
  pauseMultiplier: number
}

function getEmotionVoiceConfig(emotion: EmotionTone): VoiceConfig {
  switch (emotion) {
    case "angry":
      return { rate: 1.3, pitch: 1.4, volume: 1.0, pauseMultiplier: 0.7 }
    case "excited":
      return { rate: 1.25, pitch: 1.35, volume: 1.0, pauseMultiplier: 0.8 }
    case "cool":
      return { rate: 0.95, pitch: 0.95, volume: 1.0, pauseMultiplier: 1.2 }
    case "thoughtful":
      return { rate: 0.9, pitch: 1.0, volume: 0.95, pauseMultiplier: 1.4 }
    case "sarcastic":
      return { rate: 1.05, pitch: 1.15, volume: 1.0, pauseMultiplier: 1.1 }
    default:
      return { rate: 1.0, pitch: 1.0, volume: 1.0, pauseMultiplier: 1.0 }
  }
}

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

    // Detect emotion from text
    const emotion = detectEmotion(text)
    const emotionConfig = getEmotionVoiceConfig(emotion)

    const lower = speaker.toLowerCase()

    // Persona A: Male voice (Pro Advocate) - confident, balanced
    if (lower.includes("pros") || lower.includes("support") || lower.includes("advocate")) {
      const maleVoice = voices.find((v) => /male|daniel|mark|david|google uk english male/i.test(v.name)) ||
        voices.find((v) => v.name.includes("Google")) ||
        voices[0]
      utter.voice = maleVoice
      utter.rate = emotionConfig.rate * 1.1
      utter.pitch = emotionConfig.pitch
    }
    // Persona B: Female voice (Skeptic) - analytical, questioning
    else if (lower.includes("cons") || lower.includes("against") || lower.includes("skeptic") || lower.includes("critic")) {
      const femaleVoice = voices.find((v) => /female|amy|victoria|zira|susan|google uk english female/i.test(v.name)) ||
        voices.find((v) => /english/i.test(v.lang) && v.name.includes("Female")) ||
        voices.find((v) => v.name.includes("Google")) ||
        voices[1] || voices[0]
      utter.voice = femaleVoice
      utter.rate = emotionConfig.rate * 1.0
      utter.pitch = emotionConfig.pitch * 1.15
    }

    // Apply emotion-based volume
    utter.volume = emotionConfig.volume

    // Enhanced pronunciation: add natural pauses for readability
    const enhancedText = text
      .replace(/([.!?])\s+/g, "$1 ... ") // Pause at sentence ends
      .replace(/,\s+/g, ", ") // Natural pause at commas
      .replace(/;\s+/g, "; ") // Emphasis at semicolons
      .replace(/—/g, ", ") // Convert dashes to pauses

    utter.text = enhancedText

    utter.onboundary = (e) => {
      if (e.name === "word" && onProgress) onProgress(e.charIndex)
    }

    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    synth.speak(utter)
  })
}

/* ---------------------------
   DebateVisualizer (Aurora Professional)
   --------------------------- */
function DebateVisualizer({ debate, onPlayingChange }: { debate: Debate; onPlayingChange?: (isPlaying: boolean) => void }) {
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

  // Notify parent when playing state changes
  useEffect(() => {
    onPlayingChange?.(isPlaying && started)
  }, [isPlaying, started, onPlayingChange])

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

  // Detect emotion from current message
  const currentEmotion = currentMsg ? detectEmotion(currentMsg.message) : "neutral"
  const personaAEmotion = personaAIsSpeaking ? currentEmotion : "neutral"
  const personaBEmotion = personaBIsSpeaking ? currentEmotion : "neutral"

  // Map emotions to visual feedback
  const getEmotionStyles = (emotion: EmotionTone, isActive: boolean) => {
    if (!isActive) return { shadow: "shadow-md", glow: "" }

    switch (emotion) {
      case "angry":
        return { shadow: "shadow-lg", glow: "ring-2 ring-red-400" }
      case "excited":
        return { shadow: "shadow-lg", glow: "ring-2 ring-yellow-300" }
      case "cool":
        return { shadow: "shadow-lg", glow: "ring-2 ring-blue-400" }
      case "thoughtful":
        return { shadow: "shadow-md", glow: "ring-1 ring-purple-300" }
      case "sarcastic":
        return { shadow: "shadow-md", glow: "ring-2 ring-orange-400" }
      default:
        return { shadow: "shadow-md", glow: "" }
    }
  }

  const getEmotionLabel = (emotion: EmotionTone) => {
    switch (emotion) {
      case "angry": return "😤 Firm"
      case "excited": return "🤩 Enthusiastic"
      case "cool": return "😎 Confident"
      case "thoughtful": return "🤔 Analytical"
      case "sarcastic": return "😏 Witty"
      default: return "😊 Neutral"
    }
  }

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
          {/* Avatar with emotional feedback */}
          <div className="relative">

            {/* FLOATING SHADOW UNDER AVATAR */}
            <div
              className="
      absolute left-1/2 -translate-x-1/2
      bottom-[-10px]
      w-16 h-4
      rounded-full
    "
              style={{
                background: "radial-gradient(circle, rgba(0,0,0,0.25), transparent 70%)",
                filter: "blur(6px)",
              }}
            />

            {/* MAIN AVATAR */}
            {/* MAIN AVATAR COMPONENT - ADVANCED ORBITAL DESIGN */}
            {/* Added 'perspective' for 3D gyro effects */}
            <div className="relative w-32 h-32 flex items-center justify-center perspective-[1000px] group">

              {/* PULSE WAVE (Radar Ping) - Behind everything */}
              {personaAIsSpeaking && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-sky-400/30 bg-sky-400/10"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-sky-400/20"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
                  />
                </>
              )}

              {/* ORBITAL RING 1 (Flat Outer - Dashed) */}
              <motion.div
                className="absolute inset-[-15px] rounded-full border-2 border-sky-200/30 border-dashed"
                animate={personaAIsSpeaking ? { rotate: 360, scale: 1.05 } : { rotate: 360, scale: 1 }}
                transition={{
                  rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
                }}
              />

              {/* ORBITAL RING 2 (Gyro Tilted) */}
              <motion.div
                className="absolute inset-[-8px] rounded-full border border-indigo-400/40"
                style={{ rotateX: 70 }} // Permanent 3D Tilt
                animate={{ rotateZ: 360 }} // Spin on its axis
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              {/* ORBITAL RING 3 (Opposite Gyro) */}
              <motion.div
                className="absolute inset-[-8px] rounded-full border border-cyan-400/40"
                style={{ rotateY: 70 }} // Permanent 3D Tilt
                animate={{ rotateZ: -360 }} // Spin on its axis
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              {/* ORBITAL RING 4 (Eccentric/Wobbly) */}
              <motion.div
                className="absolute inset-[-2px] rounded-full border-2 border-sky-300/20"
                style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />

              {/* ACTIVE GLOW CORE */}
              {personaAIsSpeaking && (
                <motion.div
                  className="absolute inset-2 rounded-full bg-sky-400/30 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* CORE SPHERE */}
              <motion.div
                className="
                  relative w-24 h-24 rounded-full
                  flex items-center justify-center
                  text-white font-bold text-xl shadow-[0_0_30px_rgba(2,132,199,0.5)]
                  z-20 overflow-hidden
                "
                style={{
                  background: "radial-gradient(circle at 30% 30%, #e0f2fe, #38bdf8, #0369a1)",
                }}
                animate={
                  personaAIsSpeaking
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              >
                {/* Internal "Energy" Texture */}
                <motion.div
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage: "radial-gradient(circle, #fff 2px, transparent 2px)",
                    backgroundSize: "12px 12px"
                  }}
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />

                {/* GLASSY HIGHLIGHT */}
                <div className="absolute top-2 left-3 w-8 h-4 bg-white/60 rounded-full blur-[2px] transform -rotate-12" />

                <span className="relative z-10 drop-shadow-lg text-2xl tracking-widest">
                  {debate.personaA.slice(0, 2).toUpperCase()}
                </span>
              </motion.div>
            </div>
          </div>


          {/* Emotion indicator */}
          {personaAIsSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-full"
            >
              {getEmotionLabel(personaAEmotion)}
            </motion.div>
          )}

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
          {/* Avatar with emotional feedback */}
          <div className="relative">

            {/* FLOATING SHADOW UNDER AVATAR */}
            <div
              className="
      absolute left-1/2 -translate-x-1/2
      bottom-[-10px]
      w-16 h-4
      rounded-full
    "
              style={{
                background: "radial-gradient(circle, rgba(0,0,0,0.25), transparent 70%)",
                filter: "blur(6px)",
              }}
            />

            {/* MAIN AVATAR */}
            {/* MAIN AVATAR COMPONENT - ADVANCED ORBITAL DESIGN */}
            <div className="relative w-32 h-32 flex items-center justify-center perspective-[1000px] group">

              {/* PULSE WAVE (Radar Ping) */}
              {personaBIsSpeaking && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-orange-400/30 bg-orange-400/10"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-orange-400/20"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
                  />
                </>
              )}

              {/* ORBITAL RING 1 (Slow Outer - Dashed) */}
              <motion.div
                className="absolute inset-[-15px] rounded-full border-2 border-orange-200/30 border-dashed"
                animate={personaBIsSpeaking ? { rotate: -360, scale: 1.05 } : { rotate: -360, scale: 1 }}
                transition={{
                  rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
                }}
              />

              {/* ORBITAL RING 2 (Gyro Tilted) */}
              <motion.div
                className="absolute inset-[-8px] rounded-full border border-amber-400/40"
                style={{ rotateX: 70 }}
                animate={{ rotateZ: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              {/* ORBITAL RING 3 (Opposite Gyro) */}
              <motion.div
                className="absolute inset-[-8px] rounded-full border border-red-400/40"
                style={{ rotateY: 70 }}
                animate={{ rotateZ: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              {/* ORBITAL RING 4 (Eccentric) */}
              <motion.div
                className="absolute inset-[-2px] rounded-full border-2 border-orange-300/20"
                style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />

              {/* ACTIVE GLOW CORE */}
              {personaBIsSpeaking && (
                <motion.div
                  className="absolute inset-2 rounded-full bg-orange-400/30 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* CORE SPHERE */}
              <motion.div
                className="
                  relative w-24 h-24 rounded-full
                  flex items-center justify-center
                  text-white font-bold text-xl shadow-[0_0_30px_rgba(249,115,22,0.5)]
                  z-20 overflow-hidden
                "
                style={{
                  background: "radial-gradient(circle at 30% 30%, #ffedd5, #fb923c, #c2410c)",
                }}
                animate={
                  personaBIsSpeaking
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              >
                {/* Internal Energy Texture */}
                <motion.div
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage: "radial-gradient(circle, #fff 2px, transparent 2px)",
                    backgroundSize: "12px 12px"
                  }}
                  animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />

                {/* GLASSY HIGHLIGHT */}
                <div className="absolute top-2 left-3 w-8 h-4 bg-white/60 rounded-full blur-[2px] transform -rotate-12" />

                <span className="relative z-10 drop-shadow-lg text-2xl tracking-widest">
                  {debate.personaB.slice(0, 2).toUpperCase()}
                </span>
              </motion.div>
            </div>
          </div>


          {/* Emotion indicator */}
          {personaBIsSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
            >
              {getEmotionLabel(personaBEmotion)}
            </motion.div>
          )}

          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-4 w-[18rem] sm:w-[20rem] bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
          >
            {thinking && personaAIsSpeaking ? (
              <div className="h-3 rounded-full bg-gradient-to-r from-orange-200 via-red-200 to-orange-200 animate-pulse" />
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
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="
      mt-10 w-full max-w-3xl mx-auto
      bg-white/80 backdrop-blur-lg
      rounded-3xl shadow-xl border border-slate-200
      p-6
    "
        >
          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">
              Full Transcript
            </h3>

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
                className="px-3 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  synthRef.current?.cancel()
                  setShowTranscript(false)
                  setCurrentIndex(0)
                  setStarted(false)
                  setIsPlaying(false)
                }}
                className="px-3 py-2 rounded-lg bg-slate-200/80 hover:bg-slate-300 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timeline container */}
          <div className="relative pl-6 space-y-6 max-h-[52vh] overflow-y-auto">
            {/* Vertical timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-slate-300/50 rounded-full"></div>

            {queue.map((m, i) => {
              const isA = m.speaker === debate.personaA
              const bubbleColor = isA ? "bg-sky-50" : "bg-orange-50"
              const borderColor = isA ? "border-sky-300" : "border-orange-300"
              const textColor = isA ? "text-sky-700" : "text-orange-700"

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="relative"
                >
                  {/* Dot */}
                  <div
                    className={`
                absolute left-[-6px] top-2 w-3 h-3 rounded-full
                border-2 ${borderColor}
                ${isA ? "bg-sky-200" : "bg-orange-200"}
              `}
                  />

                  {/* Bubble */}
                  <div
                    className={`
                rounded-2xl p-4 shadow-sm border ${borderColor}
                ${bubbleColor}
              `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold ${textColor}`}>
                        {m.speaker}
                      </span>
                      <span className="text-xs text-slate-500">
                        {m.phase} • {m.timestamp ?? "-"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {m.message}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Summary */}
          {debate.summary && (
            <div className="mt-8 bg-slate-100 p-5 rounded-2xl shadow-inner">
              <h4 className="text-md font-semibold text-slate-800 mb-2">
                Summary
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {debate.summary}
              </p>
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
  const routeParams = useParams()
  const router = useRouter()
  const [searchId, setSearchId] = useState<string | null>(null)
  const [endingAnimation, setEndingAnimation] = useState(false)


  useEffect(() => {
    // read search param on client only
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search)
      setSearchId(p.get("id"))
    }
  }, [])

  const debateId = searchId || (routeParams?.id as string | undefined)

  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [debateIsPlaying, setDebateIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    if (!debateId) {
      setStatusMessage("No debate ID found.")
      setLoading(false)
      return
    }

    let mounted = true
    async function loadDebate() {
      if (!debateId) return;
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

  if (endingAnimation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xl font-semibold text-slate-700"
        >
          Closing debate…
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-slate-500"
        >
          Redirecting to dashboard
        </motion.p>
      </div>
    )
  }


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading debate...
      </div>
    )

  if (!debate)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full"
        />

        <p className="mt-4 text-slate-600 font-medium animate-pulse tracking-wide">
          Loading debate…
        </p>
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
            running={debateIsPlaying}
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
                onClick={() => {
                  setEndingAnimation(true)
                  setTimeout(() => router.push("/dashboard"), 1600)
                }}
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
              <DebateVisualizer debate={debate} onPlayingChange={setDebateIsPlaying} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
