"use client"

import type React from "react"
import { useState, useEffect, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchRecentDebates, createDebate, createHumanDebate, deleteDebate, fetchFavorites, addFavorite, removeFavorite, fetchDailyChallenge } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"
import { SparklesIcon, Trash2Icon, X, History, Download, ScrollText, Sparkles, Rocket, BookOpen, Mic2, MessageCircle, Target, BarChart3, Globe, Heart, ArrowRight, Loader2, Menu, User, Clock, Zap, Flame } from "lucide-react"
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
  debateType?: string
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
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  // Notification system
  const [toast, setToast] = useState<{ type?: "error" | "success", message?: string } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); // auto dismiss
  };

  const { user, logout } = useAuth()
  const router = useRouter()
  const [recentDebates, setRecentDebates] = useState<Debate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
  const [currentView, setCurrentView] = useState<"main" | "transcripts" | "favorites">("main")
  const [searchQuery, setSearchQuery] = useState("")
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [transcriptIndex, setTranscriptIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const [debateMode, setDebateMode] = useState<"ai" | "human">("ai");
  const [favorites, setFavorites] = useState<Debate[]>([])
  const [showDailyModal, setShowDailyModal] = useState(false);

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
  const [greeting, setGreeting] = useState("Good Morning")


  useEffect(() => {
    const hour = new Date().getHours()
    const msg = hour < 12 ? "Good Morning" : hour < 16 ? "Good Afternoon" : "Good Evening"
    setGreeting(msg)
  }, [])

  const searchParams = useSearchParams()
  const initialTopic = searchParams.get("initialTopic")
  const challengerScore = searchParams.get("challengerScore")
  const challengerName = searchParams.get("challengerName")

  useEffect(() => {
    if (initialTopic) {
      setDebateMode("human")
      setHumanDebateTopic(initialTopic)
    }
  }, [initialTopic])


  // Debate of the Day Logic
  // Debate of the Day Logic
  const [dailyTopic, setDailyTopic] = useState<{ topic: string, date: string, participated?: boolean, score?: number } | null>(null);

  useEffect(() => {
    fetchDailyChallenge().then(setDailyTopic).catch(console.error);
  }, []);

  const handleDailyChallenge = async () => {
    if (!dailyTopic) return;
    setCreating(true);
    setGenerating(true);
    setStatusMessage("Preparing today's challenge...");

    try {
      const result = await createHumanDebate(dailyTopic.topic);
      router.push(`dashboard/debatehumanarea?id=${result.id}&mode=daily`);
    } catch (err: any) {
      console.error("Daily challenge error:", err);
      showToast("Failed to start daily challenge", "error");
    } finally {
      setCreating(false);
      setGenerating(false);
      setStatusMessage("");
    }
  };

  const filteredDebates = recentDebates.filter(

    (debate) =>
      debate.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debate.personaA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debate.personaB.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Split debates by type for the dashboard views
  const aiDebates = recentDebates.filter(d => d.debateType !== 'human-to-ai');
  const humanDebates = recentDebates.filter(d => d.debateType === 'human-to-ai');

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

  const toggleFavorite = async (debate: Debate) => {
    const isCurrentlyFavorite = favorites.some(f => f.id === debate.id)

    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(debate.id)
        setFavorites(prev => prev.filter(f => f.id !== debate.id))
        showToast('Favorite removed', 'success')
      } else {
        await addFavorite(debate.id)
        setFavorites(prev => [debate, ...prev])
        showToast('Favorite added', 'success')
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      showToast('Failed to update favorite', 'error')
    }
  }


  useEffect(() => {
    if (user) {
      // Load more items to ensure we have enough for both categories (displayed as 2 each)
      fetchRecentDebates(20)
        .then(setRecentDebates)
        .catch(console.error)
        .finally(() => setLoading(false))

      // Load user favorites from localStorage
      fetchFavorites()
        .then(favs => setFavorites(favs))
        .catch(console.error)
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
      showToast(errorMsg, "error");


    } finally {
      setCreating(false)
      setGenerating(false)
      setStatusMessage("")
    }
  }

  const handleHumanDebateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!humanDebateTopic.trim()) {
      showToast("Please enter a debate topic", "error");

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

      router.push(`dashboard/debatehumanarea?id=${createdDebate.id}&challengerScore=${challengerScore || ''}&challengerName=${encodeURIComponent(challengerName || '')}`)
      setHumanDebateTopic("")
    } catch (err: any) {
      console.error("Human debate creation error:", err)
      const errorMsg = err?.message || "Error creating human debate"
      showToast(errorMsg, "error");

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



  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-orange-50 text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500/20">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 shadow-sm supports-[backdrop-filter]:bg-white/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-20 flex items-center justify-between gap-4">
          {/* Left: Logo Section */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm shadow-orange-500/20 overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center p-1">
                  <img src="/mainlogo.png" alt="PrismMinds Logo" className="w-full h-full object-contain" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white tracking-tight">
                    PrismMinds
                  </h1>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center: Navigation Tabs (Desktop) */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 backdrop-blur-md shadow-inner">
              <button
                onClick={() => {
                  if (currentView === "main") return;
                  setLoading(true)
                  fetchRecentDebates(20).then(setRecentDebates).finally(() => {
                    setLoading(false)
                    setCurrentView("main")
                  })
                }}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${currentView === "main"
                  ? "text-orange-600 dark:text-orange-400 shadow-sm bg-white dark:bg-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </span>
                {currentView === "main" && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>

              <button
                onClick={async () => {
                  if (currentView === "transcripts") return;
                  setLoading(true)
                  try {
                    const all = await fetchRecentDebates(100)
                    setRecentDebates(all)
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setLoading(false)
                    setCurrentView("transcripts")
                    setDisplayedCount(ITEMS_PER_PAGE)
                    setSearchQuery("")
                    setTranscriptIndex(0)
                  }
                }}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${currentView === "transcripts"
                  ? "text-orange-600 dark:text-orange-400 shadow-sm bg-white dark:bg-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Transcripts
                </span>
                {currentView === "transcripts" && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>

              <button
                onClick={async () => {
                  if (currentView === "favorites") return;
                  setLoading(true)
                  try {
                    const favs = await fetchFavorites()
                    setFavorites(favs)
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setLoading(false)
                    setCurrentView("favorites")
                  }
                }}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${currentView === "favorites"
                  ? "text-orange-600 dark:text-orange-400 shadow-sm bg-white dark:bg-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites
                </span>
                {currentView === "favorites" && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-3">



            <div className="hidden md:flex items-center text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50" title="Daily Streak">
                <Flame className={`w-3.5 h-3.5 ${user?.streak && user.streak > 0 ? "fill-orange-500 text-orange-500" : "text-slate-400"}`} />
                <span className="font-bold tabular-nums">{user?.streak || 0}</span>
              </div>
              <span>{greeting}, {user?.displayName?.split(" ")[0]}</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative hidden md:block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative p-1 rounded-full border-2 border-white dark:border-slate-800 shadow-md ring-2 ring-slate-100 dark:ring-slate-800 cursor-pointer overflow-hidden transition-all hover:ring-orange-200 dark:hover:ring-orange-900/30"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.displayName?.[0] || "U"}
                  </div>
                )}
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800 overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                  >
                    <div className="p-2 space-y-1">
                      <div className="px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <motion.button
                        whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }} // indigo-500/10
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (user?.uid) {
                            router.push(`/dashboard/profile/${user.uid}`);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        Profile Settings
                      </motion.button>

                      <motion.button
                        whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }} // red-500/10
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await logout();
                          router.push("/");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-50 p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Navigation Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20, filter: "blur(10px)" }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  y: -10,
                  filter: "blur(5px)",
                  transition: { duration: 0.2 }
                }}
                className="absolute top-16 left-0 right-0 p-4 md:hidden z-30"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/20 ring-1 ring-black/5"
                >
                  <div className="space-y-2">
                    {/* User Header for Mobile */}
                    <div className="flex items-center gap-4 px-4 py-3 mb-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {user?.displayName?.[0] || "U"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (currentView === "main") return;
                        setLoading(true)
                        fetchRecentDebates(20).then(setRecentDebates).finally(() => {
                          setLoading(false)
                          setCurrentView("main")
                        })
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all ${currentView === 'main' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      Dashboard
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        setLoading(true)
                        const all = await fetchRecentDebates(100)
                        setRecentDebates(all)
                        setLoading(false)
                        setCurrentView("transcripts")
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all ${currentView === 'transcripts' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                      <History className="w-5 h-5" />
                      Transcripts
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        setLoading(true)
                        const favs = await fetchFavorites()
                        setFavorites(favs)
                        setLoading(false)
                        setCurrentView("favorites")
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all ${currentView === 'favorites' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                      <Heart className="w-5 h-5" />
                      Favorites
                    </motion.button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (user?.uid) {
                          router.push(`/dashboard/profile/${user.uid}`)
                        }
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 font-medium"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout()
                        router.push("/")
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-600 font-medium hover:bg-red-50"
                    >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header >

      {/* Main Content */}
      < main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" >
        {currentView === "transcripts" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start gap-2 sm:gap-3 mb-2">
                <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                  <ScrollText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent break-words">
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
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm placeholder:text-muted-foreground font-medium"
            />

            {/* Transcripts Pagination */}
            {filteredDebates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-border/30"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center">
                  <History className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500/50" />
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
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 hover:from-orange-500/30 hover:to-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
                    >
                      ← Prev
                    </motion.button>
                    <motion.button
                      onClick={() => setTranscriptIndex((i) => Math.min(filteredDebates.length - 1, i + 5))}
                      disabled={transcriptIndex + 5 >= filteredDebates.length}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 hover:from-orange-500/30 hover:to-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm"
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
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:shadow-lg hover:border-orange-500/30 transition-all cursor-pointer group"
                        onClick={() => setSelectedDebate(debate)}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-foreground transition-colors mb-1 line-clamp-2 group-hover:text-orange-600">
                              {debate.topic}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2 break-words">
                              <span className="font-semibold text-orange-600">{debate.personaA}</span>
                              <span className="mx-1">vs</span>
                              <span className="font-semibold text-amber-600">{debate.personaB}</span>
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                                📅 {new Date(debate.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                ⏱️ {debate.duration}min
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(debate)
                              }}
                              className={`p-2 rounded-lg transition-colors shadow-sm ${favorites.some(f => f.id === debate.id) ? 'bg-red-100 text-red-500 hover:bg-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              title={favorites.some(f => f.id === debate.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart className={`w-4 h-4 ${favorites.some(f => f.id === debate.id) ? 'fill-current' : ''}`} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (window.confirm("Delete this transcript?")) {
                                  try {
                                    await deleteDebate(debate.id)
                                    // Refresh logic
                                    const all = await fetchRecentDebates(100)
                                    setRecentDebates(all)
                                    setFavorites(prev => prev.filter(f => f.id !== debate.id))
                                  } catch (err) {
                                    console.error("Failed to delete", err)
                                    showToast("Failed to delete", "error")
                                  }
                                }
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors shadow-sm"
                              title="Delete Transcript"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </motion.button>

                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shadow-sm flex items-center justify-center"
                            >
                              <ArrowLeftOnRectangleIcon className="w-4 h-4 rotate-180" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )
        }

        {
          currentView === "favorites" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-red-500" />
                    Favorite Debates
                  </h2>
                  <p className="text-muted-foreground">Your bookmarked debates for quick access</p>
                </div>
              </motion.div>

              {favorites.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <Heart className="w-16 h-16 text-red-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground">Click the heart icon on any debate to add it to favorites</p>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {favorites.map((debate, idx) => (
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
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:shadow-lg hover:border-red-500/30 transition-all cursor-pointer group"
                        onClick={() => setSelectedDebate(debate)}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-foreground transition-colors mb-1 line-clamp-2 group-hover:text-orange-600">
                              {debate.topic}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2 break-words">
                              <span className="font-semibold text-orange-600">{debate.personaA}</span>
                              <span className="mx-1">vs</span>
                              <span className="font-semibold text-amber-600">{debate.personaB}</span>
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                                📅 {new Date(debate.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                ⏱️ {debate.duration}min
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(debate)
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors shadow-sm"
                              title="Remove from favorites"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (window.confirm("Delete this debate?")) {
                                  try {
                                    await deleteDebate(debate.id)
                                    setFavorites(prev => prev.filter(f => f.id !== debate.id))
                                    const all = await fetchRecentDebates(100)
                                    setRecentDebates(all)
                                  } catch (err) {
                                    console.error("Failed to delete", err)
                                    showToast("Failed to delete", "error")
                                  }
                                }
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors shadow-sm"
                              title="Delete Debate"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )
        }

        {
          currentView !== "transcripts" && currentView !== "favorites" && (

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
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
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
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-500">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
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
                            className="w-full py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-size-200 hover:bg-pos-right text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 text-sm sm:text-base"
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
                        <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
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
                      ) : aiDebates.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-lg sm:rounded-2xl border-2 border-dashed border-border/30"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500/50" />
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
                            {aiDebates.slice(0, 2).map((debate, index) => (
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
                                  whileHover={{ y: -4 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="h-48 sm:h-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(251,146,60,0.15)] dark:hover:shadow-orange-900/20 hover:border-orange-500/30 flex flex-col justify-between overflow-hidden relative group"
                                >
                                  {/* Subtle grain or gradient overlay could go here */}
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        {debate.duration}m
                                      </span>
                                      <div className="flex gap-1 opacity-100 transition-opacity">
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleFavorite(debate)
                                          }}
                                          className={`p-2 rounded-lg transition-all opacity-100 ${favorites.some(f => f.id === debate.id) ? 'bg-red-100/80 dark:bg-red-900/30 text-red-600 hover:bg-red-200' : 'bg-gray-100/80 dark:bg-gray-900/30 text-gray-600 hover:bg-gray-200'}`}
                                          title={favorites.some(f => f.id === debate.id) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                          <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${favorites.some(f => f.id === debate.id) ? 'fill-current' : ''}`} />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          onClick={async (e) => {
                                            e.stopPropagation()
                                            if (window.confirm("Delete this debate?")) {
                                              try {
                                                await deleteDebate(debate.id)
                                                const updated = await fetchRecentDebates()
                                                setRecentDebates(updated)
                                                setFavorites(prev => prev.filter(f => f.id !== debate.id))
                                                if (selectedDebate?.id === debate.id) {
                                                  setSelectedDebate(null)
                                                }
                                              } catch (err) {
                                                console.error("Failed to delete debate:", err)
                                                showToast("Failed to delete debate.", "error");

                                              }
                                            }
                                          }}
                                          className="p-2 rounded-lg bg-red-100/80 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-all opacity-100"
                                          title="Delete"
                                        >
                                          <Trash2Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        </motion.button>
                                      </div>
                                    </div>

                                    <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2 text-foreground group-hover:text-orange-600 transition-colors">
                                      {debate.topic}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                      <span className="font-semibold text-orange-600">{debate.personaA}</span>
                                      <span className="mx-1">vs</span>
                                      <span className="font-semibold text-amber-600">{debate.personaB}</span>
                                    </p>
                                  </div>

                                  <div className="relative z-10 pt-3 sm:pt-4 border-t border-border/30">
                                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
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
      border border-slate-200/60 dark:border-slate-800
      bg-white dark:bg-slate-900
      shadow-sm
      p-5 sm:p-8
    "
                      >
                        {/* Soft floating top highlight */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 dark:from-white/[0.06] to-transparent" />

                        {/* Title */}
                        <h2 className="text-xl sm:text-3xl font-semibold mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 tracking-tight">
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="
          w-10 h-10 sm:w-12 sm:h-12 rounded-xl 
          bg-gradient-to-br from-blue-500 to-cyan-500 
          flex items-center justify-center 
          shadow-lg shadow-blue-500/25
          flex-shrink-0
        "
                          >
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </motion.span>

                          Human → AI Debate
                        </h2>

                        {/* Daily Challenge - Moved Here */}
                        <button
                          onClick={() => {
                            if (dailyTopic?.participated) {
                              // If already participated, maybe show a toast or just let them see the score
                              // For now, let's allow them to click again if they really want, or maybe disable it?
                              // The requirements said "show the latest score", implies it's a display state.
                              // We can allow re-entry if they want to try again, but let's just update the visual.
                              setShowDailyModal(true)
                            } else {
                              setShowDailyModal(true)
                            }
                          }}
                          className={`absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all z-20 
                            ${dailyTopic?.participated
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            {dailyTopic?.participated
                              ? `Score: ${dailyTopic.score || 0}/100`
                              : "Daily Challenge"}
                          </span>
                          {!dailyTopic?.participated && dailyTopic && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          )}
                        </button>

                        {/* Info Note about Performance Audit */}
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mb-6 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-700/30 flex items-start gap-3"
                        >
                          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                              Post-Debate Performance Audit
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              After completing your debate, you'll receive a comprehensive performance analysis with insights on your argumentation, reasoning, and overall debate quality.
                            </p>
                          </div>
                        </motion.div>

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
            w-full px-4 py-3
            rounded-xl
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
                          <div className="flex flex-wrap gap-2 sm:gap-3">
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
          w-full py-3 rounded-xl 
          bg-gradient-to-r from-blue-600 to-blue-500
          hover:from-blue-700 hover:to-blue-600
          text-white font-semibold tracking-tight
          shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)]
          hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm sm:text-base
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

                    {/* Human Mode Recent Debates Grid */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
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
                      ) : humanDebates.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-lg sm:rounded-2xl border-2 border-dashed border-border/30"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            No human debates yet. Start one to begin!
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                        >
                          <AnimatePresence>
                            {humanDebates.slice(0, 2).map((debate, index) => (
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
                                  whileHover={{ y: -4 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="h-48 sm:h-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-indigo-900/20 hover:border-indigo-500/30 flex flex-col justify-between overflow-hidden relative group"
                                >
                                  {/* Subtle grain or gradient overlay could go here */}
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        {debate.duration}m
                                      </span>
                                      <div className="flex gap-1 opacity-100 transition-opacity">
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleFavorite(debate)
                                          }}
                                          className={`p-2 rounded-lg transition-all opacity-100 ${favorites.some(f => f.id === debate.id) ? 'bg-red-100/80 dark:bg-red-900/30 text-red-600 hover:bg-red-200' : 'bg-gray-100/80 dark:bg-gray-900/30 text-gray-600 hover:bg-gray-200'}`}
                                          title={favorites.some(f => f.id === debate.id) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                          <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${favorites.some(f => f.id === debate.id) ? 'fill-current' : ''}`} />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          onClick={async (e) => {
                                            e.stopPropagation()
                                            if (window.confirm("Delete this debate?")) {
                                              try {
                                                await deleteDebate(debate.id)
                                                const updated = await fetchRecentDebates()
                                                setRecentDebates(updated)
                                                setFavorites(prev => prev.filter(f => f.id !== debate.id))
                                                if (selectedDebate?.id === debate.id) {
                                                  setSelectedDebate(null)
                                                }
                                              } catch (err) {
                                                console.error("Failed to delete debate:", err)
                                                showToast("Failed to delete debate.", "error");

                                              }
                                            }
                                          }}
                                          className="p-2 rounded-lg bg-red-100/80 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-all opacity-100"
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
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">{debate.personaA}</span>
                                      <span className="mx-1 text-slate-400 font-medium">vs</span>
                                      <span className="font-semibold text-sky-600 dark:text-sky-400">{debate.personaB}</span>
                                    </p>
                                  </div>

                                  <div className="relative z-10 pt-3 sm:pt-4 border-t border-border/30">
                                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
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
                )}
              </AnimatePresence>
              {/* Toast Notification */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`
        fixed bottom-5 right-5 z-[9999]
        px-4 py-3 rounded-xl shadow-xl text-sm font-medium
        ${toast.type === "error"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                      }
      `}
                  >
                    {toast.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )
        }
      </main >



      {/* DAILY CHALLENGE MODAL */}
      <AnimatePresence>
        {showDailyModal && dailyTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDailyModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-600 to-violet-700" />
              <div className="absolute top-0 inset-x-0 h-32 opacity-20">
                <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_60%)] rotate-12" />
              </div>

              <div className="relative pt-8 px-6 pb-6">
                {/* Icon Badge */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-4 relative z-10">
                  <Target className="w-8 h-8 text-indigo-600" />
                </div>

                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Today's Official Topic
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                    {dailyTopic.topic}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500 font-medium">Format</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Human vs AI</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500 font-medium">Time Limit</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 5 Minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Difficulty</span>
                    <span className="font-bold text-emerald-600">Open/Standard</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDailyModal(false);
                    handleDailyChallenge();
                  }}
                  disabled={creating}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing Arena...
                    </>
                  ) : (
                    <>
                      Accept Challenge <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowDailyModal(false)}
                  className="w-full mt-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Debate Modal */}
      <AnimatePresence>
        {
          selectedDebate && (
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
                className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 p-4 sm:p-6 transition-all duration-300">
                  {/* LEFT CONTENT */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full"
                  >
                    <div className="pt-10 sm:pt-0 sm:pr-0"> {/* Space for absolute buttons on mobile */}
                      <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">
                        {selectedDebate.topic}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          <span className="text-[11px] sm:text-xs font-semibold text-orange-600 dark:text-orange-300 truncate max-w-[100px] sm:max-w-none">
                            {selectedDebate.personaA}
                          </span>
                        </div>

                        <span className="text-slate-300 dark:text-slate-600 text-[10px] font-medium">VS</span>

                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-teal-50/50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          <span className="text-[11px] sm:text-xs font-semibold text-teal-600 dark:text-teal-300 truncate max-w-[100px] sm:max-w-none">
                            {selectedDebate.personaB}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* STATS - Clear & Aligned */}
                    <div className="flex items-center gap-6 sm:gap-8 mb-4 sm:mb-6 pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Duration</span>
                        <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">{selectedDebate.duration}m</span>
                      </div>
                      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Exchanges</span>
                        <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">{selectedDebate.transcript?.length || 0}</span>
                      </div>
                      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Date</span>
                        <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                          {new Date(selectedDebate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS - Detailed & Slim */}
                    {selectedDebate.transcript && selectedDebate.transcript.length > 0 && (
                      <div className="w-full mt-3 group">
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity"
                            style={{ width: `${scrollProgress}%` }}
                            transition={{ type: "tween", duration: 0.2 }}
                          />
                        </div>
                      </div>
                    )}

                    {generating && statusMessage && (
                      <motion.div className="mt-2 text-[10px] font-medium text-orange-600 flex items-center gap-2 bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded-md w-fit">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {statusMessage}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* ACTION BUTTONS (FLOATING) */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3">
                    {/* Analytics Button - Green Palette */}
                    {(selectedDebate.debateType === "human-to-ai" || selectedDebate.personaA === "You") && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/debatehumanarea/analysis/${selectedDebate.id}`)
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 transition-all shadow-sm"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline text-sm font-semibold">View Analytics</span>
                      </motion.button>
                    )}

                    {/* Download Button - Larger Size */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!selectedDebate) return
                        try {
                          setStatusMessage("Generating PDF...")
                          await downloadDebateTranscriptPDF(selectedDebate.topic, selectedDebate.personaA, selectedDebate.personaB, selectedDebate.transcript, selectedDebate.createdAt, selectedDebate.summary);
                        } catch (err) { showToast("Download failed", "error"); }
                        finally { setStatusMessage(""); }
                      }}
                      className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4 sm:w-4 sm:h-4" />
                    </motion.button>

                    {/* Close Button - Green Palette */}
                    <motion.button
                      whileHover={{ scale: 1.05, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDebate(null)}
                      className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-red-50 dark:hover:bg-red-900/20 text-emerald-600 dark:text-emerald-400 hover:text-red-600 dark:hover:text-red-400 border border-emerald-200 dark:border-emerald-500/20 hover:border-red-200 dark:hover:border-red-500/20 transition-all shadow-sm"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                <span className="text-xs font-bold text-purple-600/70 uppercase tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-500/5 rounded-full border border-purple-500/20 whitespace-nowrap flex items-center gap-1.5">
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



                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex gap-3 ${message.speaker === selectedDebate.personaA ? "justify-start" : "justify-end"}`}
                            >
                              {message.speaker === selectedDebate.personaA && (
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">P1</div>
                              )}
                              <div
                                className={`max-w-xs sm:max-w-sm p-3 sm:p-4 rounded-lg sm:rounded-2xl ${message.speaker === selectedDebate.personaA
                                  ? "bg-white dark:bg-slate-800 text-foreground rounded-tl-none border border-orange-500/20"
                                  : "bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-none shadow-lg"
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
                                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">P2</div>
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
                        className="mt-8 p-4 sm:p-6 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/5 border border-blue-500/30 dark:border-purple-500/30 shadow-lg"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <h3 className="text-sm sm:text-base font-bold text-foreground">Debate Summary</h3>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-foreground/85 mb-4">{selectedDebate.summary}</p>

                        {/* Key Takeaways */}
                        {selectedDebate.debate_metrics?.key_themes && selectedDebate.debate_metrics.key_themes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-orange-500/20">
                            <h4 className="text-xs font-bold text-orange-600 mb-3 uppercase tracking-widest">Key Themes</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedDebate.debate_metrics.key_themes.slice(0, 5).map((theme, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-medium text-orange-600"
                                >
                                  <span className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                                  {theme}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Phase Statistics */}
                        {selectedDebate.debate_metrics?.exchanges_per_phase && (
                          <div className="mt-4 pt-4 border-t border-orange-500/20">
                            <h4 className="text-xs font-bold text-orange-600 mb-3 uppercase tracking-widest">Exchanges by Phase</h4>
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
            </motion.div >
          )
        }
      </AnimatePresence >
    </div >
  )
}