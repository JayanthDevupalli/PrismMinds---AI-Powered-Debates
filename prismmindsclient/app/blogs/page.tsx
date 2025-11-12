"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import BlogCard from "@/components/blog-card"
import { blogs } from "@/lib/blog-data"

export default function BlogsPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative w-full py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-medium text-accent">Explore AI Insights</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              AI Debate
            </span>{" "}
            <span className="text-foreground">Insights</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Dive deep into the world of artificial intelligence through thought-provoking debates, latest research, and
            expert perspectives on the future of AI technology.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              Explore Articles
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              Subscribe to Updates
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Latest Articles</h2>
            <p className="text-muted-foreground">
              Curated stories exploring the intersection of AI, ethics, and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {blogs.map((blog, index) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.id}`}
                className="group"
                onMouseEnter={() => setHoveredId(blog.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <BlogCard blog={blog} isHovered={hoveredId === blog.id} index={index} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
