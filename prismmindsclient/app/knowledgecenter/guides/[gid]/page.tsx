"use client"

import { use, useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ListBulletIcon,
    CheckCircleIcon,
    ShareIcon,
    BookmarkIcon,
    SparklesIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ChevronUpIcon,
    HandThumbUpIcon,
    HandThumbDownIcon
} from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkIconSolid, HandThumbUpIcon as HandThumbUpSolid } from "@heroicons/react/24/solid"
import ReactMarkdown from "react-markdown"
import { guidesData } from "@/lib/guides-data"

export default function GuideDetailPage({
    params,
}: {
    params: Promise<{ gid: string }>
}) {
    const { gid } = use(params)
    const guide = useMemo(() => guidesData.find(g => g.slug === gid), [gid])

    // If guide not found, return 404
    if (!guide) {
        return notFound()
    }

    const [activeSection, setActiveSection] = useState(guide.sections[0].id)
    const [readingProgress, setReadingProgress] = useState(0)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [notes, setNotes] = useState("")
    const [showShareTooltip, setShowShareTooltip] = useState(false)

    // New Premium States
    const [isFocusMode, setIsFocusMode] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null)

    // AI & Mobile State
    const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false)

    // Refs for independent scrolling
    const mainContentRef = useRef<HTMLDivElement>(null)

    // Load persisted data
    useEffect(() => {
        const savedBookmark = localStorage.getItem(`guide_bookmark_${gid}`)
        if (savedBookmark) setIsBookmarked(JSON.parse(savedBookmark))

        const savedNotes = localStorage.getItem(`guide_notes_${gid}`)
        if (savedNotes) setNotes(savedNotes)

        const savedFeedback = localStorage.getItem(`guide_feedback_${gid}`)
        if (savedFeedback) setFeedbackGiven(savedFeedback as "up" | "down")
    }, [gid])

    const handleBookmark = () => {
        const newState = !isBookmarked
        setIsBookmarked(newState)
        localStorage.setItem(`guide_bookmark_${gid}`, JSON.stringify(newState))
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        setShowShareTooltip(true)
        setTimeout(() => setShowShareTooltip(false), 2000)
    }

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value
        setNotes(newNotes)
        localStorage.setItem(`guide_notes_${gid}`, newNotes)
    }

    const handleFeedback = (type: "up" | "down") => {
        if (feedbackGiven) return
        setFeedbackGiven(type)
        localStorage.setItem(`guide_feedback_${gid}`, type)
        if (type === "up") {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#6366f1', '#8b5cf6', '#ec4899']
            })
        }
    }

    // Scroll listener for reading progress & scroll-to-top visibility
    useEffect(() => {
        const scrollContainer = mainContentRef.current
        if (!scrollContainer) return

        const updateProgress = () => {
            const totalHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
            const progress = (scrollContainer.scrollTop / totalHeight) * 100
            setReadingProgress(Math.min(100, Math.max(0, progress)))
            setShowScrollTop(scrollContainer.scrollTop > 400)
        }

        scrollContainer.addEventListener("scroll", updateProgress)
        return () => scrollContainer.removeEventListener("scroll", updateProgress)
    }, [])

    const scrollToTop = () => {
        mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Scroll spy for active section
    useEffect(() => {
        const scrollContainer = mainContentRef.current

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            {
                root: scrollContainer, // Observe inside the scroll container
                rootMargin: "-20% 0px -50% 0px",
                threshold: 0.1
            }
        )

        guide.sections.forEach((section) => {
            const element = document.getElementById(section.id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [guide.sections])

    // Confetti on Finish
    const handleNextOrFinish = (isFinish: boolean) => {
        if (isFinish) {
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#6366f1', '#8b5cf6', '#ec4899']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#6366f1', '#8b5cf6', '#ec4899']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    const currentIndex = guidesData.findIndex(g => g.slug === gid)
    const prevGuide = guidesData[currentIndex - 1]
    const nextGuide = guidesData[currentIndex + 1]

    return (
        <main className="h-screen bg-white dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 overflow-hidden">

            {/* Reading Progress Bar (Top) */}
            <div className="fixed top-0 left-0 w-full h-1 z-50 bg-slate-100 dark:bg-slate-900/50">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Mobile Tools Drawer (Sheet) */}
            <AnimatePresence>
                {isMobileToolsOpen && (
                    <div className="fixed inset-0 z-[60] xl:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsMobileToolsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                    Tools
                                </h3>
                                <button onClick={() => setIsMobileToolsOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <ArrowRightIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Mobile Quick Notes */}
                            <div className="flex-1 flex flex-col">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Quick Notes
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={handleNoteChange}
                                    placeholder="Jot down your key takeaways here..."
                                    className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-200 dark:border-slate-800"
                                    spellCheck={false}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mobile Tools FAB (Bottom Right) */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileToolsOpen(true)}
                className="fixed bottom-6 right-6 z-40 xl:hidden p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 active:scale-90 transition-transform"
                aria-label="Open Tools"
            >
                <SparklesIcon className="w-6 h-6" />
            </motion.button>

            {/* Scroll To Top FAB */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-24 xl:right-10 z-40 p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 group"
                    >
                        {/* Circular Progress SVG */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 transform p-0.5 pointer-events-none" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100 dark:text-slate-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-indigo-500 transition-all duration-100"
                                strokeDasharray={`${readingProgress}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                        </svg>
                        <ChevronUpIcon className="w-5 h-5 relative z-10" />
                    </motion.button>
                )}
            </AnimatePresence>


            {/* Navigation Header - Static within Flex Column */}
            <header className="z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex-none h-16">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/knowledgecenter/guides"
                            className="group p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
                            aria-label="Back to Guides"
                        >
                            <ArrowLeftIcon className="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </Link>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px] sm:max-w-md"
                        >
                            {guide.title}
                        </motion.h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Focus Mode Toggle (Desktop) */}
                        <div className="hidden xl:block">
                            <button
                                onClick={() => setIsFocusMode(!isFocusMode)}
                                className={`
                                    p-2 rounded-full transition-all duration-300
                                    ${isFocusMode
                                        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"}
                                `}
                                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                            >
                                {isFocusMode ? (
                                    <ArrowsPointingInIcon className="w-5 h-5" />
                                ) : (
                                    <ArrowsPointingOutIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleBookmark}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition duration-200"
                                title="Bookmark this guide"
                            >
                                {isBookmarked ? (
                                    <motion.div whileTap={{ scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                                        <BookmarkIconSolid className="w-5 h-5 text-indigo-600" />
                                    </motion.div>
                                ) : (
                                    <BookmarkIcon className="w-5 h-5" />
                                )}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition"
                                    title="Share guide"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                                <AnimatePresence>
                                    {showShareTooltip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50"
                                        >
                                            Link copied!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Flex Wrapper - Fixed height via h-screen on parent */}
            <div className="flex-1 max-w-screen-2xl mx-auto w-full flex items-start relative overflow-hidden">

                {/* Background Ambient Mesh */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] -z-10 opacity-30 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 blur-[100px] rounded-full" />
                </div>

                {/* Left Sidebar - Course Navigation */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: isFocusMode ? 0 : 288,
                        opacity: isFocusMode ? 0 : 1,
                        x: isFocusMode ? -20 : 0
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="hidden xl:block h-full overflow-y-auto border-r border-slate-100 dark:border-slate-800/60 p-6 lg:pl-8 scrollbar-hide flex-none"
                >
                    <div className="min-w-[240px]"> {/* Prevent content reflow during width animation */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ListBulletIcon className="w-4 h-4" />
                                On This Page
                            </h3>
                            <nav className="relative space-y-2">
                                {/* Vertical track line */}
                                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-slate-800 rounded-full" />

                                {guide.sections.map((section, idx) => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(section.id)
                                            document.getElementById(section.id)?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            })
                                        }}
                                        className={`
                                            group relative w-full text-left pl-8 py-1.5 text-sm transition-all duration-300 block
                                            ${activeSection === section.id
                                                ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            }
                                        `}
                                    >
                                        {/* Animated Active Indicator */}
                                        {activeSection === section.id && (
                                            <motion.div
                                                layoutId="activeSectionIndicator"
                                                className="absolute left-[7px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {/* Inactive Dot */}
                                        {activeSection !== section.id && (
                                            <div className="absolute left-[9px] top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 rounded-full" />
                                        )}
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3 font-bold uppercase tracking-widest">
                                Coming Up Next
                            </p>
                            {nextGuide ? (
                                <Link href={`/knowledgecenter/guides/${nextGuide.slug}`} className="block group">
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5 leading-snug">
                                        {nextGuide.title}
                                    </div>
                                    <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {nextGuide.description}
                                    </div>
                                </Link>
                            ) : (
                                <div className="text-sm font-medium text-green-600 dark:text-green-500 flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" /> Guides Complete!
                                </div>
                            )}
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content Area - INDEPENDENT SCROLL */}
                <motion.div
                    layout
                    ref={mainContentRef}
                    className="flex-1 h-full overflow-y-auto min-w-0 flex flex-col items-center scroll-smooth scrollbar-hide"
                >
                    <div className="w-full max-w-4xl">

                        {/* Guide Hero Section */}
                        <div className="px-6 sm:px-10 pt-8 pb-10 sm:pt-12 sm:pb-16 border-b border-slate-100 dark:border-slate-800/50 mb-12 relative overflow-visible">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="flex flex-wrap gap-3 mb-8"
                            >
                                {guide.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30 backdrop-blur-sm">
                                        {tag}
                                    </span>
                                ))}
                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-slate-100/80 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/30 backdrop-blur-sm">
                                    {Math.ceil(guide.sections.reduce((acc, curr) => acc + curr.content.length, 0) / 1000)} min read
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight text-balance"
                            >
                                {guide.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-light text-balance"
                            >
                                {guide.description}
                            </motion.p>
                        </div>

                        {/* Reading Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="px-6 sm:px-10 pb-20"
                        >
                            {guide.sections.map((section, idx) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="mb-20 scroll-mt-32"
                                >
                                    {/* Section Header */}
                                    {idx !== 0 && (
                                        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-10 pb-2">
                                            {section.title}
                                        </h2>
                                    )}

                                    <div className="
                                    prose prose-lg sm:prose-xl max-w-none 
                                    prose-slate dark:prose-invert
                                    prose-headings:font-bold prose-headings:tracking-tight
                                    prose-p:leading-8 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:mb-8
                                    prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 
                                    prose-blockquote:bg-gradient-to-r prose-blockquote:from-indigo-50/50 prose-blockquote:to-transparent dark:prose-blockquote:from-indigo-900/10 
                                    prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-10
                                    prose-li:marker:text-indigo-400
                                    prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:shadow-2xl prose-pre:my-10
                                    prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                    prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-12
                                ">
                                        <ReactMarkdown
                                            components={{
                                                h3: ({ node, ...props }) => (
                                                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mt-12 mb-6" {...props} />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul className="my-8 space-y-4" {...props} />
                                                ),
                                            }}
                                        >
                                            {section.content}
                                        </ReactMarkdown>
                                    </div>
                                </section>
                            ))}

                            <div className="border-t border-slate-200 dark:border-slate-800 my-16" />

                            {/* Feedback Micro-Interaction */}
                            <div className="flex flex-col items-center justify-center py-10 mb-10">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-widest">
                                    {feedbackGiven ? "Thanks for your feedback!" : "Was this section helpful?"}
                                </p>
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileHover={!feedbackGiven ? { scale: 1.1, rotate: -10 } : {}}
                                        whileTap={!feedbackGiven ? { scale: 0.9 } : {}}
                                        onClick={() => handleFeedback("up")}
                                        disabled={!!feedbackGiven}
                                        className={`
                                        p-4 rounded-2xl border transition-all duration-300
                                        ${feedbackGiven === "up"
                                                ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                                                : feedbackGiven
                                                    ? "opacity-50 grayscale border-slate-200 dark:border-slate-800"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-500 hover:text-green-500 dark:hover:text-green-400"
                                            }
                                    `}
                                    >
                                        {feedbackGiven === "up" ? <HandThumbUpSolid className="w-6 h-6" /> : <HandThumbUpIcon className="w-6 h-6" />}
                                    </motion.button>
                                    <motion.button
                                        whileHover={!feedbackGiven ? { scale: 1.1, rotate: 10 } : {}}
                                        whileTap={!feedbackGiven ? { scale: 0.9 } : {}}
                                        onClick={() => handleFeedback("down")}
                                        disabled={!!feedbackGiven}
                                        className={`
                                        p-4 rounded-2xl border transition-all duration-300
                                        ${feedbackGiven === "down"
                                                ? "bg-slate-700 border-slate-700 text-white"
                                                : feedbackGiven
                                                    ? "opacity-50 grayscale border-slate-200 dark:border-slate-800"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                                            }
                                    `}
                                    >
                                        <HandThumbDownIcon className="w-6 h-6" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Footer Navigation */}
                            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                                {/* Gradient Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-700" />

                                <p className="text-center text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-10">
                                    Lesson Complete
                                </p>

                                <div className="grid sm:grid-cols-2 gap-8">
                                    {prevGuide ? (
                                        <Link
                                            href={`/knowledgecenter/guides/${prevGuide.slug}`}
                                            className="group/btn flex flex-col p-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2 group-hover/btn:text-indigo-500 transition-colors">
                                                <ArrowLeftIcon className="w-3 h-3 transition-transform group-hover/btn:-translate-x-1" /> Previous
                                            </span>
                                            <span className="font-bold text-xl text-slate-900 dark:text-white group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 transition-colors">
                                                {prevGuide.title}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="hidden sm:block" />
                                    )}

                                    {nextGuide ? (
                                        <Link
                                            href={`/knowledgecenter/guides/${nextGuide.slug}`}
                                            onClick={() => handleNextOrFinish(false)}
                                            className="group/btn relative flex flex-col items-end text-right p-8 overflow-hidden rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-600/30 hover:scale-[1.02] transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                                            <div className="relative z-10 w-full flex flex-col items-end">
                                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-3 flex items-center gap-2 group-hover/btn:text-white transition-colors">
                                                    Next Lesson <ArrowRightIcon className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                                                </span>
                                                <span className="font-bold text-xl">
                                                    {nextGuide.title}
                                                </span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/knowledgecenter/guides"
                                            onClick={() => handleNextOrFinish(true)}
                                            className="group/btn relative flex flex-col items-end text-right p-8 overflow-hidden rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-600/30 hover:scale-[1.02] transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                            <div className="relative z-10 w-full flex flex-col items-end">
                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-3 flex items-center gap-2">
                                                    Finish Guide <CheckCircleIcon className="w-4 h-4" />
                                                </span>
                                                <span className="font-bold text-xl">
                                                    Back to All Guides
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Sidebar - Tools & Notes */}
                <motion.div
                    initial={false}
                    animate={{
                        width: isFocusMode ? 0 : 320,
                        opacity: isFocusMode ? 0 : 1,
                        x: isFocusMode ? 20 : 0
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="hidden xl:block h-full p-8 overflow-y-auto border-l border-slate-100 dark:border-slate-800/60 flex-none"
                >
                    <div className="min-w-[256px]">
                        {/* Quick Notes Widget */}
                        <div className="bg-amber-50/50 dark:bg-slate-900/30 rounded-2xl p-6 border border-amber-100/50 dark:border-slate-800/50 relative group transition-colors hover:bg-amber-50 dark:hover:bg-slate-900/50">
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                <h3 className="text-xs font-bold text-amber-500/70 dark:text-slate-500 uppercase tracking-widest">
                                    Quick Notes
                                </h3>
                            </div>

                            <textarea
                                value={notes}
                                onChange={handleNoteChange}
                                placeholder="Capture your thoughts..."
                                className="w-full h-80 bg-transparent text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none placeholder:text-slate-400/50 leading-relaxed font-normal"
                                spellCheck={false}
                            />
                            <div className="flex justify-end mt-2">
                                <span className={`text-[10px] text-slate-400 transition-opacity duration-500 ${notes ? 'opacity-100' : 'opacity-0'}`}>
                                    Saved to browser
                                </span>
                            </div>
                        </div>

                        {/* Tip Box or Empty Space */}
                        <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/20">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-md text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    <SparklesIcon className="w-4 h-4" />
                                </div>
                                <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                    <strong>Pro Tip:</strong> Toggle <span className="font-bold">Focus Mode</span> in the header to hide these sidebars and immerse yourself in reading.
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </main>
    )
}
