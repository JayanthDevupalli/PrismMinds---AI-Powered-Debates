"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, ChevronDown, User, Mic, MicOff, Brain } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type Message = {
    role: "user" | "assistant"
    content: string
}

export default function ChatBot() {
    const { user } = useAuth()
    const [isVisible, setIsVisible] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isOpen])

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0 && isOpen) {
            setMessages([
                {
                    role: "assistant",
                    content: "Hi there! I'm the PrismMinds Support Bot. I can help you with debates, account settings, or general questions. How can I assist you today?"
                }
            ])
        }
    }, [isOpen])

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = false
                recognition.interimResults = false
                recognition.lang = "en-US"

                recognition.onstart = () => setIsListening(true)
                recognition.onend = () => setIsListening(false)
                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    setInput(prev => prev + (prev ? " " : "") + transcript)
                }
                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error)
                    setIsListening(false)
                    toast.error("Could not recognize voice. Please try again.")
                }

                recognitionRef.current = recognition
            }
        }
    }, [])

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition is not supported in this browser.")
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
        } else {
            recognitionRef.current.start()
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { role: "user", content: input.trim() }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            // Prepare context
            const userContext = {
                uid: user?.uid || "guest",
                displayName: user?.displayName || "Guest",
                email: user?.email
            }

            // Call Backend
            const response = await fetch("https://prismmindsdb.onrender.com/api/chat", {
                // const response = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: [...messages, userMsg], // Send full history
                    userContext
                })
            })

            if (!response.ok) {
                throw new Error("Failed to get response")
            }

            const data = await response.json()

            const botMsg: Message = { role: "assistant", content: data.response }
            setMessages(prev => [...prev, botMsg])

        } catch (error) {
            console.error("Chat error:", error)
            toast.error("Failed to connect to support bot.")
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again later." }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto bg-white dark:bg-slate-900 w-full h-[100dvh] fixed inset-0 sm:static sm:w-[380px] sm:h-[500px] sm:max-h-[80vh] rounded-none sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-0 sm:mb-4 z-50 sm:z-auto"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">PrismMinds Support</h3>
                                    <span className="flex items-center gap-1 text-[10px] text-indigo-100/80">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5 text-white/90" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 scroll-smooth">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none"
                                            }`}
                                    >
                                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-normal prose-a:text-blue-500 hover:prose-a:underline">
                                            <ReactMarkdown
                                                components={{
                                                    a: (props: any) => <a {...props} target="_blank" rel="noopener noreferrer" className="font-bold underline" />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                        <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <div className="relative flex items-center gap-2">
                                {/* Audio Waveform Animation (Overlay when listening) */}
                                <AnimatePresence>
                                    {isListening && !input && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute left-4 z-10 flex items-center gap-1 pointer-events-none"
                                        >
                                            <span className="text-xs font-medium text-indigo-500 mr-2">Listening</span>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        height: [4, 12, 4],
                                                        backgroundColor: ["#6366f1", "#8b5cf6", "#6366f1"]
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        repeat: Infinity,
                                                        repeatType: "reverse",
                                                        delay: i * 0.1
                                                    }}
                                                    className="w-1 rounded-full"
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isListening ? "" : "Tell us what you want to know..."}
                                    className={`w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-3 pl-4 pr-20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 ${isListening ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : ""}`}
                                />
                                <div className="absolute right-2 flex items-center gap-1">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-1.5 rounded-lg transition-all ${isListening
                                            ? "bg-red-500 text-white animate-pulse"
                                            : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                        title="Voice input"
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-slate-400">
                                    AI can make mistakes. Check important info.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <AnimatePresence>
                {!isOpen && isVisible && (
                    <motion.div
                        className="pointer-events-auto relative group"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Close/Minimize X Button (Attached) - Visible on Hover */}
                        <div className="absolute -top-1 -right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsVisible(false)
                                }}
                                className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-full p-1 shadow-md hover:bg-red-100 hover:text-red-500 transition-colors border border-white dark:border-slate-800"
                                title="Hide widget"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Subtle Breathing Glow (Behind) */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-1 bg-indigo-500 rounded-full blur-md"
                        />

                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative z-10 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl flex items-center justify-center transition-all border border-indigo-400/30 overflow-hidden group"
                        >
                            {/* Glint Effect (Sweeping Shine) */}
                            <motion.div
                                initial={{ x: "-100%", opacity: 0 }}
                                animate={{ x: "200%", opacity: [0, 1, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                            />

                            <Brain className="w-7 h-7" />
                        </motion.button>

                        {/* Tooltip hint on hover */}
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2 pointer-events-none whitespace-nowrap z-20">
                            Need help?
                            {/* Arrow */}
                            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-8 border-transparent border-l-white dark:border-l-slate-800" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Restore Tab (Visible when hidden) */}
            <AnimatePresence>
                {!isOpen && !isVisible && (
                    <motion.button
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        whileHover={{ x: -5 }}
                        onClick={() => setIsVisible(true)}
                        className="pointer-events-auto fixed bottom-20 right-0 bg-indigo-600/20 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 p-2 rounded-l-lg shadow-sm border-l border-t border-b border-indigo-400/20 z-40 hover:bg-indigo-600 hover:text-white transition-all opacity-50 hover:opacity-100"
                        title="Show Support Bot"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
