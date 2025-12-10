// // "use client"

// // import { useParams, useRouter } from "next/navigation"
// // import React, { useEffect, useState, useRef, useCallback } from "react"
// // import { motion, AnimatePresence } from "framer-motion"
// // import { X, Download, Mic, MicOff, Loader2, User, Bot, Square, Play } from "lucide-react"
// // import { fetchDebateById, sendHumanMessage, endHumanDebate } from "@/lib/api"
// // import { downloadDebateTranscriptPDF } from "@/lib/pdf-generator"
// // import { useAuth } from "@/lib/auth-context"

// // type DebateMessage = {
// //   speaker: string
// //   message: string
// //   phase?: "opening" | "discussion" | "closing"
// //   timestamp?: string
// // }

// // type Debate = {
// //   id: string
// //   topic: string
// //   personaA: string
// //   personaB: string
// //   duration?: string
// //   transcript?: DebateMessage[]
// //   summary?: string
// //   createdAt: string
// //   debateType?: string
// // }

// // // Voice-to-Text Hook with improved pause handling
// // function useSpeechRecognition() {
// //   const [isListening, setIsListening] = useState(false)
// //   const [transcript, setTranscript] = useState("")
// //   const [error, setError] = useState<string | null>(null)
// //   const recognitionRef = useRef<any>(null)
// //   const accumulatedTextRef = useRef<string>("")
// //   const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

// //   useEffect(() => {
// //     if (typeof window === "undefined") return

// //     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
// //     if (!SpeechRecognition) {
// //       setError("Speech recognition not supported in this browser")
// //       return
// //     }

// //     const recognition = new SpeechRecognition()
// //     recognition.continuous = true
// //     recognition.interimResults = true
// //     recognition.lang = "en-US"

// //     recognition.onresult = (event: any) => {
// //       // Clear any existing pause timeout
// //       if (pauseTimeoutRef.current) {
// //         clearTimeout(pauseTimeoutRef.current)
// //         pauseTimeoutRef.current = null
// //       }

// //       let interimTranscript = ""
// //       let newFinalText = ""

// //       // Process all results from the event
// //       for (let i = event.resultIndex; i < event.results.length; i++) {
// //         const transcript = event.results[i][0].transcript.trim()
// //         if (event.results[i].isFinal && transcript) {
// //           // Only add if it's not already in accumulated text
// //           if (!accumulatedTextRef.current.includes(transcript)) {
// //             newFinalText += transcript + " "
// //           }
// //         } else if (!event.results[i].isFinal) {
// //           interimTranscript += transcript
// //         }
// //       }

// //       // Add new final text to accumulated
// //       if (newFinalText) {
// //         accumulatedTextRef.current += newFinalText
// //       }

// //       // Always show accumulated text + current interim text
// //       const displayText = accumulatedTextRef.current + (interimTranscript || "")
// //       setTranscript(displayText)

// //       // Set timeout to detect pause - if no new results for 3 seconds, keep accumulated text
// //       pauseTimeoutRef.current = setTimeout(() => {
// //         // Keep the accumulated text, don't reset
// //         if (accumulatedTextRef.current) {
// //           setTranscript(accumulatedTextRef.current)
// //         }
// //       }, 3000)
// //     }

// //     recognition.onerror = (event: any) => {
// //       console.error("Speech recognition error:", event.error)
// //       setError(event.error)
// //       setIsListening(false)
// //     }

// //     recognition.onend = () => {
// //       // Don't reset accumulated text on end, keep it
// //       setIsListening(false)
// //     }

// //     recognitionRef.current = recognition

// //     return () => {
// //       if (recognitionRef.current) {
// //         recognitionRef.current.stop()
// //       }
// //       if (pauseTimeoutRef.current) {
// //         clearTimeout(pauseTimeoutRef.current)
// //       }
// //     }
// //   }, [])

// //   const startListening = useCallback(() => {
// //     if (recognitionRef.current && !isListening) {
// //       // Reset accumulated text when starting fresh
// //       accumulatedTextRef.current = ""
// //       setTranscript("")
// //       setError(null)
// //       setIsListening(true)
// //       recognitionRef.current.start()
// //     }
// //   }, [isListening])

// //   const stopListening = useCallback(() => {
// //     if (recognitionRef.current && isListening) {
// //       recognitionRef.current.stop()
// //       setIsListening(false)
// //       // Keep accumulated text
// //     }
// //   }, [isListening])

// //   const resetTranscript = useCallback(() => {
// //     accumulatedTextRef.current = ""
// //     setTranscript("")
// //   }, [])

// //   return {
// //     isListening,
// //     transcript,
// //     error,
// //     startListening,
// //     stopListening,
// //     resetTranscript,
// //   }
// // }

// // // Text-to-Speech for AI responses
// // function speakText(text: string): Promise<void> {
// //   return new Promise((resolve) => {
// //     if (typeof window === "undefined" || !window.speechSynthesis) {
// //       resolve()
// //       return
// //     }

// //     const synth = window.speechSynthesis
// //     synth.cancel()

// //     const utterance = new SpeechSynthesisUtterance(text)
// //     utterance.rate = 1.0
// //     utterance.pitch = 1.0
// //     utterance.volume = 1.0

// //     const voices = synth.getVoices()
// //     const aiVoice = voices.find((v) => /female|amy|victoria|zira|susan|google uk english female/i.test(v.name)) ||
// //                      voices.find((v) => v.name.includes("Google")) ||
// //                      voices[0]
    
// //     if (aiVoice) {
// //       utterance.voice = aiVoice
// //     }

// //     utterance.onend = () => resolve()
// //     utterance.onerror = () => resolve()
    
// //     synth.speak(utterance)
// //   })
// // }

// // export default function DebateHumanAreaPage() {
// //   const routeParams = useParams()
// //   const router = useRouter()
// //   const { user } = useAuth()
// //   const [searchId, setSearchId] = useState<string | null>(null)
// //   const [debate, setDebate] = useState<Debate | null>(null)
// //   const [loading, setLoading] = useState<boolean>(true)
// //   const [sending, setSending] = useState<boolean>(false)
// //   const [aiThinking, setAiThinking] = useState<boolean>(false)
// //   const [humanSpeaking, setHumanSpeaking] = useState<boolean>(false)
// //   const [currentHumanText, setCurrentHumanText] = useState<string>("")
// //   const [debateEnded, setDebateEnded] = useState<boolean>(false)
// //   const [endingDebate, setEndingDebate] = useState<boolean>(false)
// //   const [debateStarted, setDebateStarted] = useState<boolean>(false)
// //   const [startingDebate, setStartingDebate] = useState<boolean>(false)

// //   const { isListening, transcript, error, startListening, stopListening, resetTranscript } = useSpeechRecognition()

// //   useEffect(() => {
// //     if (typeof window !== "undefined") {
// //       const p = new URLSearchParams(window.location.search)
// //       setSearchId(p.get("id"))
// //     }
// //   }, [])

// //   const debateId = searchId || (routeParams?.id as string | undefined)

// //   useEffect(() => {
// //     if (!debateId) {
// //       setLoading(false)
// //       return
// //     }

// //     let mounted = true
// //     async function loadDebate() {
// //       if (!debateId) return
// //       try {
// //         const data = await fetchDebateById(debateId)
// //         if (!mounted) return
// //         const transcript = data.transcript ?? []
// //         setDebate({
// //           ...data,
// //           transcript: transcript,
// //         })
// //         // Check if debate already has messages (means it was started before)
// //         if (transcript.length > 0) {
// //           setDebateStarted(true)
// //         }
// //         setLoading(false)
// //       } catch (err) {
// //         console.error(err)
// //         if (mounted) {
// //           setLoading(false)
// //         }
// //       }
// //     }

// //     loadDebate()
// //     return () => {
// //       mounted = false
// //     }
// //   }, [debateId])

// //   // Update current human text when transcript changes
// //   useEffect(() => {
// //     if (transcript) {
// //       setCurrentHumanText(transcript)
// //       setHumanSpeaking(true)
// //     }
// //   }, [transcript])

// //   // Auto-send when user stops speaking (with a small delay to ensure final transcript is captured)
// //   useEffect(() => {
// //     if (!isListening && currentHumanText.trim() && humanSpeaking && !sending) {
// //       const timer = setTimeout(() => {
// //         handleSendMessage(currentHumanText.trim())
// //       }, 500) // Small delay to ensure final transcript is captured
      
// //       return () => clearTimeout(timer)
// //     }
// //   }, [isListening, currentHumanText, humanSpeaking, sending])

// //   const handleSendMessage = async (messageText?: string) => {
// //     if (!debate || debateEnded || sending) return

// //     const humanMessage = messageText || currentHumanText.trim()
// //     if (!humanMessage) {
// //       setHumanSpeaking(false)
// //       setCurrentHumanText("")
// //       return
// //     }

// //     setSending(true)
// //     setAiThinking(true)
// //     setHumanSpeaking(false)
// //     const textToSend = humanMessage
// //     setCurrentHumanText("")
// //     resetTranscript() // Reset accumulated transcript after sending

// //     // Add human message to local state immediately
// //     const newHumanMessage: DebateMessage = {
// //       speaker: "You",
// //       message: humanMessage,
// //       phase: "discussion",
// //       timestamp: new Date().toLocaleTimeString(),
// //     }

// //     setDebate((prev) => {
// //       if (!prev) return prev
// //       return {
// //         ...prev,
// //         transcript: [...(prev.transcript || []), newHumanMessage],
// //       }
// //     })

// //     try {
// //       // Send to backend and get AI response
// //       const aiResponse = await sendHumanMessage(debate.id, textToSend)

// //       // Add AI response
// //       const newAiMessage: DebateMessage = {
// //         speaker: "AI Debater",
// //         message: aiResponse.message,
// //         phase: "discussion",
// //         timestamp: new Date().toLocaleTimeString(),
// //       }

// //       setDebate((prev) => {
// //         if (!prev) return prev
// //         return {
// //           ...prev,
// //           transcript: [...(prev.transcript || []), newAiMessage],
// //         }
// //       })

// //       // Speak AI response
// //       await speakText(aiResponse.message)
// //     } catch (err: any) {
// //       console.error("Error sending message:", err)
// //       alert(err?.message || "Failed to send message. Please try again.")
// //     } finally {
// //       setSending(false)
// //       setAiThinking(false)
// //     }
// //   }

// //   const handleStopDebate = async () => {
// //     if (!debate || debateEnded || endingDebate) return

// //     if (!window.confirm("Are you sure you want to end this debate? The transcript will be saved.")) {
// //       return
// //     }

// //     setEndingDebate(true)
// //     setDebateEnded(true)
// //     stopListening()

// //     try {
// //       await endHumanDebate(debate.id)
// //       alert("Debate ended successfully! The transcript has been saved.")
// //       router.push("/dashboard")
// //     } catch (err: any) {
// //       console.error("Error ending debate:", err)
// //       alert(err?.message || "Failed to end debate. Please try again.")
// //       setEndingDebate(false)
// //       setDebateEnded(false)
// //     }
// //   }

// //   const handleVoiceToggle = () => {
// //     if (isListening) {
// //       stopListening()
// //     } else {
// //       startListening()
// //       setHumanSpeaking(true)
// //     }
// //   }

// //   const handleStartDebate = async () => {
// //     if (!debate || debateStarted || startingDebate) return

// //     setStartingDebate(true)
// //     setAiThinking(true)

// //     try {
// //       // Get the opening AI message (first message in transcript)
// //       const openingMessage = debate.transcript?.find(m => m.speaker === "AI Debater")
      
// //       if (openingMessage) {
// //         // Mark debate as started first so UI updates
// //         setDebateStarted(true)
        
// //         // Small delay for UI to update and show the message
// //         await new Promise(resolve => setTimeout(resolve, 500))
        
// //         // Speak the opening message with text-to-speech
// //         await speakText(openingMessage.message)
// //       } else {
// //         // If no opening message, just start the debate
// //         setDebateStarted(true)
// //       }
// //     } catch (err) {
// //       console.error("Error starting debate:", err)
// //       setDebateStarted(true) // Still allow debate to start even if speech fails
// //     } finally {
// //       setStartingDebate(false)
// //       setAiThinking(false)
// //     }
// //   }

// //   // Get current messages for display
// //   const currentHumanMsg = debate?.transcript?.filter(m => m.speaker === "You").slice(-1)[0]
// //   const currentAiMsg = debate?.transcript?.filter(m => m.speaker === "AI Debater").slice(-1)[0]
// //   const openingAiMsg = debate?.transcript?.find(m => m.speaker === "AI Debater" && m.phase === "opening")
// //   const humanIsSpeaking = humanSpeaking || isListening
// //   const aiIsSpeaking = aiThinking || (startingDebate && !debateStarted)

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50">
// //         <motion.div
// //           initial={{ opacity: 0, scale: 0.9 }}
// //           animate={{ opacity: 1, scale: 1 }}
// //           className="text-center"
// //         >
// //           <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
// //           <p className="text-slate-600 font-medium">Loading debate...</p>
// //         </motion.div>
// //       </div>
// //     )
// //   }

// //   if (!debate) {
// //     return (
// //       <div className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50">
// //         <div className="text-center">
// //           <p className="text-red-500 font-medium">Debate not found.</p>
// //           <button
// //             onClick={() => router.push("/dashboard")}
// //             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
// //           >
// //             Go Back
// //           </button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
// //       {/* Header */}
// //       <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-border/50 shadow-sm">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
// //     <div>
// //             <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
// //               Human → AI Debate
// //             </h1>
// //             <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
// //               Topic: <span className="font-semibold text-foreground">{debate.topic}</span>
// //             </p>
// //           </div>

// //           <div className="flex items-center gap-2">
// //             <button
// //               onClick={async () => {
// //                 if (!debate) return
// //                 await downloadDebateTranscriptPDF(
// //                   debate.topic,
// //                   debate.personaA,
// //                   debate.personaB,
// //                   debate.transcript,
// //                   debate.createdAt,
// //                   debate.summary,
// //                 )
// //               }}
// //               className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
// //               title="Download Transcript"
// //             >
// //               <Download className="w-5 h-5 text-slate-600 dark:text-slate-300" />
// //             </button>
// //             <button
// //               onClick={() => router.push("/dashboard")}
// //               className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
// //               title="Close"
// //             >
// //               <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="pt-20 pb-32">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6">
// //           {/* Start Debate Button - Show before debate starts */}
// //           {!debateStarted && openingAiMsg && (
// //             <motion.div
// //               initial={{ opacity: 0, y: 20 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               className="flex flex-col items-center justify-center mb-16"
// //             >
// //               <motion.div
// //                 initial={{ scale: 0.9 }}
// //                 animate={{ scale: 1 }}
// //                 className="mb-8"
// //               >
// //                 <motion.button
// //                   whileHover={{ scale: 1.05 }}
// //                   whileTap={{ scale: 0.95 }}
// //                   onClick={handleStartDebate}
// //                   disabled={startingDebate}
// //                   className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-size-200 hover:bg-pos-right text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ring-4 ring-blue-200/50"
// //                 >
// //                   {startingDebate ? (
// //                     <>
// //                       <Loader2 className="w-7 h-7 animate-spin" />
// //                       <span>Starting Debate...</span>
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Play className="w-7 h-7" />
// //                       <span>Start Debate</span>
// //                     </>
// //                   )}
// //                 </motion.button>
// //               </motion.div>
// //               <motion.p
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 transition={{ delay: 0.2 }}
// //                 className="text-sm text-slate-600 dark:text-slate-400 font-medium"
// //               >
// //                 🎯 Click to begin the debate. AI will initiate the conversation.
// //               </motion.p>
// //             </motion.div>
// //           )}

// //           {/* Avatars & Speech Section - Similar to AI-to-AI layout */}
// //           <div className="flex items-start justify-center gap-20 md:gap-32 mb-16">
// //             {/* Human Avatar */}
// //             <div className="flex flex-col items-center max-w-xs">
// //               <motion.div
// //                 animate={
// //                   humanIsSpeaking
// //                     ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 32px rgba(59,130,246,0.4)", "0 0 0 rgba(0,0,0,0)"] }
// //                     : { opacity: [0.85, 1, 0.85] }
// //                 }
// //                 transition={{ duration: 1.4, repeat: Infinity }}
// //                 className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg transition-all ring-4 ring-blue-100"
// //               >
// //                 <User className="w-14 h-14" />
// //               </motion.div>

// //               <p className="mt-4 text-base font-bold text-blue-600">You</p>

// //               {/* Human Message Display */}
// //               <motion.div
// //                 layout
// //                 initial={{ opacity: 0, y: 8 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ duration: 0.28 }}
// //                 className="mt-6 w-[20rem] sm:w-[24rem] bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md min-h-[80px] border border-blue-100"
// //               >
// //                 {humanIsSpeaking && currentHumanText ? (
// //                   <p className="text-base text-slate-800 leading-relaxed font-medium">{currentHumanText}</p>
// //                 ) : currentHumanMsg ? (
// //                   <p className="text-base text-slate-800 leading-relaxed font-medium">{currentHumanMsg.message}</p>
// //                 ) : (
// //                   <p className="text-sm text-slate-400 italic">Your message will appear here...</p>
// //                 )}
// //               </motion.div>
// //             </div>

// //             {/* AI Avatar */}
// //             <div className="flex flex-col items-center max-w-xs">
// //               <motion.div
// //                 animate={
// //                   aiIsSpeaking
// //                     ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 32px rgba(6,182,212,0.4)", "0 0 0 rgba(0,0,0,0)"] }
// //                     : { opacity: [0.85, 1, 0.85] }
// //                 }
// //                 transition={{ duration: 1.4, repeat: Infinity }}
// //                 className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg transition-all ring-4 ring-cyan-100"
// //               >
// //                 <Bot className="w-14 h-14" />
// //               </motion.div>

// //               <p className="mt-4 text-base font-bold text-cyan-600">AI Debater</p>

// //               {/* AI Message Display */}
// //               <motion.div
// //                 layout
// //                 initial={{ opacity: 0, y: 8 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ duration: 0.28 }}
// //                 className="mt-6 w-[20rem] sm:w-[24rem] bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md min-h-[80px] border border-cyan-100"
// //               >
// //                 {aiIsSpeaking ? (
// //                   <div className="flex items-center gap-2">
// //                     <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
// //                     <p className="text-sm text-slate-600">AI is thinking...</p>
// //                   </div>
// //                 ) : (debateStarted && currentAiMsg) ? (
// //                   <p className="text-base text-slate-800 leading-relaxed font-medium">{currentAiMsg.message}</p>
// //                 ) : (debateStarted && openingAiMsg) ? (
// //                   <p className="text-base text-slate-800 leading-relaxed font-medium">{openingAiMsg.message}</p>
// //                 ) : (
// //                   <p className="text-sm text-slate-400 italic">AI response will appear here...</p>
// //                 )}
// //               </motion.div>
// //             </div>
// //           </div>

// //           {/* Centered Voice Input Section - Only show after debate starts */}
// //           {debateStarted && (
// //             <div className="flex flex-col items-center justify-center mt-12 mb-8">
// //               <motion.button
// //                 whileHover={{ scale: 1.05 }}
// //                 whileTap={{ scale: 0.95 }}
// //                 onClick={handleVoiceToggle}
// //                 disabled={debateEnded || sending || aiThinking}
// //                 className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
// //                   isListening
// //                     ? "bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-200"
// //                     : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white ring-4 ring-blue-200"
// //                 } disabled:opacity-50 disabled:cursor-not-allowed`}
// //                 title={isListening ? "Stop Recording" : "Start Voice Input"}
// //               >
// //                 {isListening ? (
// //                   <MicOff className="w-12 h-12" />
// //                 ) : (
// //                   <Mic className="w-12 h-12" />
// //                 )}
// //               </motion.button>

// //               {/* Voice Status Text */}
// //               <motion.p
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 className={`mt-4 text-sm font-medium ${
// //                   isListening ? "text-red-600" : "text-slate-600"
// //                 }`}
// //               >
// //                 {isListening ? "🎤 Recording... Speak now!" : "Click to speak"}
// //               </motion.p>

// //               {/* Error Message */}
// //               {error && (
// //                 <motion.div
// //                   initial={{ opacity: 0, y: 10 }}
// //                   animate={{ opacity: 1, y: 0 }}
// //                   className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md"
// //                 >
// //                   <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
// //                 </motion.div>
// //               )}

// //               {/* Stop Debate Button - Below Voice Input */}
// //               <motion.button
// //                 whileHover={{ scale: 1.02 }}
// //                 whileTap={{ scale: 0.98 }}
// //                 onClick={handleStopDebate}
// //                 disabled={debateEnded || endingDebate}
// //                 className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
// //               >
// //                 <Square className="w-5 h-5" />
// //                 {endingDebate ? "Ending Debate..." : "Stop Debate"}
// //               </motion.button>

// //               {/* Debate Ended Message */}
// //               {debateEnded && (
// //                 <motion.div
// //                   initial={{ opacity: 0, scale: 0.9 }}
// //                   animate={{ opacity: 1, scale: 1 }}
// //                   className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
// //                 >
// //                   <p className="text-sm font-medium text-green-600 dark:text-green-400">
// //                     ✓ Debate ended. Transcript saved successfully!
// //                   </p>
// //                 </motion.div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// "use client"

// import { useParams, useRouter } from "next/navigation"
// import { useEffect, useState, useRef, useCallback } from "react"
// import { motion } from "framer-motion"
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

// function useSpeechRecognition() {
//   const [isListening, setIsListening] = useState(false)
//   const [transcript, setTranscript] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const recognitionRef = useRef<any>(null)
//   const accumulatedTextRef = useRef<string>("")
//   const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

//   useEffect(() => {
//     if (typeof window === "undefined") return

//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

//     if (!SpeechRecognition) {
//       setError("Speech recognition not supported in this browser")
//       return
//     }

//     const recognition = new SpeechRecognition()
//     recognition.continuous = true
//     recognition.interimResults = true
//     recognition.lang = "en-US"

//     recognition.onresult = (event: any) => {
//       if (pauseTimeoutRef.current) {
//         clearTimeout(pauseTimeoutRef.current)
//         pauseTimeoutRef.current = null
//       }

//       let interimTranscript = ""
//       let newFinalText = ""

//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const transcript = event.results[i][0].transcript.trim()
//         if (event.results[i].isFinal && transcript) {
//           if (!accumulatedTextRef.current.includes(transcript)) {
//             newFinalText += transcript + " "
//           }
//         } else if (!event.results[i].isFinal) {
//           interimTranscript += transcript
//         }
//       }

//       if (newFinalText) {
//         accumulatedTextRef.current += newFinalText
//       }

//       const displayText = accumulatedTextRef.current + (interimTranscript || "")
//       setTranscript(displayText)

//       pauseTimeoutRef.current = setTimeout(() => {
//         if (accumulatedTextRef.current) {
//           setTranscript(accumulatedTextRef.current)
//         }
//       }, 3000)
//     }

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event.error)
//       setError(event.error)
//       setIsListening(false)
//     }

//     recognition.onend = () => {
//       setIsListening(false)
//     }

//     recognitionRef.current = recognition

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop()
//       }
//       if (pauseTimeoutRef.current) {
//         clearTimeout(pauseTimeoutRef.current)
//       }
//     }
//   }, [])

//   const startListening = useCallback(() => {
//     if (recognitionRef.current && !isListening) {
//       accumulatedTextRef.current = ""
//       setTranscript("")
//       setError(null)
//       setIsListening(true)
//       recognitionRef.current.start()
//     }
//   }, [isListening])

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current && isListening) {
//       recognitionRef.current.stop()
//       setIsListening(false)
//     }
//   }, [isListening])

//   const resetTranscript = useCallback(() => {
//     accumulatedTextRef.current = ""
//     setTranscript("")
//   }, [])

//   return {
//     isListening,
//     transcript,
//     error,
//     startListening,
//     stopListening,
//     resetTranscript,
//   }
// }

// function speakText(text: string): Promise<void> {
//   return new Promise((resolve) => {
//     if (typeof window === "undefined" || !window.speechSynthesis) {
//       resolve()
//       return
//     }

//     const synth = window.speechSynthesis
//     synth.cancel()

//     const utterance = new SpeechSynthesisUtterance(text)
//     utterance.rate = 1.0
//     utterance.pitch = 1.0
//     utterance.volume = 1.0

//     const voices = synth.getVoices()
//     const aiVoice =
//       voices.find((v) => /female|amy|victoria|zira|susan|google uk english female/i.test(v.name)) ||
//       voices.find((v) => v.name.includes("Google")) ||
//       voices[0]

//     if (aiVoice) {
//       utterance.voice = aiVoice
//     }

//     utterance.onend = () => resolve()
//     utterance.onerror = () => resolve()

//     synth.speak(utterance)
//   })
// }

// export default function DebateArenaPage() {
//   const routeParams = useParams()
//   const router = useRouter()
//   const { user } = useAuth()
//   const [searchId, setSearchId] = useState<string | null>(null)
//   const [debate, setDebate] = useState<Debate | null>(null)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [sending, setSending] = useState<boolean>(false)
//   const [aiThinking, setAiThinking] = useState<boolean>(false)
//   const [humanSpeaking, setHumanSpeaking] = useState<boolean>(false)
//   const [currentHumanText, setCurrentHumanText] = useState<string>("")
//   const [debateEnded, setDebateEnded] = useState<boolean>(false)
//   const [endingDebate, setEndingDebate] = useState<boolean>(false)
//   const [debateStarted, setDebateStarted] = useState<boolean>(false)
//   const [startingDebate, setStartingDebate] = useState<boolean>(false)

//   const { isListening, transcript, error, startListening, stopListening, resetTranscript } = useSpeechRecognition()

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const p = new URLSearchParams(window.location.search)
//       setSearchId(p.get("id"))
//     }
//   }, [])

//   const debateId = searchId || (routeParams?.id as string | undefined)

//   useEffect(() => {
//     if (!debateId) {
//       setLoading(false)
//       return
//     }

//     let mounted = true
//     async function loadDebate() {
//       if (!debateId) return
//       try {
//         const data = await fetchDebateById(debateId)
//         if (!mounted) return
//         const transcript = data.transcript ?? []
//         setDebate({
//           ...data,
//           transcript: transcript,
//         })
//         if (transcript.length > 0) {
//           setDebateStarted(true)
//         }
//         setLoading(false)
//       } catch (err) {
//         console.error(err)
//         if (mounted) {
//           setLoading(false)
//         }
//       }
//     }

//     loadDebate()
//     return () => {
//       mounted = false
//     }
//   }, [debateId])

//   useEffect(() => {
//     if (transcript) {
//       setCurrentHumanText(transcript)
//       setHumanSpeaking(true)
//     }
//   }, [transcript])

//   useEffect(() => {
//     if (!isListening && currentHumanText.trim() && humanSpeaking && !sending) {
//       const timer = setTimeout(() => {
//         handleSendMessage(currentHumanText.trim())
//       }, 500)

//       return () => clearTimeout(timer)
//     }
//   }, [isListening, currentHumanText, humanSpeaking, sending])

//   const handleSendMessage = async (messageText?: string) => {
//     if (!debate || debateEnded || sending) return

//     const humanMessage = messageText || currentHumanText.trim()
//     if (!humanMessage) {
//       setHumanSpeaking(false)
//       setCurrentHumanText("")
//       return
//     }

//     setSending(true)
//     setAiThinking(true)
//     setHumanSpeaking(false)
//     const textToSend = humanMessage
//     setCurrentHumanText("")
//     resetTranscript()

//     const newHumanMessage: DebateMessage = {
//       speaker: "You",
//       message: humanMessage,
//       phase: "discussion",
//       timestamp: new Date().toLocaleTimeString(),
//     }

//     setDebate((prev) => {
//       if (!prev) return prev
//       return {
//         ...prev,
//         transcript: [...(prev.transcript || []), newHumanMessage],
//       }
//     })

//     try {
//       const aiResponse = await sendHumanMessage(debate.id, textToSend)

//       const newAiMessage: DebateMessage = {
//         speaker: "AI Debater",
//         message: aiResponse.message,
//         phase: "discussion",
//         timestamp: new Date().toLocaleTimeString(),
//       }

//       setDebate((prev) => {
//         if (!prev) return prev
//         return {
//           ...prev,
//           transcript: [...(prev.transcript || []), newAiMessage],
//         }
//       })

//       await speakText(aiResponse.message)
//     } catch (err: any) {
//       console.error("Error sending message:", err)
//       alert(err?.message || "Failed to send message. Please try again.")
//     } finally {
//       setSending(false)
//       setAiThinking(false)
//     }
//   }

//   const handleStopDebate = async () => {
//     if (!debate || debateEnded || endingDebate) return

//     if (!window.confirm("Are you sure you want to end this debate? The transcript will be saved.")) {
//       return
//     }

//     setEndingDebate(true)
//     setDebateEnded(true)
//     stopListening()

//     try {
//       await endHumanDebate(debate.id)
//       alert("Debate ended successfully! The transcript has been saved.")
//       router.push("/dashboard")
//     } catch (err: any) {
//       console.error("Error ending debate:", err)
//       alert(err?.message || "Failed to end debate. Please try again.")
//       setEndingDebate(false)
//       setDebateEnded(false)
//     }
//   }

//   const handleVoiceToggle = () => {
//     if (isListening) {
//       stopListening()
//     } else {
//       startListening()
//       setHumanSpeaking(true)
//     }
//   }

//   const handleStartDebate = async () => {
//     if (!debate || debateStarted || startingDebate) return

//     setStartingDebate(true)
//     setAiThinking(true)

//     try {
//       const openingMessage = debate.transcript?.find((m) => m.speaker === "AI Debater")

//       if (openingMessage) {
//         setDebateStarted(true)
//         await new Promise((resolve) => setTimeout(resolve, 500))
//         await speakText(openingMessage.message)
//       } else {
//         setDebateStarted(true)
//       }
//     } catch (err) {
//       console.error("Error starting debate:", err)
//       setDebateStarted(true)
//     } finally {
//       setStartingDebate(false)
//       setAiThinking(false)
//     }
//   }

//   const currentHumanMsg = debate?.transcript?.filter((m) => m.speaker === "You").slice(-1)[0]
//   const currentAiMsg = debate?.transcript?.filter((m) => m.speaker === "AI Debater").slice(-1)[0]
//   const openingAiMsg = debate?.transcript?.find((m) => m.speaker === "AI Debater" && m.phase === "opening")
//   const humanIsSpeaking = humanSpeaking || isListening
//   const aiIsSpeaking = aiThinking || (startingDebate && !debateStarted)

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
//         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
//             className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
//           />
//           <p className="text-slate-300 font-medium">Loading debate arena...</p>
//         </motion.div>
//       </div>
//     )
//   }

//   if (!debate) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
//           <p className="text-red-400 font-medium text-lg mb-6">Debate not found.</p>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => router.push("/dashboard")}
//             className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all"
//           >
//             Return to Dashboard
//           </motion.button>
//         </motion.div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
//       <div className="fixed inset-0 pointer-events-none">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />
//         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
//       </div>

//       <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-2xl bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-transparent border-b border-slate-700/30 shadow-2xl">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="space-y-1">
//             <motion.h1
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
//             >
//               Debate Arena
//             </motion.h1>
//             <motion.p
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-xs text-slate-400"
//             >
//               <Zap className="w-3 h-3 inline mr-1" />
//               Topic: <span className="text-slate-200 font-semibold">{debate.topic}</span>
//             </motion.p>
//           </div>

//           <div className="flex items-center gap-3">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={async () => {
//                 if (!debate) return
//                 await downloadDebateTranscriptPDF(
//                   debate.topic,
//                   debate.personaA,
//                   debate.personaB,
//                   debate.transcript,
//                   debate.createdAt,
//                   debate.summary,
//                 )
//               }}
//               className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 transition-all backdrop-blur-sm border border-slate-700/50"
//               title="Download Transcript"
//             >
//               <Download className="w-5 h-5 text-slate-300" />
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => router.push("/dashboard")}
//               className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 transition-all backdrop-blur-sm border border-slate-700/50"
//               title="Close"
//             >
//               <X className="w-5 h-5 text-slate-300" />
//             </motion.button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="pt-24 pb-32 relative z-10">
//         <div className="max-w-7xl mx-auto px-6">
//           {!debateStarted && openingAiMsg && (
//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col items-center justify-center mb-20 py-20"
//             >
//               <motion.div
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ delay: 0.2, type: "spring" }}
//                 className="mb-10"
//               >
//                 <motion.button
//                   whileHover={{ scale: 1.08, boxShadow: "0 0 60px rgba(59, 130, 246, 0.5)" }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={handleStartDebate}
//                   disabled={startingDebate}
//                   className="px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white font-bold text-xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ring-2 ring-blue-400/30 backdrop-blur-sm border border-blue-300/20"
//                 >
//                   {startingDebate ? (
//                     <>
//                       <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
//                       >
//                         <Loader2 className="w-6 h-6" />
//                       </motion.div>
//                       <span>Initializing...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Play className="w-6 h-6" />
//                       <span>Start Debate</span>
//                     </>
//                   )}
//                 </motion.button>
//               </motion.div>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="text-center space-y-2"
//               >
//                 <p className="text-sm text-slate-300 font-medium">⚡ Ready to debate the AI?</p>
//                 <p className="text-xs text-slate-400">Click to begin • AI will present opening argument</p>
//               </motion.div>
//             </motion.div>
//           )}

//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: debateStarted ? 1 : 0 }}
//             transition={{ duration: 0.5 }}
//             className="flex items-stretch justify-center gap-8 md:gap-12 mb-16"
//           >
//             {/* Human Side */}
//             <motion.div
//               initial={{ x: -50, opacity: 0 }}
//               animate={{ x: debateStarted ? 0 : -50, opacity: debateStarted ? 1 : 0 }}
//               transition={{ delay: 0.2 }}
//               className="flex flex-col items-center max-w-sm"
//             >
//               {/* Human Avatar */}
//               <motion.div
//                 animate={
//                   humanIsSpeaking
//                     ? {
//                         scale: [1, 1.1, 1],
//                         boxShadow: [
//                           "0 0 0 0 rgba(59,130,246,0)",
//                           "0 0 40px 10px rgba(59,130,246,0.4)",
//                           "0 0 0 0 rgba(59,130,246,0)",
//                         ],
//                       }
//                     : { opacity: [0.9, 1, 0.9] }
//                 }
//                 transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
//                 className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-2xl transition-all ring-4 ring-blue-500/20 backdrop-blur-sm border border-blue-400/30 mb-6"
//               >
//                 <User className="w-16 h-16" />
//               </motion.div>

//               <p className="text-lg font-bold text-blue-300 mb-6">You</p>

//               {/* Human Message Bubble */}
//               <motion.div
//                 layout
//                 initial={{ opacity: 0, y: 20, scale: 0.9 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 25 }}
//                 className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl min-h-[120px] border border-blue-500/30 ring-1 ring-blue-400/10"
//               >
//                 {humanIsSpeaking && currentHumanText ? (
//                   <p className="text-base text-slate-100 leading-relaxed font-medium">{currentHumanText}</p>
//                 ) : currentHumanMsg ? (
//                   <p className="text-base text-slate-100 leading-relaxed font-medium">{currentHumanMsg.message}</p>
//                 ) : (
//                   <p className="text-sm text-slate-500 italic">Your message will appear here...</p>
//                 )}
//               </motion.div>
//             </motion.div>

//             {/* Divider */}
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: debateStarted ? 1 : 0 }}
//               transition={{ delay: 0.3 }}
//               className="hidden md:flex flex-col items-center justify-center"
//             >
//               <div className="w-1 h-20 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
//                 className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 my-2"
//               />
//               <div className="w-1 h-20 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
//             </motion.div>

//             {/* AI Side */}
//             <motion.div
//               initial={{ x: 50, opacity: 0 }}
//               animate={{ x: debateStarted ? 0 : 50, opacity: debateStarted ? 1 : 0 }}
//               transition={{ delay: 0.2 }}
//               className="flex flex-col items-center max-w-sm"
//             >
//               {/* AI Avatar */}
//               <motion.div
//                 animate={
//                   aiIsSpeaking
//                     ? {
//                         scale: [1, 1.1, 1],
//                         boxShadow: [
//                           "0 0 0 0 rgba(6,182,212,0)",
//                           "0 0 40px 10px rgba(6,182,212,0.4)",
//                           "0 0 0 0 rgba(6,182,212,0)",
//                         ],
//                       }
//                     : { opacity: [0.9, 1, 0.9] }
//                 }
//                 transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
//                 className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-lg shadow-2xl transition-all ring-4 ring-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 mb-6"
//               >
//                 <Bot className="w-16 h-16" />
//               </motion.div>

//               <p className="text-lg font-bold text-cyan-300 mb-6">AI Debater</p>

//               {/* AI Message Bubble */}
//               <motion.div
//                 layout
//                 initial={{ opacity: 0, y: 20, scale: 0.9 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 25 }}
//                 className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl min-h-[120px] border border-cyan-500/30 ring-1 ring-cyan-400/10"
//               >
//                 {aiIsSpeaking ? (
//                   <div className="flex gap-2">
//                     <motion.div
//                       animate={{ y: [0, -8, 0] }}
//                       transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
//                       className="w-2 h-2 bg-cyan-400 rounded-full"
//                     />
//                     <motion.div
//                       animate={{ y: [0, -8, 0] }}
//                       transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.1 }}
//                       className="w-2 h-2 bg-cyan-400 rounded-full"
//                     />
//                     <motion.div
//                       animate={{ y: [0, -8, 0] }}
//                       transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
//                       className="w-2 h-2 bg-cyan-400 rounded-full"
//                     />
//                   </div>
//                 ) : currentAiMsg ? (
//                   <p className="text-base text-slate-100 leading-relaxed font-medium">{currentAiMsg.message}</p>
//                 ) : (
//                   <p className="text-sm text-slate-500 italic">Waiting for AI response...</p>
//                 )}
//               </motion.div>
//             </motion.div>
//           </motion.div>

//           {debateStarted && !debateEnded && (
//             <motion.div
//               initial={{ y: 40, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="flex flex-col md:flex-row items-center justify-center gap-4 pb-8 backdrop-blur-sm"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleVoiceToggle}
//                 disabled={sending || debateEnded}
//                 className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all border backdrop-blur-sm ring-2 ${
//                   isListening
//                     ? "bg-red-600/80 text-white border-red-500/50 ring-red-500/30 hover:bg-red-500/80"
//                     : "bg-blue-600/80 text-white border-blue-500/50 ring-blue-500/30 hover:bg-blue-500/80"
//                 } disabled:opacity-50 disabled:cursor-not-allowed`}
//               >
//                 {isListening ? (
//                   <>
//                     <MicOff className="w-5 h-5" />
//                     Stop Listening
//                   </>
//                 ) : (
//                   <>
//                     <Mic className="w-5 h-5" />
//                     Start Speaking
//                   </>
//                 )}
//               </motion.button>

//               {error && (
//                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
//                   ⚠️ {error}
//                 </motion.p>
//               )}

//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleStopDebate}
//                 disabled={endingDebate || debateEnded}
//                 className="px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all bg-slate-700/80 text-slate-100 border border-slate-600/50 ring-2 ring-slate-600/30 hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Square className="w-5 h-5" />
//                 End Debate
//               </motion.button>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
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

// Voice-to-Text Hook
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const accumulatedTextRef = useRef<string>("")
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
        pauseTimeoutRef.current = null
      }

      let interimTranscript = ""
      let newFinalText = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const snippet = event.results[i][0].transcript.trim()
        if (event.results[i].isFinal && snippet) {
          if (!accumulatedTextRef.current.includes(snippet)) {
            newFinalText += snippet + " "
          }
        } else if (!event.results[i].isFinal) {
          interimTranscript += snippet
        }
      }

      if (newFinalText) {
        accumulatedTextRef.current += newFinalText
      }

      const displayText = accumulatedTextRef.current + (interimTranscript || "")
      setTranscript(displayText)

      pauseTimeoutRef.current = setTimeout(() => {
        if (accumulatedTextRef.current) {
          setTranscript(accumulatedTextRef.current)
        }
      }, 3000)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      accumulatedTextRef.current = ""
      setTranscript("")
      setError(null)
      setIsListening(true)
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    accumulatedTextRef.current = ""
    setTranscript("")
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// --------------------------------------------
// NEW: Fast GPT-like streaming TTS implementation
// - speaks full text in a single utterance (smooth voice)
// - uses onboundary (if available) to update partial text with charIndex
// - falls back to a fast char-reveal while speech plays
// --------------------------------------------
function speakTextStream(text: string, onUpdate?: (partial: string) => void): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      // No TTS available — fallback to fast visual stream
      let idx = 0
      const inc = Math.max(2, Math.floor(text.length / 120)) // adapt speed based on text length
      const interval = setInterval(() => {
        idx = Math.min(text.length, idx + inc)
        if (onUpdate) onUpdate(text.slice(0, idx))
        if (idx >= text.length) {
          clearInterval(interval)
          resolve()
        }
      }, 25) // tight interval for fast flow
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0 // keep natural; tune slightly up if you want faster voice
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Prefer a reasonable "female-ish" voice if available; fallback to first
    const voices = synth.getVoices()
    const preferred =
      voices.find((v) => /female|amy|victoria|zira|susan|google uk english female/i.test(v.name)) ||
      voices.find((v) => v.name.includes("Google")) ||
      voices[0]
    if (preferred) {
      utterance.voice = preferred
    }

    let boundarySupported = false
    let lastReportedIndex = 0
    let fallbackInterval: number | null = null

    // onboundary yields charIndex of the boundary (word/phoneme)
    // This provides near exact sync between audio and text.
    (utterance as any).onboundary = (ev: any) => {
      // Some browsers deliver 'word' boundaries; some give other types
      if (ev && typeof ev.charIndex === "number") {
        boundarySupported = true
        // slice up to the charIndex + maybe a small margin
        const idx = Math.min(text.length, ev.charIndex + (ev.charLength || 0))
        lastReportedIndex = Math.max(lastReportedIndex, idx)
        if (onUpdate) onUpdate(text.slice(0, lastReportedIndex))
      }
    }

    // Fallback fast reveal while speaking if no onboundary events arrive
    const startFallbackReveal = () => {
      if (fallbackInterval != null) return
      let idx = 0
      const inc = Math.max(3, Math.floor(text.length / 100)) // adaptive increment
      fallbackInterval = window.setInterval(() => {
        idx = Math.min(text.length, idx + inc)
        lastReportedIndex = Math.max(lastReportedIndex, idx)
        if (onUpdate) onUpdate(text.slice(0, lastReportedIndex))
        // don't resolve here — resolution happens in onend
      }, 30)
    }

    utterance.onstart = () => {
      // start fallback reveal — if onboundary works it will override quickly
      startFallbackReveal()
    }

    utterance.onend = () => {
      // finalize
      if (fallbackInterval) {
        clearInterval(fallbackInterval)
        fallbackInterval = null
      }
      if (onUpdate) onUpdate(text)
      resolve()
    }

    utterance.onerror = (_e) => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval)
        fallbackInterval = null
      }
      if (onUpdate) onUpdate(text) // show full text on error
      resolve()
    }

    // Some browsers (Chrome) may return voices asynchronously. If voices are empty, wait for onvoiceschanged.
    if (!voices.length) {
      synth.onvoiceschanged = () => {
        const vs = synth.getVoices()
        const pref =
          vs.find((v) => /female|amy|victoria|zira|susan|google uk english female/i.test(v.name)) ||
          vs.find((v) => v.name.includes("Google")) ||
          vs[0]
        if (pref) utterance.voice = pref
        synth.speak(utterance)
      }
    } else {
      synth.speak(utterance)
    }
  })
}
// --------------------------------------------
// END TTS implementation
// --------------------------------------------

export default function DebateArenaPage() {
  const routeParams = useParams()
  const router = useRouter()
  const { user } = useAuth() // currently unused, but kept in case needed later

  const [searchId, setSearchId] = useState<string | null>(null)
  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [aiThinking, setAiThinking] = useState<boolean>(false)
  const [humanSpeaking, setHumanSpeaking] = useState<boolean>(false)
  const [currentHumanText, setCurrentHumanText] = useState<string>("")
  const [debateEnded, setDebateEnded] = useState<boolean>(false)
  const [endingDebate, setEndingDebate] = useState<boolean>(false)
  const [debateStarted, setDebateStarted] = useState<boolean>(false)
  const [startingDebate, setStartingDebate] = useState<boolean>(false)

  const [liveAiText, setLiveAiText] = useState<string>("")

  const { isListening, transcript, error, startListening, stopListening, resetTranscript } =
    useSpeechRecognition()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search)
      setSearchId(p.get("id"))
    }
  }, [])

  const debateId = searchId || (routeParams?.id as string | undefined)

  useEffect(() => {
    if (!debateId) {
      setLoading(false)
      return
    }

    let mounted = true
    async function loadDebate() {
      if (!debateId) return
      try {
        const data = await fetchDebateById(debateId)
        if (!mounted) return
        const transcript = data.transcript ?? []
        setDebate({
          ...data,
          transcript: transcript,
        })
        if (transcript.length > 0) {
          setDebateStarted(true)
        }
        setLoading(false)
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDebate()
    return () => {
      mounted = false
    }
  }, [debateId])

  useEffect(() => {
    if (transcript) {
      setCurrentHumanText(transcript)
      setHumanSpeaking(true)
    }
  }, [transcript])

  useEffect(() => {
    if (!isListening && currentHumanText.trim() && humanSpeaking && !sending) {
      const timer = setTimeout(() => {
        handleSendMessage(currentHumanText.trim())
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isListening, currentHumanText, humanSpeaking, sending])

  const handleSendMessage = async (messageText?: string) => {
    if (!debate || debateEnded || sending) return

    const humanMessage = messageText || currentHumanText.trim()
    if (!humanMessage) {
      setHumanSpeaking(false)
      setCurrentHumanText("")
      return
    }

    setSending(true)
    setAiThinking(true)
    setHumanSpeaking(false)
    const textToSend = humanMessage
    setCurrentHumanText("")
    resetTranscript()
    setLiveAiText("")

    const newHumanMessage: DebateMessage = {
      speaker: "You",
      message: humanMessage,
      phase: "discussion",
      timestamp: new Date().toLocaleTimeString(),
    }

    setDebate((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        transcript: [...(prev.transcript || []), newHumanMessage],
      }
    })

    try {
      const aiResponse = await sendHumanMessage(debate.id, textToSend)

      const newAiMessage: DebateMessage = {
        speaker: "AI Debater",
        message: aiResponse.message,
        phase: "discussion",
        timestamp: new Date().toLocaleTimeString(),
      }

      setDebate((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          transcript: [...(prev.transcript || []), newAiMessage],
        }
      })

      // Stream AI voice + text using the new fast streamer
      await speakTextStream(aiResponse.message, (partial) => {
        setLiveAiText(partial)
      })
    } catch (err: any) {
      console.error("Error sending message:", err)
      alert(err?.message || "Failed to send message. Please try again.")
    } finally {
      setSending(false)
      setAiThinking(false)
    }
  }

  const handleStopDebate = async () => {
    if (!debate || debateEnded || endingDebate) return

    if (!window.confirm("Are you sure you want to end this debate? The transcript will be saved.")) {
      return
    }

    setEndingDebate(true)
    setDebateEnded(true)
    stopListening()

    try {
      await endHumanDebate(debate.id)
      alert("Debate ended successfully! The transcript has been saved.")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Error ending debate:", err)
      alert(err?.message || "Failed to end debate. Please try again.")
      setEndingDebate(false)
      setDebateEnded(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
      setHumanSpeaking(true)
    }
  }

  const handleStartDebate = async () => {
    if (!debate || debateStarted || startingDebate) return

    setStartingDebate(true)
    setAiThinking(true)
    setLiveAiText("")

    try {
      const openingMessage =
        debate.transcript?.find((m) => m.speaker === "AI Debater" && m.phase === "opening") ??
        debate.transcript?.find((m) => m.speaker === "AI Debater")

      if (openingMessage) {
        setDebateStarted(true)
        await new Promise((resolve) => setTimeout(resolve, 400))

        await speakTextStream(openingMessage.message, (partial) => {
          setLiveAiText(partial)
        })
      } else {
        setDebateStarted(true)
      }
    } catch (err) {
      console.error("Error starting debate:", err)
      setDebateStarted(true)
    } finally {
      setStartingDebate(false)
      setAiThinking(false)
    }
  }

  const currentHumanMsg = debate?.transcript?.filter((m) => m.speaker === "You").slice(-1)[0]
  const currentAiMsg = debate?.transcript?.filter((m) => m.speaker === "AI Debater").slice(-1)[0]
  const openingAiMsg = debate?.transcript?.find(
    (m) => m.speaker === "AI Debater" && m.phase === "opening",
  )

  const humanIsSpeaking = humanSpeaking || isListening
  const aiIsSpeaking = aiThinking || (startingDebate && !debateStarted)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-300/40 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading debate arena...</p>
        </motion.div>
      </div>
    )
  }

  if (!debate) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-red-500 font-medium text-lg mb-6">Debate not found.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md"
          >
            Return to Dashboard
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100 overflow-hidden">
      {/* Subtle background grid / glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-2xl bg-gradient-to-b from-white/95 via-white/80 to-transparent border-b border-slate-200/70 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent"
            >
              Debate Arena
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-slate-500"
            >
              <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
              Topic: <span className="text-slate-800 font-semibold">{debate.topic}</span>
            </motion.p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (!debate) return
                await downloadDebateTranscriptPDF(
                  debate.topic,
                  debate.personaA,
                  debate.personaB,
                  debate.transcript,
                  debate.createdAt,
                  debate.summary,
                )
              }}
              className="p-2.5 rounded-lg bg-white shadow-sm hover:shadow-md transition-all border border-slate-200"
              title="Download Transcript"
            >
              <Download className="w-5 h-5 text-slate-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="p-2.5 rounded-lg bg-white shadow-sm hover:shadow-md transition-all border border-slate-200"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Start Debate CTA */}
          {!debateStarted && openingAiMsg && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center mb-20 py-16"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-6"
              >
                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: "0 20px 60px rgba(59, 130, 246, 0.35)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartDebate}
                  disabled={startingDebate}
                  className="px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 hover:from-blue-600 hover:via-sky-500 hover:to-cyan-500 text-white font-bold text-lg shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ring-2 ring-blue-300/40 border border-blue-200/60"
                >
                  {startingDebate ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Loader2 className="w-6 h-6" />
                      </motion.div>
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>Start Debate</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-center space-y-1"
              >
                <p className="text-sm text-slate-600 font-medium">⚡ Ready to challenge the AI?</p>
                <p className="text-xs text-slate-500">
                  Click to begin • The AI will present its opening argument.
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Avatars & Speech Bubbles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: debateStarted ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-stretch justify-center gap-8 md:gap-12 mb-16"
          >
            {/* Human Side */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: debateStarted ? 0 : -40, opacity: debateStarted ? 1 : 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center max-w-sm"
            >
              {/* Human Avatar */}
              <motion.div
                animate={
                  humanIsSpeaking
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(59,130,246,0)",
                          "0 0 30px 5px rgba(59,130,246,0.35)",
                          "0 0 0 0 rgba(59,130,246,0)",
                        ],
                      }
                    : { opacity: [0.9, 1, 0.9] }
                }
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg transition-all ring-4 ring-blue-200/70 border border-blue-300/80 mb-5"
              >
                <User className="w-14 h-14" />
              </motion.div>

              <p className="text-lg font-bold text-blue-700 mb-4">You</p>

              {/* Human Message Bubble */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="w-full bg-gradient-to-br from-white to-sky-50 backdrop-blur-xl rounded-2xl p-5 shadow-md min-h-[120px] border border-blue-100 ring-1 ring-blue-100/60"
              >
                {humanIsSpeaking && currentHumanText ? (
                  <p className="text-base text-slate-800 leading-relaxed font-medium">
                    {currentHumanText}
                  </p>
                ) : currentHumanMsg ? (
                  <p className="text-base text-slate-800 leading-relaxed font-medium">
                    {currentHumanMsg.message}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Your spoken message will appear here...
                  </p>
                )}
              </motion.div>
            </motion.div>

            {/* Middle Divider */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: debateStarted ? 1 : 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex flex-col items-center justify-center"
            >
              <div className="w-1 h-16 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 my-2 shadow-md"
              />
              <div className="w-1 h-16 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
            </motion.div>

            {/* AI Side */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: debateStarted ? 0 : 40, opacity: debateStarted ? 1 : 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center max-w-sm"
            >
              {/* AI Avatar */}
              <motion.div
                animate={
                  aiIsSpeaking
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(6,182,212,0)",
                          "0 0 30px 5px rgba(6,182,212,0.35)",
                          "0 0 0 0 rgba(6,182,212,0)",
                        ],
                      }
                    : { opacity: [0.9, 1, 0.9] }
                }
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg transition-all ring-4 ring-cyan-200/70 border border-cyan-300/80 mb-5"
              >
                <Bot className="w-14 h-14" />
              </motion.div>

              <p className="text-lg font-bold text-cyan-700 mb-4">AI Debater</p>

              {/* AI Message Bubble */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="w-full bg-gradient-to-br from-white to-cyan-50 backdrop-blur-xl rounded-2xl p-5 shadow-md min-h-[120px] border border-cyan-100 ring-1 ring-cyan-100/60"
              >
                {aiIsSpeaking && !liveAiText ? (
                  // Typing indicator (before streaming starts)
                  <div className="flex items-center gap-2 text-slate-500">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.1 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : aiIsSpeaking && liveAiText ? (
                  // Live streaming AI text (fast GPT-like)
                  <motion.p
                    key={liveAiText}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                    className="text-base text-slate-800 leading-relaxed font-medium whitespace-pre-wrap"
                  >
                    {liveAiText}
                  </motion.p>
                ) : currentAiMsg ? (
                  <p className="text-base text-slate-800 leading-relaxed font-medium">
                    {currentAiMsg.message}
                  </p>
                ) : openingAiMsg ? (
                  <p className="text-base text-slate-800 leading-relaxed font-medium">
                    {openingAiMsg.message}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Waiting for the AI&apos;s first response...
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Controls: Voice + End Debate */}
          {debateStarted && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 pb-8"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleVoiceToggle}
                disabled={sending || debateEnded}
                className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border shadow-sm ${
                  isListening
                    ? "bg-red-500 text-white border-red-500/80 hover:bg-red-600"
                    : "bg-blue-500 text-white border-blue-500/80 hover:bg-blue-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Speaking
                  </>
                )}
              </motion.button>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm max-w-xs text-center"
                >
                  ⚠️ {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStopDebate}
                disabled={endingDebate || debateEnded}
                className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-5 h-5" />
                {endingDebate ? "Ending Debate..." : "End Debate"}
              </motion.button>
            </motion.div>
          )}

          {/* Debate Ended Message */}
          {debateEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex justify-center"
            >
              <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-green-700">
                  ✓ Debate ended. Transcript saved successfully!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
