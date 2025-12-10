// "use client"

// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { useRouter } from "next/navigation"
// import { fetchRecentDebates, createDebate, deleteDebate } from "@/lib/api"
// import { useAuth } from "@/lib/auth-context"
// import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"
// import { SparklesIcon, Trash2Icon, X, History, Download, ScrollText, Sparkles, Rocket, BookOpen, Mic2, MessageCircle, Target, BarChart3 } from "lucide-react"
// import { downloadDebateTranscriptPDF } from "@/lib/pdf-generator"

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
//   duration: string
//   transcript?: DebateMessage[]
//   summary?: string
//   createdAt: string
//   debate_metrics?: {
//     total_duration: string
//     exchanges_per_phase: {
//       opening: number
//       discussion: number
//       closing: number
//     }
//     key_themes: string[]
//   }
// }

// const ITEMS_PER_PAGE = 12;

// export default function DashboardPage() {
//   const { user, logout } = useAuth()
//   const router = useRouter()
//   const [recentDebates, setRecentDebates] = useState<Debate[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
//   const [currentView, setCurrentView] = useState<"main" | "transcripts">("main")
//   const [searchQuery, setSearchQuery] = useState("")
//   const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
//   const [transcriptIndex, setTranscriptIndex] = useState(0)
//   const [scrollProgress, setScrollProgress] = useState(0)
//   const transcriptEndRef = useRef<HTMLDivElement>(null)
//   const modalContentRef = useRef<HTMLDivElement>(null)
//   const [debateMode, setDebateMode] = useState<"ai" | "human">("ai");

//   const [form, setForm] = useState({
//     topic: "",
//     personaA: "",
//     personaB: "",
//     duration: "01:00",
//   })
//   const [creating, setCreating] = useState(false)
//   const [generating, setGenerating] = useState(false)
//   const [statusMessage, setStatusMessage] = useState("")
//   const [typing, setTyping] = useState<{ speaker?: string } | null>(null)

//   const filteredDebates = recentDebates.filter(
//     (debate) =>
//       debate.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       debate.personaA.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       debate.personaB.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   // Pagination support to show more debates when scrolling
//   const displayedDebates = filteredDebates.slice(0, displayedCount)

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && displayedCount < filteredDebates.length) {
//           setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredDebates.length))
//         }
//       },
//       { threshold: 0.1 },
//     )

//     if (transcriptEndRef.current) {
//       observer.observe(transcriptEndRef.current)
//     }

//     return () => observer.disconnect()
//   }, [displayedCount, filteredDebates.length])

//   useEffect(() => {
//     setDisplayedCount(ITEMS_PER_PAGE)
//     // reset index when search changes so pager stays within bounds
//     setTranscriptIndex(0)
//   }, [searchQuery])

//   // Track scroll progress in the modal
//   useEffect(() => {
//     const handleScroll = () => {
//       if (modalContentRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current
//         const totalScroll = scrollHeight - clientHeight
//         const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0
//         setScrollProgress(progress)
//       }
//     }

//     const modalContent = modalContentRef.current
//     if (modalContent) {
//       modalContent.addEventListener("scroll", handleScroll)
//       return () => modalContent.removeEventListener("scroll", handleScroll)
//     }
//   }, [selectedDebate])

//   const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

//   async function revealTranscript(fullTranscript: DebateMessage[] | undefined, durationMin: number | string) {
//     if (!fullTranscript || fullTranscript.length === 0) return
//     const duration = typeof durationMin === "string" ? Number.parseInt(durationMin || "5") : durationMin || 5

//     // Calculate timings for a natural feel
//     const perMinuteMs = 10000
//     const capMs = 30000
//     const revealDurationMs = Math.min(duration * perMinuteMs, capMs)
//     const basePerMsgDelay = Math.max(200, Math.round(revealDurationMs / fullTranscript.length))
//     const avgCharactersPerMsg = fullTranscript.reduce((sum, msg) => sum + msg.message.length, 0) / fullTranscript.length
//     const msPerCharacter = Math.min(50, basePerMsgDelay / avgCharactersPerMsg) // Adjust typing speed

//     // Reset transcript
//     setSelectedDebate((prev) => (prev ? { ...prev, transcript: [] } : prev))

//     for (let i = 0; i < fullTranscript.length; i++) {
//       const msg = fullTranscript[i]

//       // Show typing indicator
//       setTyping({ speaker: msg.speaker })
//       setStatusMessage(`${msg.speaker} is composing...`)

//       // Small delay before typing starts
//       await sleep(300)

//       // Initialize message with empty content
//       setSelectedDebate((prev) => {
//         if (!prev) return prev
//         const nextTranscript = [
//           ...(prev.transcript || []),
//           { ...msg, message: '' } // Start with empty message
//         ]
//         return { ...prev, transcript: nextTranscript }
//       })

//       // Type out the message character by character
//       let currentText = ''
//       for (let charIndex = 0; charIndex < msg.message.length; charIndex++) {
//         currentText += msg.message[charIndex]

//         setSelectedDebate((prev) => {
//           if (!prev?.transcript) return prev
//           const nextTranscript = [...prev.transcript]
//           nextTranscript[nextTranscript.length - 1] = {
//             ...msg,
//             message: currentText
//           }
//           // Importantly, don't include summary yet
//           return { ...prev, transcript: nextTranscript, summary: undefined }
//         })

//         // Scroll to bottom smoothly
//         const modalContent = document.querySelector('.modal-content')
//         if (modalContent) {
//           modalContent.scrollTo({
//             top: modalContent.scrollHeight,
//             behavior: 'smooth'
//           })
//         }

//         // Vary typing speed slightly for natural feel
//         const variance = Math.random() * 30 - 15 // ±15ms
//         await sleep(msPerCharacter + variance)
//       }

//       // Small pause between messages
//       setTyping(null)
//       setStatusMessage("")
//       await sleep(Math.max(300, msg.message.length * 0.05)) // Longer pause for longer messages
//     }

//     // After all messages are done, show "Generating summary..." and reveal summary
//     const debateSummary = selectedDebate?.summary
//     if (debateSummary) {
//       setTyping(null)
//       setStatusMessage("Generating summary...")
//       await sleep(1000) // Pause for anticipation

//       setSelectedDebate((prev) => {
//         if (!prev) return prev
//         // Now reveal the summary that was previously hidden
//         return { ...prev, summary: debateSummary }
//       })

//       // Scroll to show summary
//       const modalContent = document.querySelector('.modal-content')
//       if (modalContent) {
//         modalContent.scrollTo({
//           top: modalContent.scrollHeight,
//           behavior: 'smooth'
//         })
//       }

//       await sleep(500) // Short pause after summary appears
//     }

//     setGenerating(false)
//     setTyping(null)
//     setStatusMessage("")
//   }

//   useEffect(() => {
//     if (user) {
//       // By default load only 2 items for the "Recent Debates" dashboard grid
//       fetchRecentDebates(2)
//         .then(setRecentDebates)
//         .catch(console.error)
//         .finally(() => setLoading(false))
//     }
//   }, [user])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setCreating(true)
//     setGenerating(true)
//     setStatusMessage("Preparing debate...")
//     // const [mm, ss] = form.duration.split(":").map(Number)
//     // const totalMinutes = mm + ss / 60

//     try {
//       const debateData = {
//         topic: form.topic,
//         personaA: form.personaA,
//         personaB: form.personaB,
//         // duration: totalMinutes,
//         duration: form.duration,
//       }

//       setStatusMessage("Generating debate with the AI — this may take a few seconds...")
//       const result = await createDebate(debateData)

//       const updated = await fetchRecentDebates()
//       setRecentDebates(updated)

//       const createdDebate = updated.find((d: Debate) => d.id === result.id) || updated[0]
//       if (!createdDebate) {
//         throw new Error("Couldn't retrieve the created debate from server")
//       }

//       // setSelectedDebate({ ...createdDebate, transcript: [] })
//       // setStatusMessage("Debate ready — starting live playback...")

//       // await revealTranscript(createdDebate.transcript, debateData.duration)
//       router.push(`dashboard/debatearea?id=${createdDebate.id}`)
//       setForm({ topic: "", personaA: "", personaB: "", duration: "5" })
//     } catch (err: any) {
//       console.error("Debate creation error:", err)
//       const errorMsg = err?.message || "Error creating debate"
//       alert(errorMsg)
//     } finally {
//       setCreating(false)
//       setGenerating(false)
//       setStatusMessage("")
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50 dark:from-background dark:via-background dark:to-slate-900/50">
//       {/* Header */}
//       <motion.header
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="sticky top-0 z-40 backdrop-blur-2xl border-b border-border/40 bg-white/40 dark:bg-slate-900/40"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full sm:w-auto">
//             <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest flex items-center gap-2 mb-1">
//               <SparklesIcon className="w-3.5 h-3.5" />
//               AI Debate Platform
//             </p>
//             <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
//               Welcome, {user?.displayName}
//             </h1>
//           </motion.div>
//           <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={async () => {
//                 // When opening the full transcripts view, fetch more debates
//                 try {
//                   setLoading(true)
//                   const all = await fetchRecentDebates(100)
//                   setRecentDebates(all)
//                 } catch (err) {
//                   console.error('Failed to load transcripts:', err)
//                 } finally {
//                   setLoading(false)
//                   setCurrentView("transcripts")
//                   setDisplayedCount(ITEMS_PER_PAGE)
//                   setSearchQuery("")
//                   setTranscriptIndex(0)
//                 }
//               }}
//               className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-border/50 transition-all text-xs sm:text-sm font-medium text-foreground"
//               title="View all transcripts"
//             >
//               <History className="w-4 h-4 flex-shrink-0" />
//               <span className="hidden sm:inline">Transcripts</span>
//             </motion.button>
//             {currentView === "transcripts" && (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={async () => {
//                   // Return to the main dashboard and load only the 2 most recent debates
//                   try {
//                     setLoading(true)
//                     const recent = await fetchRecentDebates(2)
//                     setRecentDebates(recent)
//                   } catch (err) {
//                     console.error('Failed to load recent debates:', err)
//                   } finally {
//                     setLoading(false)
//                     setCurrentView("main")
//                   }
//                 }}
//                 className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 border border-blue-200/50 dark:border-blue-800/50 transition-all text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400"
//               >
//                 ← Back
//               </motion.button>
//             )}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={async () => {
//                 await logout()
//                 router.push("/")
//               }}
//               className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-slate-400 hover:text-red-600"
//               title="Logout"
//             >
//               <ArrowLeftOnRectangleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
//             </motion.button>
//           </div>
//         </div>
//       </motion.header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
//         {currentView === "transcripts" && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="space-y-4 sm:space-y-6"
//           >
//             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
//               <div className="flex items-start gap-2 sm:gap-3 mb-2">
//                 <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
//                   <ScrollText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
//                 </span>
//                 <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
//                   All Transcripts
//                 </h2>
//               </div>
//               <p className="text-xs sm:text-sm text-muted-foreground px-12 sm:px-0">
//                 Showing <span className="font-bold text-foreground">{filteredDebates.length}</span> total debates
//               </p>
//             </motion.div>

//             {/* Search Bar */}
//             <motion.input
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               type="text"
//               placeholder="Search debates..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground font-medium"
//             />

//             {/* Transcripts Pagination */}
//             {filteredDebates.length === 0 ? (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-border/30"
//               >
//                 <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
//                   <History className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
//                 </div>
//                 <p className="text-xs sm:text-sm text-muted-foreground">
//                   {searchQuery ? "No debates match your search" : "No debates yet"}
//                 </p>
//               </motion.div>
//             ) : (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 sm:space-y-4">
//                 <motion.div
//                   className="flex items-center justify-between gap-4"
//                   layout
//                 >
//                   <motion.div
//                     className="text-sm text-muted-foreground"
//                     key={`page-${transcriptIndex}`}
//                     initial={{ opacity: 0, y: -5 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     Page <span className="mx-2 font-semibold text-foreground">{Math.floor(transcriptIndex / 5) + 1}</span> of <span className="mx-2 font-semibold text-foreground">{Math.ceil(filteredDebates.length / 5)}</span>
//                   </motion.div>
//                   <div className="flex items-center gap-2">
//                     <motion.button
//                       onClick={() => setTranscriptIndex((i) => Math.max(0, i - 5))}
//                       disabled={transcriptIndex === 0}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 hover:from-primary/30 hover:to-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
//                     >
//                       ← Prev
//                     </motion.button>
//                     <motion.button
//                       onClick={() => setTranscriptIndex((i) => Math.min(filteredDebates.length - 1, i + 5))}
//                       disabled={transcriptIndex + 5 >= filteredDebates.length}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 hover:from-primary/30 hover:to-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
//                     >
//                       Next →
//                     </motion.button>
//                   </div>
//                 </motion.div>

//                 {/* Transcript cards grid (up to 5 per page) */}
//                 <motion.div
//                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
//                   layout
//                   key={`grid-${transcriptIndex}`}
//                 >
//                   <AnimatePresence mode="popLayout">
//                     {filteredDebates.slice(transcriptIndex, transcriptIndex + 5).map((debate, idx) => (
//                       <motion.div
//                         key={debate.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.95, y: 20 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.95, y: -20 }}
//                         transition={{
//                           type: "spring",
//                           stiffness: 300,
//                           damping: 25,
//                           delay: idx * 0.08
//                         }}
//                         className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/60 dark:to-slate-900/60 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
//                         onClick={() => setSelectedDebate(debate)}
//                       >
//                         <div className="flex items-start justify-between gap-2 sm:gap-3">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="text-sm sm:text-base font-bold text-foreground transition-colors mb-1 line-clamp-2 group-hover:text-primary">
//                               {debate.topic}
//                             </h3>
//                             <p className="text-xs text-muted-foreground mb-2 break-words">
//                               <span className="font-semibold text-primary">{debate.personaA}</span>
//                               <span className="mx-1">vs</span>
//                               <span className="font-semibold text-accent">{debate.personaB}</span>
//                             </p>
//                             <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
//                               <span className="text-xs text-muted-foreground whitespace-nowrap">
//                                 📅 {new Date(debate.createdAt).toLocaleDateString()}
//                               </span>
//                               <span className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
//                                 ⏱️ {debate.duration}min
//                               </span>
//                             </div>
//                           </div>
//                           <motion.div
//                             whileHover={{ scale: 1.2, x: 5 }}
//                             className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
//                           >
//                             <ArrowLeftOnRectangleIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 rotate-180" />
//                           </motion.div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>
//                 </motion.div>
//               </motion.div>
//             )}
//           </motion.div>
//         )}

//         {currentView !== "transcripts" && (
//           <>
//             {/* Debate Mode Selector */}
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="w-full flex justify-center mb-8"
//             >
//               <div className="flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl 
//                 rounded-full border border-border/50 shadow-lg px-2 py-2 gap-2">

//                 {/* AI → AI */}
//                 <motion.button
//                   onClick={() => setDebateMode("ai")}
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
//       ${debateMode === "ai"
//                       ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
//                       : "text-muted-foreground hover:text-foreground"
//                     }`}
//                 >
//                   AI → AI Debate
//                 </motion.button>

//                 {/* Human → AI */}
//                 <motion.button
//                   onClick={() => setDebateMode("human")}
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
//       ${debateMode === "human"
//                       ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
//                       : "text-muted-foreground hover:text-foreground"
//                     }`}
//                 >
//                   Human → AI Debate
//                 </motion.button>

//               </div>
//             </motion.div>

//             <AnimatePresence mode="wait">
//               {debateMode === "ai" ? (
//                 <motion.div
//                   key="ai-mode"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {/* Create Debate Section */}
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.1 }}
//                     className="mb-8 sm:mb-12"
//                   >
//                     <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/30 rounded-2xl sm:rounded-3xl border border-border/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-primary/5">
//                       <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
//                         <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-base sm:text-lg flex-shrink-0">
//                           <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                         </span>
//                         Start a New Debate
//                       </h2>

//                       <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
//                         <motion.input
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.15 }}
//                           type="text"
//                           placeholder="What would you like to debate about?"
//                           value={form.topic}
//                           onChange={(e) => setForm({ ...form, topic: e.target.value })}
//                           className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground font-medium"
//                           required
//                         />

//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                           <motion.input
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.2 }}
//                             type="text"
//                             placeholder="First Persona"
//                             value={form.personaA}
//                             onChange={(e) => setForm({ ...form, personaA: e.target.value })}
//                             className="px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
//                             required
//                           />
//                           <motion.input
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.25 }}
//                             type="text"
//                             placeholder="Second Persona"
//                             value={form.personaB}
//                             onChange={(e) => setForm({ ...form, personaB: e.target.value })}
//                             className="px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
//                             required
//                           />
//                         </div>

//                         <motion.input
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.3 }}
//                           type="text"
//                           placeholder="Duration (MM:SS)"
//                           pattern="^([0-5]?[0-9]):([0-5][0-9])$"
//                           value={form.duration}
//                           onChange={(e) => {
//                             const value = e.target.value
//                             // Allow typing partial valid patterns like "0" or "01:"
//                             if (/^(\d{0,2}:?\d{0,2})$/.test(value)) {
//                               setForm({ ...form, duration: value })
//                             }
//                           }}
//                           className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
//                           required
//                         />
//                         <p className="text-xs text-muted-foreground mt-1">
//                           Example: <span className="font-semibold">01:00</span> = 1 minute, <span className="font-semibold">02:30</span> = 2.5 minutes
//                         </p>


//                         <motion.button
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.35 }}
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                           type="submit"
//                           disabled={creating}
//                           className="w-full py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 via-sky-500 to-primary bg-size-200 hover:bg-pos-right text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 text-sm sm:text-base"
//                         >
//                           {creating ? (
//                             <span className="flex items-center justify-center gap-2">
//                               <motion.div
//                                 animate={{ rotate: 360 }}
//                                 transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
//                                 className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
//                               />
//                               Creating...
//                             </span>
//                           ) : (
//                             <span className="flex items-center justify-center gap-2">
//                               <Rocket className="w-4 h-4" />
//                               Start Debate
//                             </span>
//                           )}
//                         </motion.button>
//                       </form>
//                     </div>
//                   </motion.div>

//                   {/* Debates Grid */}
//                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
//                     <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
//                       <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-base sm:text-lg flex-shrink-0">
//                         <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                       </span>
//                       Recent Debates
//                     </h2>

//                     {loading ? (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                         {[1, 2, 3, 4, 5, 6].map((i) => (
//                           <div
//                             key={i}
//                             className="h-48 sm:h-64 rounded-lg sm:rounded-2xl bg-gradient-to-br from-muted to-muted/50 animate-pulse"
//                           />
//                         ))}
//                       </div>
//                     ) : recentDebates.length === 0 ? (
//                       <motion.div
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-lg sm:rounded-2xl border-2 border-dashed border-border/30"
//                       >
//                         <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
//                           <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
//                         </div>
//                         <p className="text-xs sm:text-sm text-muted-foreground">
//                           No debates created yet. Start one to begin!
//                         </p>
//                       </motion.div>
//                     ) : (
//                       <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
//                       >
//                         <AnimatePresence>
//                           {recentDebates.map((debate, index) => (
//                             <motion.div
//                               key={debate.id}
//                               initial={{ opacity: 0, y: 20, scale: 0.95 }}
//                               animate={{ opacity: 1, y: 0, scale: 1 }}
//                               exit={{ opacity: 0, y: -20, scale: 0.95 }}
//                               transition={{ delay: index * 0.05 }}
//                               className="group relative"
//                             >
//                               <motion.div
//                                 onClick={() => setSelectedDebate(debate)}
//                                 whileHover={{ y: -8, scale: 1.02 }}
//                                 whileTap={{ scale: 0.98 }}
//                                 className="h-48 sm:h-64 rounded-lg sm:rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-border/50 backdrop-blur-xl p-4 sm:p-6 cursor-pointer transition-all shadow-lg hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between overflow-hidden relative"
//                               >
//                                 <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />

//                                 <div className="relative z-10">
//                                   <div className="flex items-start justify-between mb-2 sm:mb-3">
//                                     <span className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary/20 to-accent/20 text-primary whitespace-nowrap">
//                                       {debate.duration}min
//                                     </span>
//                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                       <motion.button
//                                         whileHover={{ scale: 1.1 }}
//                                         onClick={async (e) => {
//                                           e.stopPropagation()
//                                           if (window.confirm("Delete this debate?")) {
//                                             try {
//                                               await deleteDebate(debate.id)
//                                               const updated = await fetchRecentDebates()
//                                               setRecentDebates(updated)
//                                               if (selectedDebate?.id === debate.id) {
//                                                 setSelectedDebate(null)
//                                               }
//                                             } catch (err) {
//                                               console.error("Failed to delete debate:", err)
//                                               alert("Failed to delete debate.")
//                                             }
//                                           }
//                                         }}
//                                         className="p-2 rounded-lg bg-red-100/80 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-all"
//                                         title="Delete"
//                                       >
//                                         <Trash2Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
//                                       </motion.button>
//                                     </div>
//                                   </div>

//                                   <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
//                                     {debate.topic}
//                                   </h3>
//                                   <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
//                                     <span className="font-semibold text-primary">{debate.personaA}</span>
//                                     <span className="mx-1">vs</span>
//                                     <span className="font-semibold text-accent">{debate.personaB}</span>
//                                   </p>
//                                 </div>

//                                 <div className="relative z-10 pt-3 sm:pt-4 border-t border-border/30">
//                                   <p className="text-xs text-muted-foreground">
//                                     {new Date(debate.createdAt).toLocaleString()}
//                                   </p>
//                                 </div>
//                               </motion.div>
//                             </motion.div>
//                           ))}
//                         </AnimatePresence>
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="human-mode"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.3 }}
//                   className="mb-8 sm:mb-12"
//                 >
//                   {/* Human → AI Debate Placeholder */}
//                   <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/30 rounded-2xl sm:rounded-3xl border border-border/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-primary/5 min-h-[400px] flex items-center justify-center">
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: 0.2 }}
//                       className="text-center max-w-md"
//                     >
//                       <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
//                         <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
//                       </div>
//                       <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
//                         Human → AI Debate
//                       </h2>
//                       <p className="text-sm sm:text-base text-muted-foreground">
//                         Engage in a real-time debate with AI. This feature will be available soon.
//                       </p>
//                     </motion.div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </>
//         )}
//       </main>

//       {/* Fullscreen Debate Modal */}
//       <AnimatePresence>
//         {selectedDebate && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setSelectedDebate(null)}
//             className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               transition={{ type: "spring", damping: 25, stiffness: 300 }}
//               onClick={(e) => e.stopPropagation()}
//               className="w-full max-w-3xl max-h-[90vh] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/95 dark:to-slate-900/90 border border-border/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
//             >
//               {/* Modal Header */}
//               <div className="sticky top-0 z-10 bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-xl border-b border-border/30 p-4 sm:p-6 flex justify-between items-start">
//                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
//                   <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 break-words">
//                     {selectedDebate.topic}
//                   </h2>
//                   <div className="flex flex-wrap items-center gap-2 mb-3">
//                     <div className="flex items-center gap-2">
//                       <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 text-primary text-xs font-bold">P1</span>
//                       <span className="text-xs font-semibold text-primary">{selectedDebate.personaA}</span>
//                     </div>
//                     <span className="text-muted-foreground text-xs font-bold">vs</span>
//                     <div className="flex items-center gap-2">
//                       <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20 text-accent text-xs font-bold">P2</span>
//                       <span className="text-xs font-semibold text-accent">{selectedDebate.personaB}</span>
//                     </div>
//                   </div>

//                   {/* Debate Stats */}
//                   <div className="grid grid-cols-3 gap-2 mb-3">
//                     <div className="text-xs bg-primary/5 border border-primary/20 rounded-lg p-2">
//                       <div className="text-muted-foreground text-xs">Duration</div>
//                       <div className="font-bold text-primary">{selectedDebate.duration}m</div>
//                     </div>
//                     <div className="text-xs bg-accent/5 border border-accent/20 rounded-lg p-2">
//                       <div className="text-muted-foreground text-xs">Messages</div>
//                       <div className="font-bold text-accent">{selectedDebate.transcript?.length || 0}</div>
//                     </div>
//                     <div className="text-xs bg-secondary/5 border border-secondary/20 rounded-lg p-2">
//                       <div className="text-muted-foreground text-xs">Date</div>
//                       <div className="font-bold text-secondary text-[11px]">{new Date(selectedDebate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
//                     </div>
//                   </div>

//                   {/* Progress Bar */}
//                   {selectedDebate.transcript && selectedDebate.transcript.length > 0 && (
//                     <div className="w-full">
//                       <div className="text-xs text-muted-foreground mb-1">Scroll Progress: {Math.round(scrollProgress)}%</div>
//                       <div className="w-full h-2 bg-border rounded-full overflow-hidden">
//                         <motion.div
//                           className="h-full bg-gradient-to-r from-primary via-accent to-secondary"
//                           style={{ width: `${scrollProgress}%` }}
//                           transition={{ type: "tween", duration: 0.2 }}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {generating && statusMessage && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="mt-2 text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2"
//                     >
//                       <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
//                         className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full"
//                       />
//                       {statusMessage}
//                     </motion.div>
//                   )}
//                 </motion.div>

//                 <div className="flex items-center gap-2 flex-shrink-0">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={async (e) => {
//                       e.stopPropagation()
//                       if (!selectedDebate) return
//                       try {
//                         // Basic UX: show a small generating state
//                         setStatusMessage("Preparing PDF...")
//                         await downloadDebateTranscriptPDF(
//                           selectedDebate.topic,
//                           selectedDebate.personaA,
//                           selectedDebate.personaB,
//                           selectedDebate.transcript,
//                           selectedDebate.createdAt,
//                           selectedDebate.summary,
//                         )
//                       } catch (err) {
//                         console.error('Failed to download PDF', err)
//                         alert('Failed to generate PDF. Please try again.')
//                       } finally {
//                         setStatusMessage("")
//                       }
//                     }}
//                     className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
//                     title="Download transcript as PDF"
//                   >
//                     <Download className="w-4 sm:w-5 h-4 sm:h-5 text-foreground/70" />
//                   </motion.button>

//                   <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setSelectedDebate(null)}
//                     className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
//                   >
//                     <X className="w-4 sm:w-5 h-4 sm:h-5 text-foreground/60" />
//                   </motion.button>
//                 </div>
//               </div>

//               {/* Modal Content */}
//               <div ref={modalContentRef} className="modal-content flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border p-4 sm:p-6">
//                 <div className="space-y-3 sm:space-y-4">
//                   <AnimatePresence>
//                     {selectedDebate.transcript?.map((message, i, arr) => {
//                       const showPhaseHeader = i === 0 || message.phase !== arr[i - 1]?.phase

//                       return (
//                         <motion.div
//                           key={i}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0 }}
//                         >
//                           {showPhaseHeader && (
//                             <motion.div
//                               initial={{ opacity: 0, scale: 0.9 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               className="flex items-center gap-3 sm:gap-4 my-4 sm:my-8"
//                             >
//                               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
//                               <span className="text-xs font-bold text-primary/70 uppercase tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 bg-primary/5 rounded-full border border-primary/20 whitespace-nowrap flex items-center gap-1.5">
//                                 {message.phase === "opening" ? (
//                                   <>
//                                     <Mic2 className="w-3.5 h-3.5" />
//                                     Opening
//                                   </>
//                                 ) : message.phase === "discussion" ? (
//                                   <>
//                                     <MessageCircle className="w-3.5 h-3.5" />
//                                     Discussion
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Target className="w-3.5 h-3.5" />
//                                     Closing
//                                   </>
//                                 )}
//                               </span>
//                               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
//                             </motion.div>
//                           )}

//                           {/* Typing Indicator */}
//                           {typing && (
//                             <motion.div
//                               initial={{ opacity: 0, y: 10 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               className={`flex ${typing.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
//                             >
//                               <div
//                                 className={`max-w-sm p-4 rounded-2xl ${typing.speaker === selectedDebate.personaA
//                                   ? "bg-white dark:bg-slate-800 text-foreground"
//                                   : "bg-gradient-to-br from-primary to-accent text-white"
//                                   } shadow-lg`}
//                               >
//                                 <div className="flex items-center gap-2">
//                                   <span className="text-xs font-medium">{typing.speaker}</span>
//                                   <div className="flex gap-1">
//                                     {[0, 1, 2].map((j) => (
//                                       <motion.div
//                                         key={j}
//                                         animate={{ y: [0, -6, 0] }}
//                                         transition={{
//                                           delay: j * 0.15,
//                                           duration: 0.6,
//                                           repeat: Number.POSITIVE_INFINITY,
//                                         }}
//                                         className="w-2 h-2 bg-current rounded-full"
//                                       />
//                                     ))}
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )}

//                           <motion.div
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             className={`flex gap-3 ${message.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
//                           >
//                             {message.speaker === selectedDebate.personaA && (
//                               <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">P1</div>
//                             )}
//                             <div
//                               className={`max-w-xs sm:max-w-sm p-3 sm:p-4 rounded-lg sm:rounded-2xl ${message.speaker === selectedDebate.personaA
//                                 ? "bg-white dark:bg-slate-800 text-foreground rounded-tl-none border border-primary/20"
//                                 : "bg-gradient-to-br from-primary to-accent text-white rounded-tr-none shadow-lg"
//                                 }`}
//                             >
//                               <div className="flex items-center justify-between mb-1 sm:mb-2 pb-1 sm:pb-2 border-b border-current/10">
//                                 <p className="text-xs font-bold">{message.speaker}</p>
//                                 {message.timestamp && (
//                                   <span
//                                     className={`text-xs ml-2 ${message.speaker === selectedDebate.personaA
//                                       ? "text-muted-foreground"
//                                       : "text-white/60"
//                                       }`}
//                                   >
//                                     {message.timestamp}
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="text-xs sm:text-sm leading-relaxed">{message.message}</p>
//                             </div>
//                             {message.speaker === selectedDebate.personaB && (
//                               <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 font-bold text-xs">P2</div>
//                             )}
//                           </motion.div>
//                         </motion.div>
//                       )
//                     })}
//                   </AnimatePresence>

//                   {/* Summary */}
//                   {selectedDebate.summary && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="mt-8 p-4 sm:p-6 rounded-lg sm:rounded-2xl bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/5 border border-secondary/30 dark:border-accent/30 shadow-lg"
//                     >
//                       <div className="flex items-start gap-3 mb-3">
//                         <BarChart3 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
//                         <h3 className="text-sm sm:text-base font-bold text-foreground">Debate Summary</h3>
//                       </div>
//                       <p className="text-xs sm:text-sm leading-relaxed text-foreground/85 mb-4">{selectedDebate.summary}</p>

//                       {/* Key Takeaways */}
//                       {selectedDebate.debate_metrics?.key_themes && selectedDebate.debate_metrics.key_themes.length > 0 && (
//                         <div className="mt-4 pt-4 border-t border-secondary/20">
//                           <h4 className="text-xs font-bold text-secondary mb-3 uppercase tracking-widest">Key Themes</h4>
//                           <div className="flex flex-wrap gap-2">
//                             {selectedDebate.debate_metrics.key_themes.slice(0, 5).map((theme, i) => (
//                               <motion.div
//                                 key={i}
//                                 initial={{ opacity: 0, scale: 0.9 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 transition={{ delay: i * 0.1 }}
//                                 className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-xs font-medium text-secondary"
//                               >
//                                 <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
//                                 {theme}
//                               </motion.div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Phase Statistics */}
//                       {selectedDebate.debate_metrics?.exchanges_per_phase && (
//                         <div className="mt-4 pt-4 border-t border-secondary/20">
//                           <h4 className="text-xs font-bold text-secondary mb-3 uppercase tracking-widest">Exchanges by Phase</h4>
//                           <div className="grid grid-cols-3 gap-2">
//                             <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-primary/20">
//                               <div className="text-xs text-muted-foreground">Opening</div>
//                               <div className="text-base font-bold text-primary">{selectedDebate.debate_metrics.exchanges_per_phase.opening}</div>
//                             </div>
//                             <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-accent/20">
//                               <div className="text-xs text-muted-foreground">Discussion</div>
//                               <div className="text-base font-bold text-accent">{selectedDebate.debate_metrics.exchanges_per_phase.discussion}</div>
//                             </div>
//                             <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-secondary/20">
//                               <div className="text-xs text-muted-foreground">Closing</div>
//                               <div className="text-base font-bold text-secondary">{selectedDebate.debate_metrics.exchanges_per_phase.closing}</div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { fetchRecentDebates, createDebate, createHumanDebate, deleteDebate } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"
import { SparklesIcon, Trash2Icon, X, History, Download, ScrollText, Sparkles, Rocket, BookOpen, Mic2, MessageCircle, Target, BarChart3 } from "lucide-react"
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
  const [scrollProgress, setScrollProgress] = useState(0)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const [debateMode, setDebateMode] = useState<"ai" | "human">("ai");

  const [form, setForm] = useState({
    topic: "",
    personaA: "",
    personaB: "",
    duration: "01:00",
  })
  const [humanDebateTopic, setHumanDebateTopic] = useState("")
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

  // Track scroll progress in the modal
  useEffect(() => {
    const handleScroll = () => {
      if (modalContentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current
        const totalScroll = scrollHeight - clientHeight
        const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0
        setScrollProgress(progress)
      }
    }

    const modalContent = modalContentRef.current
    if (modalContent) {
      modalContent.addEventListener("scroll", handleScroll)
      return () => modalContent.removeEventListener("scroll", handleScroll)
    }
  }, [selectedDebate])

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

  const handleHumanDebateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!humanDebateTopic.trim()) {
      alert("Please enter a debate topic")
      return
    }

    setCreating(true)
    setGenerating(true)
    setStatusMessage("Preparing human-to-AI debate...")

    try {
      setStatusMessage("Generating debate content with AI — this may take a few seconds...")
      const result = await createHumanDebate(humanDebateTopic.trim())

      const updated = await fetchRecentDebates()
      setRecentDebates(updated)

      const createdDebate = updated.find((d: Debate) => d.id === result.id) || updated[0]
      if (!createdDebate) {
        throw new Error("Couldn't retrieve the created debate from server")
      }

      router.push(`dashboard/debatehumanarea?id=${createdDebate.id}`)
      setHumanDebateTopic("")
    } catch (err: any) {
      console.error("Human debate creation error:", err)
      const errorMsg = err?.message || "Error creating human debate"
      alert(errorMsg)
    } finally {
      setCreating(false)
      setGenerating(false)
      setStatusMessage("")
    }
  }

  const suggestions = [
    "Should AI replace human jobs?",
    "Is privacy more important than security?",
    "Does social media harm society?",
    "Should governments regulate AI?",
  ];



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
                  <ScrollText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
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
                <motion.div
                  className="flex items-center justify-between gap-4"
                  layout
                >
                  <motion.div
                    className="text-sm text-muted-foreground"
                    key={`page-${transcriptIndex}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Page <span className="mx-2 font-semibold text-foreground">{Math.floor(transcriptIndex / 5) + 1}</span> of <span className="mx-2 font-semibold text-foreground">{Math.ceil(filteredDebates.length / 5)}</span>
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setTranscriptIndex((i) => Math.max(0, i - 5))}
                      disabled={transcriptIndex === 0}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 hover:from-primary/30 hover:to-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                    >
                      ← Prev
                    </motion.button>
                    <motion.button
                      onClick={() => setTranscriptIndex((i) => Math.min(filteredDebates.length - 1, i + 5))}
                      disabled={transcriptIndex + 5 >= filteredDebates.length}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 hover:from-primary/30 hover:to-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                    >
                      Next →
                    </motion.button>
                  </div>
                </motion.div>

                {/* Transcript cards grid (up to 5 per page) */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                  layout
                  key={`grid-${transcriptIndex}`}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredDebates.slice(transcriptIndex, transcriptIndex + 5).map((debate, idx) => (
                      <motion.div
                        key={debate.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: idx * 0.08
                        }}
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
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentView !== "transcripts" && (
          <>
            {/* Debate Mode Selector */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex justify-center mb-8"
            >
              <div className="flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl 
                rounded-full border border-border/50 shadow-lg px-2 py-2 gap-2">

                {/* AI → AI */}
                <motion.button
                  onClick={() => setDebateMode("ai")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
      ${debateMode === "ai"
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  AI → AI Debate
                </motion.button>

                {/* Human → AI */}
                <motion.button
                  onClick={() => setDebateMode("human")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
      ${debateMode === "human"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Human → AI Debate
                </motion.button>

              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {debateMode === "ai" ? (
                <motion.div
                  key="ai-mode"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
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
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                            <span className="flex items-center justify-center gap-2">
                              <Rocket className="w-4 h-4" />
                              Start Debate
                            </span>
                          )}
                        </motion.button>
                      </form>
                    </div>
                  </motion.div>

                  {/* Debates Grid */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                </motion.div>
              ) : (
                <motion.div
                  key="human-mode"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 sm:mb-12"
                >
                  {/* Human → AI Debate Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-14"
                  >
                    <div
                      className="
      relative overflow-hidden
      rounded-3xl
      border border-white/15 dark:border-white/10
      bg-gradient-to-br from-white/50 to-white/10
      dark:from-slate-900/50 dark:to-slate-900/20
      backdrop-blur-2xl
      p-10 
      shadow-[0_6px_28px_-6px_rgba(0,0,0,0.12)]
      dark:shadow-[0_6px_32px_-4px_rgba(0,0,0,0.45)]
    "
                    >
                      {/* Soft floating top highlight */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 dark:from-white/[0.06] to-transparent" />

                      {/* Title */}
                      <h2 className="text-3xl font-semibold mb-8 flex items-center gap-4 tracking-tight">
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="
          w-12 h-12 rounded-xl 
          bg-gradient-to-br from-blue-500 to-cyan-500 
          flex items-center justify-center 
          shadow-lg shadow-blue-500/25
        "
                        >
                          <MessageCircle className="w-6 h-6 text-white" />
                        </motion.span>

                        Human → AI Debate
                      </h2>

                      {/* FORM */}
                      <form onSubmit={handleHumanDebateSubmit} className="space-y-6">

                        {/* INPUT — CLEAN + PREMIUM + NO HOVER */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter your debate topic..."
                            value={humanDebateTopic}
                            onChange={(e) => setHumanDebateTopic(e.target.value)}
                            required
                            className="
            w-full px-5 py-4 
            rounded-2xl
            bg-white/80 dark:bg-slate-800/40 
            border border-neutral-300/60 dark:border-neutral-700
            text-base
            placeholder:text-neutral-400
            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15
            transition-all
            shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]
          "
                          />

                          {/* Soft input glow when typing */}
                          <motion.div
                            animate={{
                              opacity: humanDebateTopic ? 1 : 0,
                              scale: humanDebateTopic ? 1 : 0.97,
                            }}
                            transition={{ duration: 0.35 }}
                            className="
            absolute inset-0 rounded-2xl 
            bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
            blur-xl pointer-events-none
          "
                          />
                        </div>

                        {/* CAPSULE SUGGESTIONS */}
                        <div className="flex flex-wrap gap-3">
                          {suggestions.map((topic, i) => (
                            <motion.button
                              type="button"
                              key={i}
                              onClick={() => setHumanDebateTopic(topic)}
                              whileHover={{ scale: 1.06, y: -2 }}
                              whileTap={{ scale: 0.94 }}
                              className="
              px-4 py-1.5 rounded-full text-sm
              bg-white/70 dark:bg-slate-800/50 
              border border-neutral-300/40 dark:border-neutral-700/50 
              backdrop-blur-xl
              shadow-sm hover:shadow-md
              hover:bg-white/90 dark:hover:bg-slate-700/50
              transition-all
              text-neutral-700 dark:text-neutral-300
              font-medium
              relative
            "
                            >
                              {/* Subtle glow on hover */}
                              <span className="
              absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
              bg-gradient-to-r from-blue-500/10 to-cyan-500/10
              blur-md transition-all
            " />
                              {topic}
                            </motion.button>
                          ))}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          type="submit"
                          disabled={creating}
                          className="
          w-full py-4 rounded-xl 
          bg-gradient-to-r from-blue-600 to-blue-500
          hover:from-blue-700 hover:to-blue-600
          text-white font-semibold tracking-tight
          shadow-[0_10px_26px_-6px_rgba(0,0,0,0.2)]
          hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.28)]
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          text-lg
        "
                        >
                          {creating ? (
                            <span className="flex items-center justify-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full"
                              />
                              Creating…
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-3">
                              <Rocket className="w-5 h-5" />
                              Start Debate
                            </span>
                          )}
                        </motion.button>
                      </form>
                    </div>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
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
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 break-words">
                    {selectedDebate.topic}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 text-primary text-xs font-bold">P1</span>
                      <span className="text-xs font-semibold text-primary">{selectedDebate.personaA}</span>
                    </div>
                    <span className="text-muted-foreground text-xs font-bold">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20 text-accent text-xs font-bold">P2</span>
                      <span className="text-xs font-semibold text-accent">{selectedDebate.personaB}</span>
                    </div>
                  </div>

                  {/* Debate Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-xs bg-primary/5 border border-primary/20 rounded-lg p-2">
                      <div className="text-muted-foreground text-xs">Duration</div>
                      <div className="font-bold text-primary">{selectedDebate.duration}m</div>
                    </div>
                    <div className="text-xs bg-accent/5 border border-accent/20 rounded-lg p-2">
                      <div className="text-muted-foreground text-xs">Messages</div>
                      <div className="font-bold text-accent">{selectedDebate.transcript?.length || 0}</div>
                    </div>
                    <div className="text-xs bg-secondary/5 border border-secondary/20 rounded-lg p-2">
                      <div className="text-muted-foreground text-xs">Date</div>
                      <div className="font-bold text-secondary text-[11px]">{new Date(selectedDebate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {selectedDebate.transcript && selectedDebate.transcript.length > 0 && (
                    <div className="w-full">
                      <div className="text-xs text-muted-foreground mb-1">Scroll Progress: {Math.round(scrollProgress)}%</div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary via-accent to-secondary"
                          style={{ width: `${scrollProgress}%` }}
                          transition={{ type: "tween", duration: 0.2 }}
                        />
                      </div>
                    </div>
                  )}

                  {generating && statusMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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

                <div className="flex items-center gap-2 flex-shrink-0">
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
              <div ref={modalContentRef} className="modal-content flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border p-4 sm:p-6">
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
                              <span className="text-xs font-bold text-primary/70 uppercase tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 bg-primary/5 rounded-full border border-primary/20 whitespace-nowrap flex items-center gap-1.5">
                                {message.phase === "opening" ? (
                                  <>
                                    <Mic2 className="w-3.5 h-3.5" />
                                    Opening
                                  </>
                                ) : message.phase === "discussion" ? (
                                  <>
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Discussion
                                  </>
                                ) : (
                                  <>
                                    <Target className="w-3.5 h-3.5" />
                                    Closing
                                  </>
                                )}
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
                            className={`flex gap-3 ${message.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
                          >
                            {message.speaker === selectedDebate.personaA && (
                              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">P1</div>
                            )}
                            <div
                              className={`max-w-xs sm:max-w-sm p-3 sm:p-4 rounded-lg sm:rounded-2xl ${message.speaker === selectedDebate.personaA
                                ? "bg-white dark:bg-slate-800 text-foreground rounded-tl-none border border-primary/20"
                                : "bg-gradient-to-br from-primary to-accent text-white rounded-tr-none shadow-lg"
                                }`}
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
                            {message.speaker === selectedDebate.personaB && (
                              <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 font-bold text-xs">P2</div>
                            )}
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
                      className="mt-8 p-4 sm:p-6 rounded-lg sm:rounded-2xl bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/5 border border-secondary/30 dark:border-accent/30 shadow-lg"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <BarChart3 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <h3 className="text-sm sm:text-base font-bold text-foreground">Debate Summary</h3>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-foreground/85 mb-4">{selectedDebate.summary}</p>

                      {/* Key Takeaways */}
                      {selectedDebate.debate_metrics?.key_themes && selectedDebate.debate_metrics.key_themes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-secondary/20">
                          <h4 className="text-xs font-bold text-secondary mb-3 uppercase tracking-widest">Key Themes</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDebate.debate_metrics.key_themes.slice(0, 5).map((theme, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-xs font-medium text-secondary"
                              >
                                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                                {theme}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Phase Statistics */}
                      {selectedDebate.debate_metrics?.exchanges_per_phase && (
                        <div className="mt-4 pt-4 border-t border-secondary/20">
                          <h4 className="text-xs font-bold text-secondary mb-3 uppercase tracking-widest">Exchanges by Phase</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-primary/20">
                              <div className="text-xs text-muted-foreground">Opening</div>
                              <div className="text-base font-bold text-primary">{selectedDebate.debate_metrics.exchanges_per_phase.opening}</div>
                            </div>
                            <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-accent/20">
                              <div className="text-xs text-muted-foreground">Discussion</div>
                              <div className="text-base font-bold text-accent">{selectedDebate.debate_metrics.exchanges_per_phase.discussion}</div>
                            </div>
                            <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-secondary/20">
                              <div className="text-xs text-muted-foreground">Closing</div>
                              <div className="text-base font-bold text-secondary">{selectedDebate.debate_metrics.exchanges_per_phase.closing}</div>
                            </div>
                          </div>
                        </div>
                      )}
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

