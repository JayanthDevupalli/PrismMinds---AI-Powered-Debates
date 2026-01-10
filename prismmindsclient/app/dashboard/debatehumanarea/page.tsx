"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, Loader2, User, Bot, Square, Play, Sparkles, Zap } from "lucide-react"
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

/* ====================== LOGIC ====================== */

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

async function speakTextStream(
    text: string,
    onChunk: (partial: string) => void,
    fullText: string
) {
    await new Promise(r => setTimeout(r, 100))
    const synth = window.speechSynthesis
    if (!synth) {
        await fallbackTyping(fullText, onChunk)
        return
    }

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

    const words = text.split(/\s+/).filter(Boolean)
    let displayed = ""
    let i = 0
    onChunk("")

    const speakNext = () => {
        if (i >= words.length) {
            onChunk(fullText)
            return
        }

        // Try to chunk by sentences or reasonable length for better flow (consistent voice)
        let chunkWords = []
        let currentChunkLength = 0
        const MIN_CHUNK = 12
        const MAX_CHUNK = 30

        while (i < words.length) {
            const word = words[i]
            chunkWords.push(word)
            currentChunkLength++
            i++

            // Break if we hit punctuation and have enough words, or if we hit max size
            if ((/[.!?]/.test(word) && currentChunkLength >= MIN_CHUNK) || currentChunkLength >= MAX_CHUNK) {
                break
            }
        }

        const chunk = chunkWords.join(" ")

        const utter = new SpeechSynthesisUtterance(chunk)
        utter.voice = voice
        utter.rate = 0.9 // Slower for clarity
        utter.pitch = 1.0
        utter.volume = 1.0

        utter.onboundary = (e) => {
            if (e.name === "word") {
                const startOfChunk = i - chunkWords.length
                const previous = words.slice(0, startOfChunk).join(" ")

                // Identify the word currently being spoken to display it immediately (karaoke style)
                // e.charIndex is the start of the word within the current chunk.
                // We find the end of this word to show it "as" it is spoken.
                const reminder = chunk.slice(e.charIndex)
                const nextSpaceIndex = reminder.search(/\s/)
                const wordLen = nextSpaceIndex < 0 ? reminder.length : nextSpaceIndex

                const currentChunkText = chunk.slice(0, e.charIndex + wordLen)
                const fullTextSoFar = (previous ? previous + " " : "") + currentChunkText

                // Update the UI with the text synced to the exact word being spoken
                onChunk(fullTextSoFar)
            }
        }

        utter.onend = () => {
            // Update displayed text fully after each chunk
            displayed = words.slice(0, i).join(" ")
            onChunk(displayed)
            requestAnimationFrame(speakNext)
        }

        utter.onerror = () => {
            onChunk(fullText)
        }

        synth.cancel() // Clear potential buffer
        synth.speak(utter)
    }
    speakNext()
}

async function fallbackTyping(text: string, onChunk: (s: string) => void) {
    const words = text.split(/\s+/).filter(Boolean)
    let displayed = ""
    for (const word of words) {
        displayed += (displayed ? " " : "") + word
        onChunk(displayed)
        await new Promise(r => setTimeout(r, 80))
    }
    onChunk(text)
}

/* ====================== COMPONENT ====================== */

export default function DebateArenaPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-orange-600" /></div>}>
            <DebateArenaContent />
        </Suspense>
    )
}

/* --- VISUAL COMPONENTS --- */

// Audio Wave Animation
const AudioWave = ({ active, colorClass }: { active: boolean, colorClass: string }) => {
    return (
        <div className="flex items-center justify-center gap-1 h-8">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-1.5 rounded-full ${colorClass}`}
                    animate={{
                        height: active ? [10, 24, 10] : 4,
                        opacity: active ? 1 : 0.3
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

function DebateArenaContent() {
    const { id } = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchId = typeof window !== "undefined" ? new URLSearchParams(location.search).get("id") : null
    const debateId = (searchId ?? id) as string
    const { user } = useAuth()

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

    useEffect(() => {
        if (!debateId) { setLoading(false); return }
        fetchDebateById(debateId).then(d => {
            setDebate(d)
            if (d.transcript?.length) setDebateStarted(true)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [debateId])

    useEffect(() => {
        if (transcript) {
            setCurrentHumanText(transcript)
            setHumanSpeaking(true)
        }
    }, [transcript])

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

            const placeholderAiMsg: DebateMessage = { speaker: "AI Debater", message: "", phase: "discussion", timestamp: new Date().toLocaleTimeString() }
            setDebate(p => p ? { ...p, transcript: [...(p.transcript || []), placeholderAiMsg] } : p)

            await speakTextStream(res.message, (partial) => {
                setLiveAiText(partial)
                updateLastAiMessage(partial)
            }, res.message)

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
            await speakTextStream(opening.message, setLiveAiText, opening.message)
            setLiveAiText(opening.message)
            setStreamingAi(false)
        } else {
            setDebateStarted(true)
        }
    }
    const [endingAnimation, setEndingAnimation] = useState(false)

    const handleEnd = async () => {
        if (!confirm("End debate? Transcript will be saved.")) return
        setEndingAnimation(true)
        stopListening()
        await endHumanDebate(debate!.id)
        setTimeout(() => {
            const challengerScore = searchParams.get("challengerScore")
            const challengerName = searchParams.get("challengerName")
            router.push(`/dashboard/debatehumanarea/analysis/${debate!.id}?challengerScore=${challengerScore || ''}&challengerName=${encodeURIComponent(challengerName || '')}`)
        }, 1800)
    }

    useEffect(() => {
        transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" })
    }, [debate?.transcript, liveAiText])

    const latestHuman = debate?.transcript?.filter(m => m.speaker === "You").at(-1)
    const latestAi = debate?.transcript?.filter(m => m.speaker === "AI Debater").at(-1)
    const openingAi = debate?.transcript?.find(m => m.speaker === "AI Debater" && m.phase === "opening")

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
            <p className="text-slate-600 font-bold tracking-wide text-sm animate-pulse">PREPARING ARENA...</p>
        </div>
    )

    if (endingAnimation) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F0F2F5] relative overflow-hidden">
                {/* Background Grid & Particles */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-400/30 blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-orange-400/30 blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    {/* --- THE 'BRAIN' CORE ANIMATION --- */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                        {/* Core Pulse */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 blur-md"
                        />
                        <div className="absolute w-16 h-16 rounded-full bg-white z-20 shadow-[0_0_40px_rgba(59,130,246,0.6)]" />

                        {/* Orbiting Ring 1 */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute w-32 h-32 rounded-full border-[3px] border-transparent border-t-blue-500 border-l-blue-400/50"
                        />
                        {/* Orbiting Ring 2 (Counter-rotate) */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute w-40 h-40 rounded-full border-[2px] border-slate-200 border-b-orange-500 border-r-orange-400/50"
                        />

                        {/* Orbiting Ring 3 (Tilt) */}
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute w-48 h-48 rounded-full border border-dashed border-slate-300/50"
                        />

                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow-sm"
                                animate={{
                                    y: [0, -60, 0],
                                    x: [0, (i % 2 === 0 ? 30 : -30), 0],
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>

                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">
                        ANALYZING DEBATE
                    </h2>
                    <div className="flex items-center gap-1.5 h-6">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Synthesizing Results</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.1 }}
                            className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                        />
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, repeatDelay: 0.1 }}
                            className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                        />
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, repeatDelay: 0.1 }}
                            className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                        />
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!debate) return null

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-900 overflow-x-hidden">

            {/* --- AMBIENT BACKGROUNDS --- */}
            {/* Warm floating orb (Human side) */}
            <div className={`
                fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-400/20 blur-[100px] pointer-events-none transition-all duration-[2000ms]
                ${humanSpeaking ? "opacity-100 scale-110" : "opacity-60 scale-100"}
            `} />

            {/* Cool floating orb (AI side) */}
            <div className={`
                fixed top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none transition-all duration-[2000ms]
                ${(streamingAi || aiThinking) ? "opacity-100 scale-110" : "opacity-60 scale-100"}
            `} />

            {/* --- HEADER --- */}
            <header className="fixed top-0 inset-x-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img
                            src="/mainlogo.png"
                            alt="PrismMinds Logo"
                            className="w-8 h-8 object-contain drop-shadow-md"
                        />
                        <span className="font-extrabold text-lg tracking-tight text-slate-900">PrismMinds</span>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 top-4 hidden md:flex">
                        <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border-[1.5px] border-slate-300 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Live Session</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-full hover:bg-slate-200 transition text-slate-500 hover:text-slate-800"
                            onClick={() => router.push("/dashboard")}
                        >
                            <X className="w-6 h-6 stroke-[2.5px]" />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN STAGE --- */}
            <main className="relative pt-24 pb-32 px-4 max-w-6xl mx-auto min-h-screen flex flex-col">

                {/* TOPIC BANNER */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                        {debate.topic}
                    </h1>
                    <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">Debate Arena</p>
                </div>

                {/* START OVERLAY */}
                {!debateStarted && openingAi && (
                    <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center -mt-20">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <button
                                onClick={handleStart}
                                className="group relative px-9 py-5 bg-slate-900 text-white rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <Play className="w-6 h-6 fill-current" />
                                    Initialize Debate
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </button>
                            <p className="mt-4 text-slate-600 font-bold text-sm">Tap to begin the session</p>
                        </motion.div>
                    </div>
                )}

                {/* --- SPLIT VIEW ARENA --- */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 relative">

                    {/* HUMAN SIDE - FLOATING DESIGN */}
                    <div className="flex flex-col h-full justify-start pt-4 md:pt-5 relative z-10" >
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-8"
                        >
                            {/* Floating Avatar */}
                            <div className="relative group">
                                <div className={`
                                    w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center transition-all duration-300
                                    bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-[0_20px_50px_-10px_rgba(249,115,22,0.5)]
                                    ${humanSpeaking ? "ring-[6px] ring-orange-400 ring-offset-4 ring-offset-[#F0F2F5]" : "grayscale-[0.3]"}
                                `}>
                                    <User className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
                                </div>
                                {/* Floating Status Badge */}
                                <div className={`
                                    absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg border-2 border-white
                                    ${humanSpeaking ? "bg-orange-600 text-white" : "bg-slate-300 text-slate-600"}
                                `}>
                                    {user?.displayName || "Challenger"}
                                </div>
                            </div>

                            {/* Floating Text Bubble */}
                            <div className={`
                                relative rounded-3xl backdrop-blur-xl border-2 transition-all duration-300
                                px-6 md:px-8 pb-8 pt-12 w-full max-w-md
                                ${humanSpeaking
                                    ? "bg-white/95 border-orange-500 shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] z-10"
                                    : "bg-white/60 border-slate-200 shadow-md grayscale-[0.2] z-0"}
                            `}>
                                {/* Audio Viz (Inside Top) */}
                                {humanSpeaking && (
                                    <div className="absolute top-4 left-0 right-0 flex justify-center h-6">
                                        <AudioWave active={true} colorClass="bg-orange-600" />
                                    </div>
                                )}

                                <p className="text-center text-lg md:text-xl font-bold leading-relaxed text-slate-900">
                                    &ldquo;
                                    {humanSpeaking
                                        ? (currentHumanText || "Listening...")
                                        : (latestHuman?.message || "Your turn...")}
                                    &rdquo;
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* VS SEPARATOR - PROFESSIONAL */}
                    <div className="hidden md:flex absolute left-1/2 inset-y-0 -translate-x-1/2 z-0 pointer-events-none flex-col items-center">
                        <div className="h-full w-px bg-slate-100" />
                        <div className="absolute top-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                            <span className="font-serif italic text-slate-400 text-sm">vs</span>
                        </div>
                    </div>


                    {/* AI SIDE - FLOATING DESIGN */}
                    <div className="flex flex-col h-full justify-start pt-4 md:pt-5 relative z-10">
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-8"
                        >
                            {/* Floating Avatar */}
                            <div className="relative group">
                                <div className="relative">
                                    <div className={`
                                        w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300
                                        bg-gradient-to-bl from-blue-600 to-indigo-700 text-white shadow-[0_20px_50px_-10px_rgba(59,130,246,0.5)]
                                        ${(streamingAi || aiThinking) ? "ring-[6px] ring-blue-400 ring-offset-4 ring-offset-[#F0F2F5]" : "grayscale-[0.3]"}
                                    `}>
                                        <Bot className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
                                    </div>
                                    {aiThinking && (
                                        <div className="absolute inset-[-12px] rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                                    )}
                                </div>
                                {/* Floating Status Badge */}
                                <div className={`
                                    absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg border-2 border-white
                                    ${(streamingAi || aiThinking) ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}
                                `}>
                                    {aiThinking ? "Thinking" : "Opponent"}
                                </div>
                            </div>

                            {/* Floating Text Bubble */}
                            <div className={`
                                relative rounded-3xl backdrop-blur-xl border-2 transition-all duration-300
                                px-6 md:px-8 pb-8 pt-12 w-full max-w-md
                                ${(streamingAi || aiThinking)
                                    ? "bg-white/95 border-blue-500 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] z-10"
                                    : "bg-white/60 border-slate-200 shadow-md grayscale-[0.2] z-0"}
                            `}>
                                {/* Audio Viz (Inside Top) */}
                                {streamingAi && (
                                    <div className="absolute top-4 left-0 right-0 flex justify-center h-6">
                                        <AudioWave active={true} colorClass="bg-blue-600" />
                                    </div>
                                )}

                                <p className="text-center text-lg md:text-xl font-bold leading-relaxed text-slate-900">
                                    {aiThinking ? (
                                        <span className="flex items-center justify-center gap-2 text-blue-600 animate-pulse">
                                            <Sparkles className="w-5 h-5" /> Processing...
                                        </span>
                                    ) : (
                                        <>
                                            &ldquo;
                                            {streamingAi ? liveAiText : (latestAi?.message || openingAi?.message || "Ready...")}
                                            &rdquo;
                                        </>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                </div>

                {/* --- TRANSCRIPT SECTION --- */}
                {
                    debateStarted && debate.transcript && debate.transcript.length > 0 && (
                        <div className="mt-8 max-w-4xl mx-auto w-full px-4">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Live Transcript</h3>
                                <div className="h-[2px] flex-1 bg-slate-200" />
                            </div>

                            <div
                                ref={transcriptRef}
                                className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent space-y-6"
                            >
                                {debate.transcript.map((m, i) => {
                                    const isUser = m.speaker === "You"
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex w-full items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                                        >
                                            {/* Tiny Avatar for Chat */}
                                            <div className={`
                                            w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[10px] shadow-sm
                                            ${isUser ? "bg-orange-600" : "bg-blue-600"}
                                        `}>
                                                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </div>

                                            {/* Message Bubble */}
                                            <div className={`
                                            max-w-[75%] p-4 rounded-3xl text-sm font-bold leading-relaxed border-[1.5px] shadow-sm relative group
                                            ${isUser
                                                    ? "bg-slate-900 text-white rounded-br-none border-slate-900"
                                                    : "bg-white text-slate-900 rounded-bl-none border-blue-200"
                                                }
                                        `}>
                                                <span className={`
                                                absolute -top-5 text-[10px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity
                                                ${isUser ? "right-2 text-slate-500" : "left-2 text-blue-600"}
                                            `}>
                                                    {m.speaker} • {m.timestamp}
                                                </span>
                                                {m.message}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }


                {/* --- FLOATING CONTROLS --- */}
                {
                    debateStarted && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-white/90 backdrop-blur-xl p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-100 flex items-center gap-2"
                            >
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    disabled={sending}
                                    className={`
                                    h-14 px-8 rounded-full font-bold flex items-center gap-3 transition-all duration-300
                                    ${isListening
                                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                        }
                                    disabled:opacity-50 disabled:scale-95
                                `}
                                >
                                    {isListening ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            Stop Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-5 h-5" />
                                            Tap to Speak
                                        </>
                                    )}
                                </button>

                                <div className="w-[2px] h-8 bg-slate-200 mx-2" />

                                <button
                                    onClick={handleEnd}
                                    className="w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors border-2 border-slate-200"
                                    title="End Debate"
                                >
                                    <Square className="w-5 h-5 fill-current" />
                                </button>
                            </motion.div>
                        </div>
                    )
                }

            </main >
        </div >
    )
}