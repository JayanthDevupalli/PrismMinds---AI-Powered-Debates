"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PlayCircleIcon, UserCircleIcon, ClockIcon, ShareIcon, BookmarkIcon, LightBulbIcon, ChevronRightIcon, SparklesIcon } from "@heroicons/react/24/solid"
import { videos } from "../data"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function VideoDetailPage() {
    const params = useParams()
    const { vid } = params
    const video = videos.find(v => v.id === vid)
    const relatedVideos = videos.filter(v => v.id !== vid).slice(0, 4)
    const [viewMode, setViewMode] = useState<'video' | 'insights'>('video')

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Link href="/knowledgecenter/videos" className="text-indigo-600 font-bold hover:underline">Return to Library</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 relative">

            {/* BEAST MODE: Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow delay-1000" />
                <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[40vw] h-[40vw] bg-blue-100/20 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            {/* NAV: Premium Glass */}
            <nav className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-2xl border-b border-white/20 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/knowledgecenter/videos"
                        className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-full hover:bg-white/60"
                    >
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="hidden sm:inline font-semibold tracking-tight">Library</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/60 rounded-full transition-all duration-300">
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/60 rounded-full transition-all duration-300">
                            <BookmarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-32">

                {/* FOCUS TOGGLE: Segmented Control */}
                <div className="flex justify-center mb-6 md:mb-10">
                    <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button
                            onClick={() => setViewMode('video')}
                            className={`px-5 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2
                                ${viewMode === 'video'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <PlayCircleIcon className="w-4 h-4" />
                            <span>Watch Video</span>
                        </button>
                        <div className="w-px bg-slate-300 my-2" />
                        <button
                            onClick={() => setViewMode('insights')}
                            className={`px-5 py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2
                                ${viewMode === 'insights'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>Key Insights</span>
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {viewMode === 'video' ? (
                        <motion.div
                            key="video-view"
                            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)", transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            {/* VIDEO PLAYER */}
                            <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-white/10 group">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`${video.videoUrl}?rel=0&modestbranding=1`}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0"
                                ></iframe>
                            </div>

                            {/* INFO */}
                            <div className="space-y-6 px-1 md:px-2">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                    <span className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/40 shadow-sm text-[10px] md:text-xs font-bold text-slate-600">
                                        <ClockIcon className="w-3.5 h-3.5 text-indigo-500" /> {video.duration}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-extrabold border shadow-sm backdrop-blur-md
                                        ${video.level === 'Beginner' ? 'bg-green-50/50 text-green-700 border-green-200/50' :
                                            video.level === 'Intermediate' ? 'bg-amber-50/50 text-amber-700 border-amber-200/50' : 'bg-purple-50/50 text-purple-700 border-purple-200/50'}`}>
                                        {video.level}
                                    </span>
                                    {video.tags?.map(tag => (
                                        <span key={tag} className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer">#{tag}</span>
                                    ))}
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                                        {video.title}
                                    </h1>
                                    <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                        {video.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100/50">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                        <UserCircleIcon className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Instructor</div>
                                        <div className="font-bold text-slate-900 text-sm md:text-base">{video.speaker}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="insights-view"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -20, filter: "blur(10px)", transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="max-w-5xl mx-auto"
                        >
                            {/* CENTERED KNOWLEDGE CARD - RESPONSIVE CLEAN */}
                            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-100 relative overflow-hidden">

                                <div className="text-center mb-8 relative z-10">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 border border-purple-100">
                                        <SparklesIcon className="w-3.5 h-3.5" /> AI Analysis
                                    </span>
                                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                                        Key Takeaways
                                    </h1>
                                    <p className="text-slate-500 text-sm md:text-base">Essential points derived from the lecture</p>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {video.insights?.map((insight, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-colors duration-300 group"
                                        >
                                            <div className="flex-shrink-0 pt-0.5">
                                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-slate-100 text-indigo-600 flex items-center justify-center text-xs md:text-sm font-black shadow-sm group-hover:bg-white group-hover:text-indigo-700 ring-1 ring-slate-200/50">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                                                {insight}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-slate-400 text-xs md:text-sm font-medium italic">
                                        "Knowledge is power. Action is foundational."
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* RECOMMENDED GRID (Always Visible at Bottom) */}
                <div className="mt-20 md:mt-32 pt-10 md:pt-16 border-t border-slate-200/50">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-2">
                        <PlayCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        Watch Next
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedVideos.map((v) => (
                            <Link key={v.id} href={`/knowledgecenter/videos/${v.id}`} className="group block">
                                <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 mb-4 shadow-sm ring-1 ring-slate-900/5 group-hover:ring-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all duration-500">
                                    <img src={v.thumbnailUrl} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="" />
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
                                        {v.duration}
                                    </div>
                                </div>
                                <div className="px-1">
                                    <div className="flex gap-2 mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border
                                            ${v.level === 'Beginner' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                            {v.level}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors mb-1 line-clamp-2 text-sm md:text-base">
                                        {v.title}
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-slate-400 font-semibold">{v.speaker}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    )
}
