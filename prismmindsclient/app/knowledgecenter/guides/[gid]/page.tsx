"use client"

import { use, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    BookOpenIcon,
    ListBulletIcon,
    CheckCircleIcon,
    ShareIcon,
    BookmarkIcon,
} from "@heroicons/react/24/outline"
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

    // Scroll listener for reading progress
    useEffect(() => {
        const updateProgress = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (window.scrollY / totalHeight) * 100
            setReadingProgress(Math.min(100, Math.max(0, progress)))
        }
        window.addEventListener("scroll", updateProgress)
        return () => window.removeEventListener("scroll", updateProgress)
    }, [])

    // Scroll spy for active section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            {
                rootMargin: "-20% 0px -50% 0px", // Trigger when section is near top of viewport
                threshold: 0.1
            }
        )

        guide.sections.forEach((section) => {
            const element = document.getElementById(section.id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [guide.sections])

    const currentIndex = guidesData.findIndex(g => g.slug === gid)
    const prevGuide = guidesData[currentIndex - 1]
    const nextGuide = guidesData[currentIndex + 1]

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans">

            {/* Top Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-50 bg-slate-200 dark:bg-slate-800">
                <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-150 ease-out"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/knowledgecenter/guides"
                            className="group p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
                            aria-label="Back to Guides"
                        >
                            <ArrowLeftIcon className="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        </Link>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px] sm:max-w-md">
                            {guide.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                            {guide.level}
                        </div>

                        {/* Action Buttons */}
                        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition">
                            <BookmarkIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition">
                            <ShareIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-screen-2xl mx-auto w-full flex items-start">

                {/* Left Sidebar - Course/Guide Navigation (Desktop) */}
                <aside className="hidden xl:block w-72 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-slate-100 dark:border-slate-800 p-6 lg:pl-8">
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ListBulletIcon className="w-4 h-4" />
                            On This Page
                        </h3>
                        <nav className="relative space-y-1">
                            {/* Vertical track line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />

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
                            group relative w-full text-left pl-8 py-2 text-sm transition-all duration-200 block
                            ${activeSection === section.id
                                            ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                        }
                        `}
                                >
                                    {/* Dot indicator */}
                                    <span className={`
                            absolute left-[7px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-colors z-10
                            ${activeSection === section.id
                                            ? "bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-400 scale-110"
                                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-slate-400"
                                        }
                        `} />
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                        <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 font-medium uppercase tracking-wider">
                            Next Up
                        </p>
                        {nextGuide ? (
                            <Link href={`/knowledgecenter/guides/${nextGuide.slug}`} className="block group">
                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
                                    {nextGuide.title}
                                </div>
                                <div className="text-xs text-slate-500 line-clamp-2">
                                    {nextGuide.description}
                                </div>
                            </Link>
                        ) : (
                            <div className="text-sm font-medium text-green-600 dark:text-green-500 flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" /> Course Complete!
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                {/* CHANGED: items-center -> items-start, added pl-0 xl:pl-16 to reduce gap/align left */}
                <div className="flex-1 min-w-0 flex flex-col items-start xl:pl-16">

                    {/* Guide Hero Section */}
                    {/* Keep w-full max-w-3xl but it will now align left (plus the parent padding) */}
                    <div className="w-full max-w-3xl px-6 sm:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-slate-100 dark:border-slate-800/50 mb-12">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {guide.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                    {tag}
                                </span>
                            ))}
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {Math.ceil(guide.sections.reduce((acc, curr) => acc + curr.content.length, 0) / 1000)} min read
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                            {guide.title}
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                            {guide.description}
                        </p>
                    </div>

                    {/* Reading Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-3xl px-6 sm:px-8 pb-20"
                    >
                        {guide.sections.map((section, idx) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="mb-16 scroll-mt-32"
                            >
                                {/* Section Header */}
                                {idx !== 0 && (
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                                        {section.title}
                                    </h2>
                                )}

                                <div className="
                        prose prose-lg sm:prose-xl max-w-none 
                        prose-slate dark:prose-invert
                        prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:leading-8 prose-p:text-slate-600 dark:prose-p:text-slate-300
                        prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 
                        prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        prose-li:marker:text-indigo-400
                    ">
                                    <ReactMarkdown
                                        components={{
                                            // Custom components for specific markdown elements
                                            h3: ({ node, ...props }) => (
                                                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mt-10 mb-4" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="my-6 space-y-3" {...props} />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <li className="pl-2" {...props} />
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props} />
                                            )
                                        }}
                                    >
                                        {section.content}
                                    </ReactMarkdown>
                                </div>
                            </section>
                        ))}

                        <hr className="border-slate-200 dark:border-slate-800 my-16" />

                        {/* Footer Navigation */}
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800/60">
                            <p className="text-center text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-8">
                                Lesson Complete
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {prevGuide ? (
                                    <Link
                                        href={`/knowledgecenter/guides/${prevGuide.slug}`}
                                        className="group flex flex-col p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-300"
                                    >
                                        <span className="text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                                            <ArrowLeftIcon className="w-3 h-3" /> Previous
                                        </span>
                                        <span className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {prevGuide.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="hidden sm:block" /> // Spacer
                                )}

                                {nextGuide ? (
                                    <Link
                                        href={`/knowledgecenter/guides/${nextGuide.slug}`}
                                        className="group flex flex-col items-end text-right p-6 bg-indigo-600 rounded-2xl border border-indigo-500 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300"
                                    >
                                        <span className="text-xs uppercase tracking-wider text-indigo-200 mb-2 flex items-center gap-1 group-hover:text-white transition-colors">
                                            Next Lesson <ArrowRightIcon className="w-3 h-3" />
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            {nextGuide.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/knowledgecenter/guides"
                                        className="group flex flex-col items-end text-right p-6 bg-green-600 rounded-2xl border border-green-500 hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300"
                                    >
                                        <span className="text-xs uppercase tracking-wider text-green-100 mb-2 flex items-center gap-1">
                                            Finish <CheckCircleIcon className="w-3 h-3" />
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            Back to Guides
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Right Sidebar - Spacer or Additional Tools (Desktop) */}
                <div className="hidden 2xl:block w-64 sticky top-16 h-[calc(100vh-4rem)] p-6">
                    {/* Could add actionable tools here later: "Note taking", "Ask AI", etc. */}
                </div>

            </div>
        </main>
    )
}
