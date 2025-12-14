"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, BookOpen, Video, Landmark, ArrowRight, ArrowLeft, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function KnowledgeCenter() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">

            {/* ===== BACKGROUND MESH ===== */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full
                        bg-purple-400/20 dark:bg-purple-600/15 blur-[120px]" />
                <div className="absolute top-1/4 -right-40 w-[520px] h-[520px] rounded-full
                        bg-indigo-400/20 dark:bg-indigo-600/15 blur-[120px]" />
                <div className="absolute bottom-0 left-1/3 w-[520px] h-[520px] rounded-full
                        bg-fuchsia-400/15 dark:bg-fuchsia-600/10 blur-[140px]" />
            </div>

            {/* ===== BACK TO HOME ===== */}
            <Link
                href="/"
                className="
    absolute top-8 left-20 z-20
    inline-flex items-center gap-2
    text-sm font-medium tracking-wide
    text-slate-600 dark:text-slate-300
    hover:text-indigo-600 dark:hover:text-indigo-400
    transition-colors duration-300
    group
  "
            >
                <ArrowLeft
                    className="
      w-4 h-4
      transition-transform duration-300
      group-hover:-translate-x-1
    "
                />
                <span>Back to Home</span>
            </Link>


            {/* ===== HERO ===== */}
            <section className="relative z-10 flex min-h-[75vh] items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-5xl text-center"
                >

                    {/* STACK CONTAINER (IMPORTANT FIX) */}
                    <div className="flex flex-col items-center">

                        {/* Badge (TOP) */}
                        <div
                            className="
          mb-6 inline-flex items-center gap-2
          rounded-full
          border border-slate-200/60 dark:border-white/10
          bg-white/70 dark:bg-slate-900/60
          px-4 py-2
          backdrop-blur-xl shadow-sm
        "
                        >
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Learn · Think · Dominate Arguments
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            className="
          relative inline-block
          text-5xl md:text-6xl lg:text-7xl
          font-extrabold tracking-tight
          bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500
          bg-clip-text text-transparent
        "
                        >
                            Knowledge Center

                            {/* Underline */}
                            <motion.span
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                className="
            absolute left-1/2 -bottom-4 h-[4px] w-[70%] -translate-x-1/2 origin-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"
                            />
                        </h1>

                        {/* Subtitle */}
                        <p
                            className="mt-10 max-w-3xl text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            A focused space to sharpen your reasoning, master debate structures,
                            and learn how powerful arguments are built and delivered.
                        </p>

                    </div>
                </motion.div>
            </section>


            {/* ===== SECTION INTRO ===== */}
            <section className="relative z-10 py-20 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
                        Explore the Knowledge Vault
                    </h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                        Curated resources designed for clarity, confidence, and critical depth.
                    </p>
                </div>
            </section>

            {/* ===== CARDS ===== */}
            <section className="relative z-10 px-6">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">

                    {[
                        {
                            title: "Guides",
                            desc: "Structured frameworks, logical breakdowns, and debate techniques.",
                            Icon: BookOpen,
                            href: "/knowledgecenter/guides",
                            cta: "Explore Guides",
                        },
                        {
                            title: "Videos",
                            desc: "Visual explanations of argument flow and persuasion strategies.",
                            Icon: Video,
                            href: "/knowledge/videos",
                            cta: "Explore Videos",
                        },
                        {
                            title: "Public Debates",
                            desc: "Analyze famous debates and understand winning argument patterns.",
                            Icon: Landmark,
                            href: "/knowledge/debates",
                            cta: "Explore Debates",
                        },
                    ]
                        .map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -8 }}
                                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                className="
                group relative rounded-3xl
                border border-slate-200/70 dark:border-white/10
                bg-white/70 dark:bg-slate-900/60
                p-10 backdrop-blur-xl
                shadow-[0_10px_40px_-18px_rgba(0,0,0,0.25)]
              "
                            >
                                {/* Icon */}
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl
                              bg-gradient-to-br from-white to-slate-100
                              dark:from-slate-800 dark:to-slate-900
                              shadow-md">
                                    <item.Icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                                </div>

                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {item.desc}
                                </p>
                                <Link
                                    href={item.href}
                                    className="
    mt-6 inline-flex items-center gap-2
    text-sm font-semibold
    text-indigo-600 dark:text-indigo-400
    opacity-80 group-hover:opacity-100
    transition
  "
                                >
                                    {item.cta}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>

                            </motion.div>
                        ))}
                </div>
            </section>

            {/* Blog CTA (attractive hero card) */}
            <section id="blog-cta" className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative rounded-3xl overflow-hidden shadow-xl p-8 sm:p-12 md:p-14 lg:p-16 text-center"
                    >
                        {/* Background gradient layers - light theme */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-purple-100/60 to-pink-100/70 dark:from-slate-900/70 dark:via-purple-900/50 dark:to-pink-900/60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/30 dark:to-transparent" />

                        {/* Decorative blobs - lighter, softer */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100/80 to-pink-100/80 border border-purple-300/30 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-700/50 mb-6">
                                <Brain className="w-5 h-5" />
                                <span className="text-sm font-semibold">Weekly insights • Prompts • Patterns</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 leading-tight">
                                Dive into Our Blog
                            </h2>

                            <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg lg:text-xl mb-8 lg:mb-10 max-w-2xl mx-auto">
                                Master debate design, craft powerful prompts, and unlock the full potential of AI-driven reasoning.
                            </p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-5"
                            >
                                <Link href="/knowledgecenter/blogs">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-105"
                                    >
                                        Explore Blogs
                                    </Button>
                                </Link>
                                <Link
                                    href="/knowledgecenter/blogs"
                                    className="text-purple-600 dark:text-purple-300 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium text-base"
                                >
                                    Browse all articles →
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
