// "use client"

// import { useParams, useRouter } from "next/navigation"
// import { useEffect, useState, useRef, useCallback } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { X, Download, Mic, MicOff, Loader2, User, Bot, Square, Play, Zap } from "lucide-react"
// import { fetchDebateById, sendHumanMessage, endHumanDebate } from "@/lib/api"
// import { downloadDebateTranscriptPDF } from "@/lib/pdf-generator"
// import { useAuth } from "@/lib/auth-context"

// type DebateMessage = {
//   speaker: string
//   message: string
//   phase?: "opening" | "discussion" | "closing"
//   timestamp?: string
// }

// type Debate = {
//   id: string
//   topic: string
//   personaA: string
//   personaB: string
//   duration?: string
//   transcript?: DebateMessage[]
//   summary?: string
//   createdAt: string
//   debateType?: string
// }

// /* ====================== Speech Recognition ====================== */
// function useSpeechRecognition() {
//   const [isListening, setIsListening] = useState(false)
//   const [transcript, setTranscript] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const recognitionRef = useRef<any>(null)
//   const accumulatedRef = useRef("")

//   useEffect(() => {
//     if (typeof window === "undefined") return
//     const SpeechRecognition =
//       (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

//     if (!SpeechRecognition) {
//       setError("Speech recognition not supported")
//       return
//     }

//     const rec = new SpeechRecognition()
//     rec.continuous = true
//     rec.interimResults = true
//     rec.lang = "en-US"

//     rec.onresult = (e: any) => {
//       let interim = ""
//       let final = ""

//       for (let i = e.resultIndex; i < e.results.length; i++) {
//         const t = e.results[i][0].transcript
//         if (e.results[i].isFinal) final += t + " "
//         else interim += t
//       }

//       if (final) accumulatedRef.current += final
//       setTranscript(accumulatedRef.current + interim)
//     }

//     rec.onerror = (e: any) => {
//       setError(e.error)
//       setIsListening(false)
//     }

//     rec.onend = () => setIsListening(false)

//     recognitionRef.current = rec

//     return () => rec.stop()
//   }, [])

//   const start = () => {
//     accumulatedRef.current = ""
//     setTranscript("")
//     setError(null)
//     setIsListening(true)
//     recognitionRef.current?.start()
//   }
//   const stop = () => recognitionRef.current?.stop()

//   return { isListening, transcript, error, start, stop, reset: () => (accumulatedRef.current = "") }
// }

// /* ====================== TTS – smooth & stable ====================== */
// async function speakTextStream(text: string, onUpdate?: (partial: string) => void) {
//   await new Promise(r => setTimeout(r, 80))

//   return new Promise<void>(resolve => {
//     const synth = window.speechSynthesis
//     if (!synth) {
//       // fallback visual typing
//       const words = text.split(" ")
//       let i = 0
//       const id = setInterval(() => {
//         if (i < words.length) onUpdate?.(words.slice(0, i + 1).join(" "))
//         else { clearInterval(id); resolve() }
//         i++
//       }, 60)
//       return
//     }

//     const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text]
//     let displayed = ""

//     const speakNext = (idx = 0) => {
//       if (idx >= sentences.length) { onUpdate?.(text); resolve(); return }

//       const utter = new SpeechSynthesisUtterance(sentences[idx].trim())
//       utter.rate = 0.95
//       utter.pitch = 1
//       utter.volume = 1

//       const voices = synth.getVoices()
//       utter.voice = voices.find(v => /female|amy|zira|victoria|susan|google/i.test(v.name)) || voices[0]

//       utter.onend = () => {
//         displayed += sentences[idx]
//         onUpdate?.(displayed.trim())
//         speakNext(idx + 1)
//       }
//       utter.onerror = () => resolve()

//       synth.speak(utter)
//     }

//     speakNext()
//   })
// }

// /* ====================== Main Component ====================== */
// export default function DebateArenaPage() {
//   const { id } = useParams()
//   const router = useRouter()
//   const searchId = typeof window !== "undefined" ? new URLSearchParams(location.search).get("id") : null
//   const debateId = (searchId ?? id) as string

//   const [debate, setDebate] = useState<Debate | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [sending, setSending] = useState(false)
//   const [aiThinking, setAiThinking] = useState(false)
//   const [streamingAi, setStreamingAi] = useState(false)
//   const [humanSpeaking, setHumanSpeaking] = useState(false)
//   const [currentHumanText, setCurrentHumanText] = useState("")
//   const [debateStarted, setDebateStarted] = useState(false)
//   const [debateEnded, setDebateEnded] = useState(false)

//   const [liveAiText, setLiveAiText] = useState("")

//   const transcriptRef = useRef<HTMLDivElement>(null)

//   const { isListening, transcript, error, start: startListening, stop: stopListening, reset: resetTranscript } = useSpeechRecognition()

//   /* Load debate */
//   useEffect(() => {
//     if (!debateId) { setLoading(false); return }
//     fetchDebateById(debateId).then(d => {
//       setDebate(d)
//       if (d.transcript?.length) setDebateStarted(true)
//       setLoading(false)
//     }).catch(() => setLoading(false))
//   }, [debateId])

//   /* Sync speech → text */
//   useEffect(() => {
//     if (transcript) {
//       setCurrentHumanText(transcript)
//       setHumanSpeaking(true)
//     }
//   }, [transcript])

//   /* Auto-send when user stops talking */
//   useEffect(() => {
//     if (!isListening && currentHumanText.trim() && humanSpeaking && !sending) {
//       const t = setTimeout(() => handleSend(currentHumanText.trim()), 600)
//       return () => clearTimeout(t)
//     }
//   }, [isListening, currentHumanText, humanSpeaking, sending])

//   const handleSend = async (text?: string) => {
//     if (!debate || debateEnded || sending) return
//     const msg = text ?? currentHumanText.trim()
//     if (!msg) return

//     setSending(true)
//     setAiThinking(true)
//     setHumanSpeaking(false)
//     setCurrentHumanText("")
//     resetTranscript()
//     setLiveAiText("")

//     const humanMsg: DebateMessage = { speaker: "You", message: msg, phase: "discussion", timestamp: new Date().toLocaleTimeString() }
//     setDebate(p => p ? { ...p, transcript: [...(p.transcript || []), humanMsg] } : p)

//     try {
//       const res = await sendHumanMessage(debate.id, msg)
//       setAiThinking(false)
//       setStreamingAi(true)

//       await speakTextStream(res.message, setLiveAiText)

//       const aiMsg: DebateMessage = { speaker: "AI Debater", message: res.message, phase: "discussion", timestamp: new Date().toLocaleTimeString() }
//       setDebate(p => p ? { ...p, transcript: [...(p.transcript || []), aiMsg] } : p)
//     } catch (e) {
//       alert("Failed to send message")
//     } finally {
//       setSending(false)
//       setStreamingAi(false)
//     }
//   }

//   const handleStart = async () => {
//     if (!debate || debateStarted) return
//     const opening = debate.transcript?.find(m => m.speaker === "AI Debater" && m.phase === "opening")
//     if (opening) {
//       setDebateStarted(true)
//       setStreamingAi(true)
//       await speakTextStream(opening.message, setLiveAiText)
//       setStreamingAi(false)
//     } else setDebateStarted(true)
//   }

//   const handleEnd = async () => {
//     if (!confirm("End debate? Transcript will be saved.")) return
//     setDebateEnded(true)
//     stopListening()
//     await endHumanDebate(debate!.id)
//     router.push("/dashboard")
//   }

//   /* Auto-scroll transcript */
//   useEffect(() => {
//     transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" })
//   }, [debate?.transcript])

//   const latestHuman = debate?.transcript?.filter(m => m.speaker === "You").at(-1)
//   const latestAi = debate?.transcript?.filter(m => m.speaker === "AI Debater").at(-1)
//   const openingAi = debate?.transcript?.find(m => m.speaker === "AI Debater" && m.phase === "opening")

//   if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>
//   if (!debate) return <div className="flex h-screen items-center justify-center text-red-600">Debate not found</div>

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
//       {/* Header */}
//       <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               PrismMinds Arena
//             </h1>
//             <p className="text-sm text-slate-600 mt-1">
//               <Zap className="inline w-4 h-4 text-yellow-500" /> {debate.topic}
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <button onClick={() => downloadDebateTranscriptPDF(debate.topic, debate.personaA, debate.personaB, debate.transcript ?? [], debate.createdAt, debate.summary)} className="p-2 rounded-lg hover:bg-slate-100">
//               <Download className="w-5 h-5" />
//             </button>
//             <button onClick={() => router.push("/dashboard")} className="p-2 rounded-lg hover:bg-slate-100">
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
//         {/* Start CTA */}
//         {!debateStarted && openingAi && (
//           <div className="text-center py-20 text-center">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleStart}
//               className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold rounded-xl shadow-lg flex mx-auto items-center gap-3"
//             >
//               <Play className="w-6 h-6" /> Start Debate
//             </motion.button>
//           </div>
//         )}

//         {/* Avatars + Live Bubbles */}
//         <div className="grid md:grid-cols-2 gap-12 mt-12">
//           {/* Human */}
//           <div className="flex flex-col items-center">
//             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg mb-4">
//               <User className="w-10 h-10" />
//             </div>
//             <p className="font-semibold text-lg mb-6">You</p>

//             <div className={`w-full max-w-lg p-5 rounded-2xl bg-white shadow-lg border ${humanSpeaking ? "ring-2 ring-indigo-400" : ""}`}>
//               {humanSpeaking ? currentHumanText || "Listening…" : latestHuman?.message || "Your turn…"}
//             </div>
//           </div>

//           {/* AI */}
//           <div className="flex flex-col items-center">
//             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg mb-4">
//               <Bot className="w-10 h-10" />
//             </div>
//             <p className="font-semibold text-lg mb-6">AI Debater</p>

//             <div className={`w-full max-w-lg p-5 rounded-2xl bg-white shadow-lg border ${streamingAi || aiThinking ? "ring-2 ring-purple-400" : ""}`}>
//               {aiThinking ? "Thinking…" : streamingAi ? liveAiText : latestAi?.message || openingAi?.message || "Ready"}
//             </div>
//           </div>
//         </div>

//         {/* Controls */}
//         {debateStarted && (
//           <div className="flex justify-center gap-6 mt-12">
//             <button
//               onClick={() => isListening ? stopListening() : startListening()}
//               disabled={sending}
//               className={`px-8 py-3 rounded-xl font-medium flex items-center gap-3 ${isListening ? "bg-red-600 text-white" : "bg-indigo-600 text-white"} disabled:opacity-60`}
//             >
//               {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
//               {isListening ? "Stop" : "Speak"}
//             </button>

//             <button onClick={handleEnd} className="px-8 py-3 rounded-xl bg-white border border-slate-300 font-medium flex items-center gap-3">
//               <Square className="w-5 h-5" /> End Debate
//             </button>
//           </div>
//         )}

//         {/* Full Transcript */}
//         {debateStarted && debate.transcript && debate.transcript.length > 0 && (
//           <div className="mt-20">
//             <h2 className="text-xl font-bold text-center mb-4">Transcript</h2>
//             <div ref={transcriptRef} className="max-h-96 overflow-y-auto bg-white/80 backdrop-blur rounded-xl p-6 space-y-4 border">
//               <AnimatePresence>
//                 {debate.transcript.map((m, i) => (
//                   <motion.div
//                     key={i}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className={`flex ${m.speaker === "You" ? "justify-start" : "justify-end"}`}
//                   >
//                     <div className={`max-w-prose p-4 rounded-xl ${m.speaker === "You" ? "bg-indigo-50" : "bg-purple-50"}`}>
//                       <p className="font-medium">{m.speaker}</p>
//                       <p className="mt-1">{m.message}</p>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   )
// }


"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Mic, MicOff, Loader2, User, Bot, Square, Play, Zap } from "lucide-react"
import { fetchDebateById, sendHumanMessage, endHumanDebate } from "@/lib/api"
import { downloadDebateTranscriptPDF } from "@/lib/pdf-generator"
import { useAuth } from "@/lib/auth-context"

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
    duration?: string
    transcript?: DebateMessage[]
    summary?: string
    createdAt: string
    debateType?: string
}

/* ====================== Speech Recognition ====================== */
function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)
    const recognitionRef = useRef<any>(null)
    const accumulatedRef = useRef("")

    useEffect(() => {
        if (typeof window === "undefined") return
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            setError("Speech recognition not supported")
            return
        }

        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = "en-US"

        rec.onresult = (e: any) => {
            let interim = ""
            let final = ""

            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript
                if (e.results[i].isFinal) final += t + " "
                else interim += t
            }

            if (final) accumulatedRef.current += final
            setTranscript(accumulatedRef.current + interim)
        }

        rec.onerror = (e: any) => {
            setError(e.error)
            setIsListening(false)
        }

        rec.onend = () => setIsListening(false)

        recognitionRef.current = rec

        return () => rec.stop()
    }, [])

    const start = () => {
        accumulatedRef.current = ""
        setTranscript("")
        setError(null)
        setIsListening(true)
        recognitionRef.current?.start()
    }
    const stop = () => recognitionRef.current?.stop()

    return { isListening, transcript, error, start, stop, reset: () => (accumulatedRef.current = "") }
}

/* ====================== ENHANCED LIVE TTS – Word-by-Word Sync with Minimal Pauses ====================== */
/* ====================== ULTRA-SMOOTH TTS – DEBATE CHAMPION EDITION ====================== */
async function speakTextStream(
    text: string,
    onChunk: (partial: string) => void,
    fullText: string
) {
    // Small initial delay for realism (feels like thinking → speaking)
    await new Promise(r => setTimeout(r, 100))

    const synth = window.speechSynthesis
    if (!synth) {
        await fallbackTyping(fullText, onChunk)
        return
    }

    // Ensure voices are loaded
    const getVoices = () => new Promise<SpeechSynthesisVoice[]>((resolve) => {
        let voices = synth.getVoices()
        if (voices.length) return resolve(voices)
        synth.addEventListener('voiceschanged', () => resolve(synth.getVoices()), { once: true })
    })

    const voices = await getVoices()
    if (!voices.length) {
        await fallbackTyping(fullText, onChunk)
        return
    }

    // Pick the absolute best natural female voice available
    const preferredVoices = [
        "Microsoft Zira", "Microsoft Aria", "Microsoft Jenny",
        "Samantha", "Karen", "Fiona", "Moira", "Tessa",
        "Google US English", "Google UK English Female",
        "en-US-Neural2-F", "en-US-Neural2-I", "en-US-Wavenet-F"
    ]

    const voice = voices.find(v =>
        preferredVoices.some(name => v.name.includes(name))
        || (v.lang.startsWith("en") && !v.name.toLowerCase().includes("male"))
    ) || voices[0]

    // Break into larger, natural phrases (10–18 words) → eliminates choppy feel
    const words = text.split(/\s+/).filter(Boolean)
    let displayed = ""
    let i = 0

    onChunk("")

    const speakNext = () => {
        if (i >= words.length) {
            onChunk(fullText)
            return
        }

        // Dynamic chunk: 10–18 words (perfect for natural cadence)
        const chunkSize = Math.min(18, Math.floor(Math.random() * 8) + 10)
        const chunkWords = words.slice(i, i + chunkSize)
        const chunk = chunkWords.join(" ")
        i += chunkWords.length

        const utter = new SpeechSynthesisUtterance(chunk)

        utter.voice = voice
        utter.rate = 1.18          // Faster = confident, sharp debater
        utter.pitch = 1.15         // Slight energy boost
        utter.volume = 1.0

        // Remove artificial pauses: no SSML prosody tricks unless needed
        // Let the voice flow naturally

        utter.onboundary = (e) => {
            if (e.name === "word") {
                const spokenSoFar = words.slice(0, i - chunkWords.length +
                    (chunk.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length)
                )
                displayed = spokenSoFar.join(" ")
                onChunk(displayed)
            }
        }

        utter.onend = () => {
            displayed = words.slice(0, i).join(" ")
            onChunk(displayed)
            // Immediate next chunk → no gap!
            requestAnimationFrame(speakNext)
        }

        utter.onerror = () => {
            onChunk(fullText) // fallback
        }

        // CRITICAL: Cancel any pending utterances to prevent queue lag
        synth.cancel()
        synth.speak(utter)
    }

    speakNext()
}

// Super fast fallback (only if TTS completely broken)
async function fallbackTyping(text: string, onChunk: (s: string) => void) {
    const words = text.split(/\s+/).filter(Boolean)
    let displayed = ""
    for (const word of words) {
        displayed += (displayed ? " " : "") + word
        onChunk(displayed)
        await new Promise(r => setTimeout(r, 80)) // Fast typing effect
    }
    onChunk(text)
}

// Fallback
// async function fallbackTyping(text: string, onChunk: (displayedText: string) => void) {
//     const words = text.split(/\s+/).filter(Boolean)
//     let displayed = ""
//     for (const word of words) {
//         displayed += (displayed ? " " : "") + word
//         onChunk(displayed + " ▏")
//         await new Promise(r => setTimeout(r, 150))  // Slower for typing feel
//     }
//     onChunk(text)
// }

/* ====================== Main Component ====================== */
export default function DebateArenaPage() {
    const { id } = useParams()
    const router = useRouter()
    const searchId = typeof window !== "undefined" ? new URLSearchParams(location.search).get("id") : null
    const debateId = (searchId ?? id) as string

    const [debate, setDebate] = useState<Debate | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [aiThinking, setAiThinking] = useState(false)
    const [streamingAi, setStreamingAi] = useState(false)
    const [humanSpeaking, setHumanSpeaking] = useState(false)
    const [currentHumanText, setCurrentHumanText] = useState("")
    const [debateStarted, setDebateStarted] = useState(false)
    const [debateEnded, setDebateEnded] = useState(false)

    const [liveAiText, setLiveAiText] = useState("")

    const transcriptRef = useRef<HTMLDivElement>(null)

    const { isListening, transcript, error, start: startListening, stop: stopListening, reset: resetTranscript } = useSpeechRecognition()

    /* Load debate */
    useEffect(() => {
        if (!debateId) { setLoading(false); return }
        fetchDebateById(debateId).then(d => {
            setDebate(d)
            if (d.transcript?.length) setDebateStarted(true)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [debateId])

    /* Sync speech → text */
    useEffect(() => {
        if (transcript) {
            setCurrentHumanText(transcript)
            setHumanSpeaking(true)
        }
    }, [transcript])

    /* Auto-send when user stops talking */
    useEffect(() => {
        if (!isListening && currentHumanText.trim() && humanSpeaking && !sending) {
            const t = setTimeout(() => handleSend(currentHumanText.trim()), 800)
            return () => clearTimeout(t)
        }
    }, [isListening, currentHumanText, humanSpeaking, sending])

    const updateLastAiMessage = (partial: string) => {
        setDebate(prev => {
            if (!prev || !prev.transcript) return prev
            const transcript = [...prev.transcript]
            const last = transcript[transcript.length - 1]
            if (last && last.speaker === "AI Debater") {
                last.message = partial.replace(" ▏", "")
            }
            return { ...prev, transcript }
        })
    }

    const handleSend = async (text?: string) => {
        if (!debate || debateEnded || sending) return
        const msg = text ?? currentHumanText.trim()
        if (!msg) return

        setSending(true)
        setAiThinking(true)
        setHumanSpeaking(false)
        setCurrentHumanText("")
        resetTranscript()
        setLiveAiText(" ▏")

        const humanMsg: DebateMessage = { speaker: "You", message: msg, phase: "discussion", timestamp: new Date().toLocaleTimeString() }
        setDebate(p => p ? { ...p, transcript: [...(p.transcript || []), humanMsg] } : p)

        try {
            const res = await sendHumanMessage(debate.id, msg)
            setAiThinking(false)
            setStreamingAi(true)

            // Add placeholder AI message
            const placeholderAiMsg: DebateMessage = { speaker: "AI Debater", message: "", phase: "discussion", timestamp: new Date().toLocaleTimeString() }
            setDebate(p => p ? { ...p, transcript: [...(p.transcript || []), placeholderAiMsg] } : p)

            // Stream speak and update both live text and transcript progressively
            await speakTextStream(res.message, (partial) => {
                setLiveAiText(partial)
                updateLastAiMessage(partial)
            }, res.message)

            // Finalize
            setLiveAiText(res.message)
            updateLastAiMessage(res.message)

        } catch (e) {
            console.error("Error sending message:", e)
            alert("Failed to send message")
            setLiveAiText("")
        } finally {
            setSending(false)
            setStreamingAi(false)
        }
    }

    const handleStart = async () => {
        if (!debate || debateStarted) return
        const opening = debate.transcript?.find(m => m.speaker === "AI Debater" && m.phase === "opening")
        if (opening) {
            setDebateStarted(true)
            setStreamingAi(true)
            setLiveAiText(" ▏")

            // For opening, since it's pre-existing, but to stream it
            await speakTextStream(opening.message, setLiveAiText, opening.message)
            setLiveAiText(opening.message)
            setStreamingAi(false)
        } else {
            setDebateStarted(true)
        }
    }

    const handleEnd = async () => {
        if (!confirm("End debate? Transcript will be saved.")) return
        setDebateEnded(true)
        stopListening()
        await endHumanDebate(debate!.id)
        router.push("/dashboard")
    }

    /* Auto-scroll */
    useEffect(() => {
        transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" })
    }, [debate?.transcript, liveAiText])

    const latestHuman = debate?.transcript?.filter(m => m.speaker === "You").at(-1)
    const latestAi = debate?.transcript?.filter(m => m.speaker === "AI Debater").at(-1)
    const openingAi = debate?.transcript?.find(m => m.speaker === "AI Debater" && m.phase === "opening")

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
    if (!debate) return <div className="flex h-screen items-center justify-center text-red-600 text-lg">Debate not found</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            PrismMinds - HuAI
                        </h1>
                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                            {debate.topic}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => downloadDebateTranscriptPDF(debate.topic, debate.personaA, debate.personaB, debate.transcript ?? [], debate.createdAt, debate.summary)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <Download className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-28 px-4 max-w-6xl mx-auto">
                {/* Start CTA */}
                {!debateStarted && openingAi && (
                    <div className="text-center py-20">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStart}
                            className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex mx-auto items-center gap-3 hover:shadow-purple-500/30 transition-shadow"
                        >
                            <Play className="w-5 h-5" fill="white" />
                            Start Live Debate
                        </motion.button>
                    </div>
                )}

                {/* Avatars + Live Bubbles */}
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    {/* Human */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xl mb-4">
                                <User className="w-12 h-12" />
                            </div>
                            {humanSpeaking && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                                    <motion.div
                                        className="w-1 bg-white rounded-full"
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <motion.div
                                        className="w-1 bg-white rounded-full"
                                        animate={{ height: [8, 4, 8] }}
                                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                                    />
                                    <motion.div
                                        className="w-1 bg-white rounded-full"
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="font-semibold text-lg mb-6 text-slate-700">You</p>

                        <div className={`w-full max-w-md p-5 rounded-2xl bg-white shadow-md border transition-all duration-300
              ${humanSpeaking ? "ring-2 ring-indigo-400 shadow-indigo-400/20 scale-102" : "ring-0"}
            `}>
                            <p className="text-base leading-relaxed min-h-[4rem]">
                                {humanSpeaking ? currentHumanText || "Listening..." : latestHuman?.message || "Your turn to speak..."}
                            </p>
                        </div>
                    </motion.div>

                    {/* AI */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl mb-4">
                                <Bot className="w-12 h-12" />
                            </div>
                            {streamingAi && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                                    <motion.div
                                        className="w-1 bg-white rounded-full"
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <motion.div
                                        className="w-1 bg-white rounded-full"
                                        animate={{ height: [8, 4, 8] }}
                                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                                    />
                                    <motion.div
                                        className="w-1 bg-white rounded-full"
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="font-semibold text-lg mb-6 text-slate-700">AI Debater</p>

                        <div className={`w-full max-w-md p-5 rounded-2xl bg-white shadow-md border transition-all duration-300
              ${streamingAi || aiThinking
                                ? "ring-2 ring-purple-500 shadow-purple-500/30 animate-pulse scale-102"
                                : "ring-0"}
            `}>
                            <p className="text-base leading-relaxed min-h-[4rem]">
                                {aiThinking ? (
                                    <span className="text-purple-600">Thinking<span className="animate-pulse">...</span></span>
                                ) : streamingAi ? (
                                    <span className="text-gray-800">{liveAiText || " ▏"}</span>
                                ) : (
                                    latestAi?.message || openingAi?.message || "Ready to debate"
                                )}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Controls */}
                {debateStarted && (
                    <div className="flex justify-center gap-6 mt-12">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => isListening ? stopListening() : startListening()}
                            disabled={sending}
                            className={`px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-3 shadow-md transition-all
                ${isListening
                                    ? "bg-red-600 hover:bg-red-700 shadow-red-400/30"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-purple-400/30"
                                } disabled:opacity-50`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            {isListening ? "Stop Speaking" : "Speak Now"}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEnd}
                            className="px-8 py-3 rounded-xl bg-white border border-slate-300 font-semibold flex items-center gap-3 shadow-md hover:shadow-lg transition"
                        >
                            <Square className="w-5 h-5" />
                            End Debate
                        </motion.button>
                    </div>
                )}

                {/* Transcript */}
                {/* Transcript */}
                {debateStarted && debate.transcript && debate.transcript.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800 tracking-tight">
                            Live Transcript
                        </h2>

                        <div
                            ref={transcriptRef}
                            className="
        max-h-[420px]
        overflow-y-auto
        bg-white/30 
        backdrop-blur-xl
        rounded-2xl
        p-6 
        space-y-6
        border border-white/40 
        shadow-xl 
        shadow-purple-300/10
        relative
      "
                        >
                            <AnimatePresence>
                                {debate.transcript.map((m, i) => {
                                    const isUser = m.speaker === "You"

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 120, delay: i * 0.035 }}
                                            className={`relative flex ${isUser ? "justify-start" : "justify-end"}`}
                                        >
                                            <div
                                                className={`
                  max-w-xl p-4 px-5 rounded-2xl shadow-md
                  transition-all duration-300 hover:scale-[1.015]
                  border backdrop-blur 
                  ${isUser
                                                        ? "bg-indigo-50/70 border-indigo-200/70 shadow-indigo-300/20"
                                                        : "bg-purple-50/70 border-purple-200/70 shadow-purple-300/20"
                                                    }
                `}
                                            >
                                                {/* Accent pill */}
                                                <div
                                                    className={`
                    absolute top-0 h-full w-[4px] rounded-full 
                    ${isUser ? "bg-indigo-400/90" : "bg-purple-500/90"}
                  `}
                                                    style={{ left: isUser ? "-10px" : "auto", right: isUser ? "auto" : "-10px" }}
                                                />

                                                <p className="font-semibold text-sm text-slate-600 mb-1">
                                                    {m.speaker}
                                                </p>

                                                <p
                                                    className="
                    text-[15px] 
                    leading-relaxed 
                    tracking-wide 
                    text-slate-800
                  "
                                                >
                                                    {m.message}
                                                </p>

                                                {/* Floating timestamp */}
                                                {m.timestamp && (
                                                    <p className="text-[11px] text-slate-500 mt-1 opacity-80">
                                                        {m.timestamp}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>

                            {/* Soft bottom fade for scroll area */}
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/70 to-transparent"></div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}