"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    PlayIcon,
    ClockIcon,
    SparklesIcon,
    UserCircleIcon,
    TagIcon,
    ArrowLeftIcon,
    ShareIcon
} from "@heroicons/react/24/solid"
import { videos } from "./data"

export default function VideosPage() {

    // Find Julian Treasure's video for Hero, or fallback to first
    const featuredVideo = videos.find(v => v.id === "powerful-listening") || videos[0]

    return (
        <main className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">

            {/* STICKY GLASS NAVBAR */}
            <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/knowledgecenter"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition px-3 py-1.5 rounded-full hover:bg-slate-100"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Knowledge Center</span>
                    </Link>

                    {/* Optional: Add Search or other tools here in future */}
                </div>
            </nav>

            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-black rounded-[2rem] md:rounded-[2.5rem] overflow-hidden p-8 md:p-16 mb-12 text-white shadow-2xl shadow-indigo-900/20"
                >
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600 rounded-full blur-[200px] opacity-40 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[150px] opacity-20 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                    <div className="relative z-10 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="space-y-6 md:space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-widest uppercase text-indigo-300">
                                <SparklesIcon className="w-4 h-4" /> Featured Masterclass
                            </div>

                            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
                                {featuredVideo.title}
                            </h1>

                            <p className="text-base md:text-lg text-slate-300 line-clamp-3 leading-relaxed">
                                {featuredVideo.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    href={`/knowledgecenter/videos/${featuredVideo.id}`}
                                    className="px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2 text-sm md:text-base"
                                >
                                    <PlayIcon className="w-5 h-5" /> Start Watching
                                </Link>
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs md:text-sm font-bold text-white/80">
                                    <ClockIcon className="w-4 h-4 md:w-5 md:h-5 opacity-70" /> {featuredVideo.duration}
                                </div>
                            </div>
                        </div>

                        {/* Hero Thumbnail */}
                        <Link href={`/knowledgecenter/videos/${featuredVideo.id}`} className="hidden lg:block relative group cursor-pointer rounded-[2rem] overflow-hidden ring-8 ring-white/5 transform rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl">
                            <img
                                src={featuredVideo.thumbnailUrl}
                                alt={featuredVideo.title}
                                className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition duration-500">
                                    <PlayIcon className="w-10 h-10 text-white drop-shadow-xl ml-1" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Section Title */}
                <div className="mb-6 border-b border-slate-200 pb-4">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Latest Sessions</h2>
                </div>

                {/* Videos Grid - Direct Render (No Search/Filter) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-32">
                    {videos.map((video, idx) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group flex flex-col h-full"
                        >
                            <Link href={`/knowledgecenter/videos/${video.id}`} className="block h-full bg-white rounded-[1.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
                                {/* Thumbnail */}
                                <div className="relative w-full aspect-[4/3] rounded-[1.25rem] overflow-hidden mb-3 bg-slate-100">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />

                                    {/* Level Badge */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`backdrop-blur-md bg-white/95 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm text-slate-900 uppercase tracking-wide
                                            ${video.level === 'Beginner' ? 'text-green-700' :
                                                video.level === 'Intermediate' ? 'text-amber-700' : 'text-purple-700'}`}>
                                            {video.level}
                                        </span>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center shadow-lg transform scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 border border-white/40">
                                            <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Duration Badge */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3" /> {video.duration}
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div className="px-1 pb-1 flex-1 flex flex-col">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="p-0.5 bg-indigo-50 rounded-full text-indigo-600">
                                            <UserCircleIcon className="w-3 h-3" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-indigo-600 transition truncate">
                                            {video.speaker}
                                        </span>
                                    </div>

                                    <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {video.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
                                        {video.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

            </div>
        </main>
    )
}
