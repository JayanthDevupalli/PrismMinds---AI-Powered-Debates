"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronDown, Sparkles, Search, Clock, ArrowUpRight, ArrowRight } from "lucide-react"
import { blogs } from "@/lib/blog-data"

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden font-sans selection:bg-orange-100 dark:selection:bg-orange-900/30">

      {/* Clean Premium Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-50/50 via-white/0 to-white/0 dark:from-slate-900/50 dark:via-slate-950/0 dark:to-slate-950/0"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 pt-6"
      >
        <Link
          href="/knowledgecenter"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors group font-medium text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Knowledge Center</span>
        </Link>
      </motion.div>

      <section className="relative w-full py-20 sm:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-xs font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800/30"
          >
            <Sparkles className="w-3 h-3" />
            PrismMinds Intelligence
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-8 leading-tight tracking-tight text-slate-900 dark:text-white">
            Insights & Debates on <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 relative">
              Artificial Intelligence
              {/* Underline decoration */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-200 dark:text-orange-800/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Explore thought-provoking articles on AI ethics, societal impact, and future innovation.
            Curated for the curious mind.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <a href="#latest-articles" className="group">
              <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:border-orange-200 transition-all bg-white dark:bg-slate-900 shadow-sm group-hover:shadow-md">
                <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </a>
          </motion.div>
        </div>
      </section>

      <section id="latest-articles" className="relative w-full pb-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <ArticlesShell />
        </div>
      </section>
    </main>
  )
}

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

  // Get unique tags
  const tags = useMemo(() => Array.from(new Set(blogs.map((b) => b.tag))), [])

  return (
    <div>
      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="sticky top-4 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/20 mb-12"
      >
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, authors..."
              className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="h-px md:h-auto md:w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 px-2 hide-scrollbar">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!activeTag
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
            >
              All Posts
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTag === t
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Article */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Link
            href={`/knowledgecenter/blogs/${featured.id}`}
            className="group block relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl hover:shadow-orange-900/20 transition-all duration-500"
          >
            <div className="aspect-[3/4] sm:aspect-[2.5/1] relative w-full overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
              <Image
                src={featured.image || "/placeholder.svg"}
                alt={featured.imageAlt || featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20">
                      Featured
                    </span>
                    <span className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-orange-100 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-lg line-clamp-2 max-w-2xl">
                    {featured.description}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {grid.map((blog, idx) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Link
              href={`/knowledgecenter/blogs/${blog.id}`}
              className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={blog.image || "/placeholder.svg"}
                  alt={blog.imageAlt || blog.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-sm">
                    {blog.tag}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <span>{blog.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{blog.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {blog.title}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                  {blog.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <AuthorPill author={blog.author} />
                  <span className="text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all flex items-center gap-1">
                    Read Now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">We couldn't find any articles matching "{query}"</p>
          <button
            onClick={() => { setQuery(""); setActiveTag(null); }}
            className="text-orange-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

function AuthorPill({ author }: { author: string }) {
  const initials = useMemo(() => {
    return author
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [author])

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shadow-inner border border-white dark:border-slate-600">
        {initials}
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
        {author}
      </span>
    </div>
  )
}
