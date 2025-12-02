"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, ChevronDown } from "lucide-react"
import { blogs } from "@/lib/blog-data"

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-muted to-white text-foreground">
      {/* Back to Home (consistent with Features page) */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 px-6 pt-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* 🌿 Hero Section */}
      <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Soft Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-muted -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent blur-3xl -z-10" />

        {/* Hero Content */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Insights & Debates on Artificial Intelligence
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Thought-provoking articles exploring AI’s impact on society, ethics,
            and innovation — written by top thinkers and researchers shaping the
            future of intelligence.
          </p>

          <a href="#latest-articles">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition">
              Explore Articles
            </button>
          </a>

          {/* Scroll down animation - Balanced */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 flex justify-center"
          >
            <motion.a
              href="#latest-articles"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center p-3 rounded-full bg-primary/15 border border-primary/40 hover:bg-primary/25 hover:border-primary/60 transition-all"
            >
              <ChevronDown className="w-6 h-6 text-primary" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* 📰 Articles Section */}
      <section id="latest-articles" className="w-full py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-primary">
              Latest Articles
            </h2>
            <p className="text-muted-foreground">
              Deep dives into the latest discussions shaping the world of AI
            </p>
          </div>

          {/* Controls will be rendered inside the articles shell (search + tags) */}

          {/* Featured + Grid */}
          <ArticlesShell />
        </div>
      </section>
    </main>
  )
}

// NOTE: Search input and Tag chips are rendered inside ArticlesShell so they
// can directly control the `query` and `activeTag` state.

function ArticlesShell() {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return blogs.filter((b) => {
      const matchesQuery = q === "" || [b.title, b.description, b.author, b.tag].join(" ").toLowerCase().includes(q)
      const matchesTag = !activeTag || b.tag === activeTag
      return matchesQuery && matchesTag
    })
  }, [query, activeTag])

  const featured = filtered.length > 0 ? filtered[0] : null
  const grid = filtered.slice(featured ? 1 : 0)

  return (
    <div>
      {/* Controls: Search + Tag filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="w-full sm:w-1/2">
          <label className="sr-only">Search articles</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, e.g. 'ethics', 'LLMs'..."
            className="w-full rounded-lg border border-muted/30 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(blogs.map((b) => b.tag))).map((t) => {
            const active = activeTag === t
            return (
              <button
                key={t}
                onClick={() => setActiveTag(active ? null : t)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  active ? "bg-primary text-white" : "bg-muted/10 text-muted-foreground"
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>
      {/* Featured */}
      {featured && (
        <Link
          href={`/blogs/${featured.id}`}
          className="block mb-10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition"
        >
          <div className="relative w-full h-64 sm:h-80">
            <Image src={featured.image} alt={featured.imageAlt || featured.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute left-6 bottom-6 text-white">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${featured.tagColor}`}>{featured.tag}</span>
              <h3 className="text-2xl sm:text-3xl font-bold mt-3 mb-2">{featured.title}</h3>
              <p className="max-w-xl text-sm opacity-90">{featured.description}</p>
              <div className="mt-4 inline-flex items-center gap-3 text-sm">
                <AuthorPill author={featured.author} readTime={featured.readTime} />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {grid.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.id}`} className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
            <div className="relative w-full h-44 sm:h-40">
              <Image src={blog.image} alt={blog.imageAlt || blog.title} fill className="object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className={`inline-flex items-center gap-2 ${blog.tagColor} rounded-full px-2 py-1 text-xs`}>{blog.tag}</span>
                <span className="text-muted-foreground">{blog.date}</span>
              </div>
              <h4 className="text-lg font-semibold line-clamp-2">{blog.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">{blog.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <AuthorPill author={blog.author} readTime={blog.readTime} />
                <div className="text-primary font-medium flex items-center gap-2">Read <ArrowRight className="w-4 h-4" /></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AuthorPill({ author, readTime }: { author: string; readTime: string }) {
  const initials = useMemo(() => {
    return author
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [author])

  return (
    <div className="inline-flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-semibold">{initials}</div>
      <div className="text-sm">
        <div className="font-medium">{author}</div>
        <div className="text-xs text-muted-foreground">{readTime}</div>
      </div>
    </div>
  )
}
