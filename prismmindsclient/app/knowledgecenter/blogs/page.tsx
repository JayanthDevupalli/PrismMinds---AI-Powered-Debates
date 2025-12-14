"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, ChevronDown, Sparkles } from "lucide-react"
import { blogs } from "@/lib/blog-data"

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl opacity-25" />
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(90deg,transparent_1px,transparent_1px),linear-gradient(transparent_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-8 px-6 pt-6"
      >
        <Link
          href="/knowledgecenter"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-muted -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent blur-3xl -z-10" />

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

      <section id="latest-articles" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">Latest Articles</h2>
            <p className="text-muted-foreground text-lg">Deep dives into the future of AI and technology</p>
          </motion.div>

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

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
      >
        <div className="w-full sm:w-1/2">
          <label className="sr-only">Search articles</label>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-5 py-3 rounded-lg glass glass-hover text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(blogs.map((b) => b.tag))).map((t) => {
            const active = activeTag === t
            return (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTag(active ? null : t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30 glow-effect"
                  : "glass glass-hover"
                  }`}
              >
                {t}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ---------------- FEATURED CARD (UPDATED) ---------------- */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <Link
            href={`/knowledgecenter/blogs/${featured.id}`}
            className="group block rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 glass border border-border/50 hover:border-primary/40"
          >
            <div
              className="
                relative w-full 
                h-[360px]
                xs:h-[400px]
                sm:h-96 
                overflow-hidden
              "
            >
              <Image
                src={featured.image || "/placeholder.svg"}
                alt={featured.imageAlt || featured.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute top-6 left-6 flex items-center gap-2 bg-gradient-to-r from-accent to-primary text-accent-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg"
              >
                <Sparkles size={16} />
                Featured
              </motion.div>

              {/* Updated Overlay */}
              <div className="absolute left-0 bottom-0 right-0 p-5 sm:p-10 flex flex-col gap-3 sm:gap-4">
                <div>
                  <span
                    className={`inline-flex items-center gap-2 ${featured.tagColor} rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold backdrop-blur-sm`}
                  >
                    {featured.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight group-hover:text-accent transition-colors">
                    {featured.title}
                  </h3>
                  <p className="max-w-2xl text-white/85 text-sm sm:text-base line-clamp-2">
                    {featured.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20">
                  <AuthorPill author={featured.author} readTime={featured.readTime} />
                  <div className="text-white flex items-center gap-2 group-hover:gap-3 transition-all font-semibold">
                    Read <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* ---------------- GRID CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {grid.map((blog, idx) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Link
              href={`/knowledgecenter/blogs/${blog.id}`}
              className="group relative flex flex-col h-full rounded-xl overflow-hidden glass border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 glow-effect"
            >
              <div className="relative w-full h-52 overflow-hidden bg-muted/30">
                <Image
                  src={blog.image || "/placeholder.svg"}
                  alt={blog.imageAlt || blog.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute top-4 right-4 z-10">
                  <span
                    className={`inline-flex items-center gap-1 ${blog.tagColor} rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm`}
                  >
                    {blog.tag}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4 flex-grow">
                <div className="text-xs font-medium text-muted-foreground">{blog.date}</div>

                <h4 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h4>

                <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                  {blog.description}
                </p>

                <div className="pt-4 mt-auto flex items-center justify-between border-t border-border/30">
                  <AuthorPill author={blog.author} readTime={blog.readTime} />
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-primary font-semibold flex items-center gap-1 transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">No articles found matching your filters.</p>
          <button
            onClick={() => {
              setQuery("")
              setActiveTag(null)
            }}
            className="px-6 py-2 glass glass-hover rounded-lg font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}
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
    <div className="inline-flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground flex items-center justify-center font-bold text-xs shadow-lg">
        {initials}
      </div>
      <div className="text-xs leading-tight">
        <div className="font-semibold text-foreground">{author}</div>
        <div className="text-muted-foreground">{readTime}</div>
      </div>
    </div>
  )
}
