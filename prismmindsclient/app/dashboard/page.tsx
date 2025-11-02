// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { fetchRecentDebates, createDebate, deleteDebate } from "@/lib/api";
// import { useAuth } from "@/lib/auth-context";
// import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

// type DebateMessage = {
//   speaker: string;
//   message: string;
//   phase?: 'opening' | 'discussion' | 'closing';
//   timestamp?: string;
// };

// type Debate = {
//   id: string;
//   topic: string;
//   personaA: string;
//   personaB: string;
//   duration: string;
//   transcript?: DebateMessage[];
//   summary?: string;
//   createdAt: string;
//   debate_metrics?: {
//     total_duration: string;
//     exchanges_per_phase: {
//       opening: number;
//       discussion: number;
//       closing: number;
//     };
//     key_themes: string[];
//   };
// };

// export default function DashboardPage() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const [recentDebates, setRecentDebates] = useState<Debate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
//   const [form, setForm] = useState({
//     topic: "",
//     personaA: "",
//     personaB: "",
//     duration: "5",
//   });
//   const [creating, setCreating] = useState(false);
//   const [generating, setGenerating] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [typing, setTyping] = useState<{ speaker?: string } | null>(null);

//   const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

//   async function revealTranscript(fullTranscript: DebateMessage[] | undefined, durationMin: number | string) {
//     if (!fullTranscript || fullTranscript.length === 0) return;
//     const duration = typeof durationMin === "string" ? parseInt(durationMin || "5") : (durationMin || 5);

//     // Calculate reveal pace: 10s per minute, capped at 30s total reveal time
//     const perMinuteMs = 10000; // 10 seconds per minute of debate
//     const capMs = 30000; // cap to 30s for UX
//     const revealDurationMs = Math.min(duration * perMinuteMs, capMs);
//     const perMsgDelay = Math.max(200, Math.round(revealDurationMs / fullTranscript.length));

//     // start with empty transcript in UI
//     setSelectedDebate((prev) => (prev ? { ...prev, transcript: [] } : prev));
//     for (let i = 0; i < fullTranscript.length; i++) {
//       const msg = fullTranscript[i];
//       // Show typing indicator
//       setTyping({ speaker: msg.speaker });
//       setStatusMessage(`${msg.speaker} is composing...`);
//       // Simulate typing time (majority of perMsgDelay)
//       await sleep(Math.max(300, Math.round(perMsgDelay * 0.6)));

//       // Append message to transcript
//       setSelectedDebate((prev) => {
//         if (!prev) return prev;
//         const nextTranscript = [...(prev.transcript || []), msg];
//         return { ...prev, transcript: nextTranscript };
//       });

//       // Clear typing and small pause
//       setTyping(null);
//       setStatusMessage("");
//       await sleep(Math.max(100, Math.round(perMsgDelay * 0.4)));
//     }

//     // Done
//     setGenerating(false);
//     setTyping(null);
//     setStatusMessage("");
//   }

//   useEffect(() => {
//     if (user) {
//       fetchRecentDebates()
//         .then(setRecentDebates)
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [user]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setCreating(true);
//     setGenerating(true);
//     setStatusMessage("Preparing debate...");

//     try {
//       // Convert duration to number to match API expectations
//       const debateData = {
//         topic: form.topic,
//         personaA: form.personaA,
//         personaB: form.personaB,
//         duration: parseInt(form.duration),
//       };

//       console.log("Sending debate data:", debateData);
//       setStatusMessage("Generating debate with the AI — this may take a few seconds...");
//       const result = await createDebate(debateData);
//       console.log("Debate created:", result);

//       // Fetch the newly created debate from recent list (server stores transcript)
//       const updated = await fetchRecentDebates();
//       setRecentDebates(updated);

//       // Try to find the created debate by id. Fall back to newest.
//   const createdDebate = updated.find((d: Debate) => d.id === result.id) || updated[0];
//       if (!createdDebate) {
//         throw new Error("Couldn't retrieve the created debate from server");
//       }

//       // Set selected debate but clear transcript for reveal animation
//       setSelectedDebate({ ...createdDebate, transcript: [] });
//       setStatusMessage("Debate ready — starting live playback...");

//       // Reveal messages in real-time according to duration
//       await revealTranscript(createdDebate.transcript, debateData.duration);

//       // Reset form
//       setForm({ topic: "", personaA: "", personaB: "", duration: "5" });
//     } catch (err: any) {
//       console.error("Debate creation error:", err);
//       const errorMsg = err?.message || "Error creating debate";
//       alert(errorMsg);
//     } finally {
//       setCreating(false);
//       setGenerating(false);
//       setStatusMessage("");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
//       {/* Split Layout: Sidebar + Main Content */}
//       <div className="flex h-screen">
//         {/* Sidebar */}
//         <div className="w-80 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
//           <div className="sticky top-0 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-4 z-10">
//             <div className="flex justify-between items-center mb-4">
//               <h1 className="text-2xl font-bold">Welcome, {user?.displayName}</h1>
//               <button
//                 onClick={async () => {
//                   await logout();
//                   router.push('/login');
//                 }}
//                 className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
//                 title="Logout"
//               >
//                 <ArrowLeftOnRectangleIcon className="w-5 h-5" />
//               </button>
//             </div>
            
//             {/* New Debate Form */}
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <input
//                 type="text"
//                 placeholder="Debate Topic"
//                 value={form.topic}
//                 onChange={(e) => setForm({ ...form, topic: e.target.value })}
//                 className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
//                 required
//               />
//               <div className="grid grid-cols-2 gap-2">
//                 <input
//                   type="text"
//                   placeholder="Persona A"
//                   value={form.personaA}
//                   onChange={(e) => setForm({ ...form, personaA: e.target.value })}
//                   className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
//                   required
//                 />
//                 <input
//                   type="text"
//                   placeholder="Persona B"
//                   value={form.personaB}
//                   onChange={(e) => setForm({ ...form, personaB: e.target.value })}
//                   className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
//                   required
//                 />
//               </div>
//               <input
//                 type="number"
//                 placeholder="Duration (minutes)"
//                 value={form.duration}
//                 onChange={(e) => setForm({ ...form, duration: e.target.value })}
//                 className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
//                 required
//               />
//               <button
//                 type="submit"
//                 disabled={creating}
//                 className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
//               >
//                 {creating ? "Starting..." : "Start Debate"}
//               </button>
//             </form>
//           </div>

//           {/* Recent Debates List */}
//           <div className="mt-6 space-y-2">
//             <h2 className="text-lg font-semibold mb-3">Recent Debates</h2>
//             {loading ? (
//               <div className="text-center py-4">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//               </div>
//             ) : recentDebates.length === 0 ? (
//               <p className="text-center text-slate-500 dark:text-slate-400 py-4">No recent debates found.</p>
//             ) : (
//               <div className="space-y-2">
//                 {recentDebates.map((debate) => (
//                   <div key={debate.id} className="group relative">
//                     <motion.div
//                       onClick={() => setSelectedDebate(debate)}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
//                         selectedDebate?.id === debate.id
//                           ? "bg-indigo-600 text-white"
//                           : "bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/70"
//                       } backdrop-blur-sm border border-slate-200 dark:border-slate-700`}
//                     >
//                       <h3 className="font-medium truncate pr-8">{debate.topic}</h3>
//                       <p className={`text-sm mt-1 ${
//                         selectedDebate?.id === debate.id
//                           ? "text-indigo-200"
//                           : "text-slate-500 dark:text-slate-400"
//                       }`}>
//                         {debate.personaA} vs {debate.personaB}
//                       </p>
//                       <div className="flex justify-between items-center mt-1">
//                         <p className={`text-xs ${
//                           selectedDebate?.id === debate.id
//                             ? "text-indigo-200"
//                             : "text-slate-400 dark:text-slate-500"
//                         }`}>
//                           {new Date(debate.createdAt).toLocaleString()}
//                         </p>
//                         <span className={`text-xs font-medium ${
//                           selectedDebate?.id === debate.id
//                             ? "text-indigo-200"
//                             : "text-slate-500 dark:text-slate-400"
//                         }`}>
//                           {debate.duration}min
//                         </span>
//                       </div>
//                     </motion.div>
//                     <button
//                       onClick={async (e) => {
//                         e.stopPropagation();
//                         if (window.confirm('Are you sure you want to delete this debate?')) {
//                           try {
//                             await deleteDebate(debate.id);
//                             const updated = await fetchRecentDebates();
//                             setRecentDebates(updated);
//                             if (selectedDebate?.id === debate.id) {
//                               setSelectedDebate(null);
//                             }
//                           } catch (err) {
//                             console.error('Failed to delete debate:', err);
//                             alert('Failed to delete debate. Please try again.');
//                           }
//                         }
//                       }}
//                       className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
//                         hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
//                       title="Delete debate"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                       </svg>
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Main Content - Debate View */}
//         <div className="flex-1 p-4 overflow-y-auto">
//           {selectedDebate ? (
//             <div className="max-w-3xl mx-auto">
//               <div className="sticky top-0 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-4 mb-4 z-10">
//                 <h2 className="text-2xl font-bold">{selectedDebate.topic}</h2>
//                 <p className="text-sm text-slate-500 dark:text-slate-400">
//                   Between {selectedDebate.personaA} and {selectedDebate.personaB}
//                 </p>
//                 {generating && statusMessage && (
//                   <div className="mt-3 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
//                     {statusMessage}
//                   </div>
//                 )}
//               </div>

//               {/* Debate Transcript */}
//               <div className="space-y-4">
//                 {selectedDebate.transcript?.map((message, i, arr) => {
//                   // Show phase headers
//                   const showPhaseHeader = i === 0 || (message.phase !== arr[i - 1]?.phase);
                  
//                   return (
//                     <div key={i}>
//                       {showPhaseHeader && (
//                         <motion.div
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           className="flex items-center gap-3 my-6"
//                         >
//                           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                           <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
//                             {message.phase === 'opening' ? 'Opening Statements' :
//                              message.phase === 'discussion' ? 'Main Discussion' :
//                              'Closing Arguments'}
//                           </h3>
//                           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                         </motion.div>
//                       )}
                      

//                       {/* Typing indicator while next message is being revealed */}
//                       {typing && selectedDebate && (
//                         <motion.div
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           className={`flex ${typing.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
//                         >
//                           <div className={`max-w-[50%] p-2 rounded-lg ${typing.speaker === selectedDebate.personaA ? "bg-white dark:bg-slate-800" : "bg-indigo-600 text-white"} shadow-sm`}>
//                             <div className="flex items-center gap-2">
//                               <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse inline-block"></span>
//                               <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse inline-block delay-150"></span>
//                               <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse inline-block delay-300"></span>
//                               <span className="ml-2 text-xs text-slate-500">{statusMessage || `${typing.speaker} is typing...`}</span>
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}
//                       <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: i * 0.1 }}
//                         className={`flex ${
//                           message.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"
//                         }`}
//                       >
//                         <div
//                           className={`max-w-[80%] p-3 rounded-lg ${
//                             message.speaker === selectedDebate.personaA
//                               ? "bg-white dark:bg-slate-800 rounded-tl-none"
//                               : "bg-indigo-600 text-white rounded-tr-none"
//                           } shadow-sm`}
//                         >
//                           <div className="flex items-center justify-between mb-1">
//                             <p className="text-xs font-medium">{message.speaker}</p>
//                             {message.timestamp && (
//                               <span className={`text-xs ${
//                                 message.speaker === selectedDebate.personaA
//                                   ? "text-slate-400 dark:text-slate-500"
//                                   : "text-indigo-200"
//                               }`}>
//                                 {message.timestamp}
//                               </span>
//                             )}
//                           </div>
//                           <p className="text-sm">{message.message}</p>
//                         </div>
//                       </motion.div>
//                     </div>
//                   );
//                 })}

//                 {selectedDebate.summary && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="mt-8 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
//                   >
//                     <h3 className="text-lg font-semibold mb-2">Debate Summary</h3>
//                     <p className="text-sm text-slate-600 dark:text-slate-300">
//                       {selectedDebate.summary}
//                     </p>
//                   </motion.div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
//               <p>Select a debate from the sidebar to view the conversation</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { fetchRecentDebates, createDebate, deleteDebate } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"
import { SparklesIcon, Trash2Icon, X } from "lucide-react"

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

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [recentDebates, setRecentDebates] = useState<Debate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
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
  const [scrollPosition, setScrollPosition] = useState(0)

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

  async function revealTranscript(fullTranscript: DebateMessage[] | undefined, durationMin: number | string) {
    if (!fullTranscript || fullTranscript.length === 0) return
    const duration = typeof durationMin === "string" ? Number.parseInt(durationMin || "5") : durationMin || 5

    const perMinuteMs = 10000
    const capMs = 30000
    const revealDurationMs = Math.min(duration * perMinuteMs, capMs)
    const perMsgDelay = Math.max(200, Math.round(revealDurationMs / fullTranscript.length))

    setSelectedDebate((prev) => (prev ? { ...prev, transcript: [] } : prev))
    for (let i = 0; i < fullTranscript.length; i++) {
      const msg = fullTranscript[i]
      setTyping({ speaker: msg.speaker })
      setStatusMessage(`${msg.speaker} is composing...`)
      await sleep(Math.max(300, Math.round(perMsgDelay * 0.6)))

      setSelectedDebate((prev) => {
        if (!prev) return prev
        const nextTranscript = [...(prev.transcript || []), msg]
        return { ...prev, transcript: nextTranscript }
      })

      setTyping(null)
      setStatusMessage("")
      await sleep(Math.max(100, Math.round(perMsgDelay * 0.4)))
    }

    setGenerating(false)
    setTyping(null)
    setStatusMessage("")
  }

  useEffect(() => {
    if (user) {
      fetchRecentDebates()
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

    try {
      const debateData = {
        topic: form.topic,
        personaA: form.personaA,
        personaB: form.personaB,
        duration: Number.parseInt(form.duration),
      }

      setStatusMessage("Generating debate with the AI — this may take a few seconds...")
      const result = await createDebate(debateData)

      const updated = await fetchRecentDebates()
      setRecentDebates(updated)

      const createdDebate = updated.find((d: Debate) => d.id === result.id) || updated[0]
      if (!createdDebate) {
        throw new Error("Couldn't retrieve the created debate from server")
      }

      setSelectedDebate({ ...createdDebate, transcript: [] })
      setStatusMessage("Debate ready — starting live playback...")

      await revealTranscript(createdDebate.transcript, debateData.duration)

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest flex items-center gap-2 mb-1">
              <SparklesIcon className="w-3.5 h-3.5" />
              AI Debate Platform
            </p>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome, {user?.displayName}
            </h1>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await logout()
              router.push("/login")
            }}
            className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-slate-400 hover:text-red-600"
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Debate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/30 rounded-3xl border border-border/50 backdrop-blur-xl p-8 shadow-xl shadow-primary/5">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                ✨
              </span>
              Start a New Debate
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                type="text"
                placeholder="What would you like to debate about?"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground font-medium"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.input
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  type="text"
                  placeholder="First Persona"
                  value={form.personaA}
                  onChange={(e) => setForm({ ...form, personaA: e.target.value })}
                  className="px-5 py-3.5 rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
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
                  className="px-5 py-3.5 rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
                  required
                />
              </div>

              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                type="number"
                placeholder="Duration (minutes)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
                required
              />

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={creating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-size-200 hover:bg-pos-right text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white">
              📚
            </span>
            Recent Debates
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
              ))}
            </div>
          ) : recentDebates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/30"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <SparklesIcon className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground text-sm">No debates created yet. Start one to begin!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                      className="h-64 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-border/50 backdrop-blur-xl p-6 cursor-pointer transition-all shadow-lg hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between overflow-hidden relative"
                    >
                      {/* Background gradient accent */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary/20 to-accent/20 text-primary">
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
                              <Trash2Icon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          {debate.topic}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          <span className="font-semibold text-primary">{debate.personaA}</span>
                          <span className="mx-1">vs</span>
                          <span className="font-semibold text-accent">{debate.personaB}</span>
                        </p>
                      </div>

                      <div className="relative z-10 pt-4 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">{new Date(debate.createdAt).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Fullscreen Modal Viewer */}
      <AnimatePresence>
        {selectedDebate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDebate(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/95 dark:to-slate-900/90 border border-border/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-xl border-b border-border/30 p-6 flex justify-between items-start">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                    {selectedDebate.topic}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{selectedDebate.personaA}</span>
                    <span className="mx-2">vs</span>
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

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDebate(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-foreground/60" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border p-6">
                <div className="space-y-4">
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
                              className="flex items-center gap-4 my-8"
                            >
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                              <span className="text-xs font-bold text-primary/70 uppercase tracking-widest px-3 py-1.5 bg-primary/5 rounded-full border border-primary/20">
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
                                className={`max-w-sm p-4 rounded-2xl ${
                                  typing.speaker === selectedDebate.personaA
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

                          {/* Message Bubble */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-sm p-4 rounded-2xl shadow-lg ${
                                message.speaker === selectedDebate.personaA
                                  ? "bg-white dark:bg-slate-800 text-foreground rounded-tl-none"
                                  : "bg-gradient-to-br from-primary to-accent text-white rounded-tr-none"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2 pb-2 border-b border-current/10">
                                <p className="text-xs font-bold">{message.speaker}</p>
                                {message.timestamp && (
                                  <span
                                    className={`text-xs ${
                                      message.speaker === selectedDebate.personaA
                                        ? "text-muted-foreground"
                                        : "text-white/60"
                                    }`}
                                  >
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed">{message.message}</p>
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
                      className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/30 dark:border-accent/30"
                    >
                      <h3 className="text-sm font-bold mb-3 text-foreground">📊 Summary</h3>
                      <p className="text-sm leading-relaxed text-foreground/75">{selectedDebate.summary}</p>
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
