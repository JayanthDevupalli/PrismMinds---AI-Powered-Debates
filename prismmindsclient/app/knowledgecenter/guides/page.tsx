"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    ArrowRightIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useState, useMemo } from "react"

const guides = [
    {
        slug: "argument-structure",
        title: "Fundamentals of Argument Structure",
        description:
            "Learn how arguments are built — from premises to conclusions, and how logical flow determines strength.",
        level: "Beginner",
        tags: ["Fundamentals", "Logic"],
    },
    {
        slug: "logical-fallacies",
        title: "Common Logical Fallacies and How to Spot Them",
        description:
            "Avoid reasoning traps. Learn to identify and counter common fallacies like ad hominem, straw man, and more.",
        level: "Beginner",
        tags: ["Fallacies", "Critical Thinking"],
    },
    {
        slug: "debating-techniques",
        title: "Debating Techniques and Best Practices",
        description:
            "A practical guide to winning debates — structuring points, countering effectively, and closing confidently.",
        level: "Intermediate",
        tags: ["Debate", "Strategy"],
    },
    {
        slug: "critical-thinking",
        title: "Critical Thinking in Practice",
        description:
            "Sharpen your analytical skills with techniques used in critical thinking courses and real-world reasoning.",
        level: "Intermediate",
        tags: ["Analysis", "Philosophy"],
    },
    {
        slug: "argument-mapping",
        title: "Argument Mapping and Structured Reasoning",
        description:
            "Turn abstract thoughts into clear visual logic using maps and frameworks for better debate performance.",
        level: "Advanced",
        tags: ["Visualization", "Tools"],
    },
    {
        slug: "virtual-debate-tools",
        title: "Virtual Debate Platforms and Practice Tools",
        description:
            "Discover online platforms where you can practice structure and civility in real debates.",
        level: "All Levels",
        tags: ["Tools", "Practice"],
    },
    {
        slug: "debate-communication-skills",
        title: "Using Debate to Build Communication Skills",
        description:
            "Learn how debate practice improves communication, leadership, and persuasive speaking.",
        level: "All Levels",
        tags: ["Soft Skills", "Leadership"],
    },
]

export default function GuidesPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredGuides = useMemo(() => {
        if (!searchQuery) return guides
        const q = searchQuery.toLowerCase()
        return guides.filter(
            g =>
                g.title.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q) ||
                g.tags.some(t => t.toLowerCase().includes(q))
        )
    }, [searchQuery])

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20 px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-7xl mx-auto">

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/knowledgecenter"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Center
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        Guides
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
                        Structured resources to master clear thinking, strong arguments,
                        and effective debate.
                    </p>

                    {/* Mobile-Optimized Search Bar */}
                    <div className="max-w-2xl mx-auto relative px-2 sm:px-0">
                        <MagnifyingGlassIcon
                            className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search guides..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="
                w-full
                pl-11 sm:pl-14
                pr-4
                py-3 sm:py-4
                rounded-xl sm:rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900
                text-sm sm:text-base
                text-slate-900 dark:text-white
                placeholder-slate-500
                focus:outline-none
                focus:ring-2 sm:focus:ring-4
                focus:ring-indigo-500/30
                focus:border-indigo-500
                transition
              "
                        />
                    </div>

                    {/* Count */}
                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {filteredGuides.length}{" "}
                        {filteredGuides.length === 1 ? "guide" : "guides"} available
                    </p>
                </motion.div>

                {/* Guides Grid */}
                {filteredGuides.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-slate-400">
                            No guides found matching your search.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredGuides.map((guide, index) => (
                            <motion.article
                                key={guide.slug}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06, duration: 0.45 }}
                                whileHover={{ y: -6 }}
                                className="
                  group relative rounded-3xl
                  border border-slate-200/70 dark:border-slate-700/60
                  bg-white/90 dark:bg-slate-900/90
                  backdrop-blur-md
                  p-6
                  shadow-lg
                  hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600/50
                  transition-all
                "
                            >
                                {/* Level badge */}
                                <span
                                    className={`
                    absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                    ${guide.level === "Beginner"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                            : guide.level === "Intermediate"
                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                                : "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
                                        }
                  `}
                                >
                                    {guide.level}
                                </span>

                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 pr-16">
                                    {guide.title}
                                </h2>

                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                                    {guide.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {guide.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-0.5 text-[11px] rounded-full bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/knowledgecenter/guides/${guide.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 transition group/link"
                                >
                                    Read guide
                                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/link:translate-x-2" />
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
