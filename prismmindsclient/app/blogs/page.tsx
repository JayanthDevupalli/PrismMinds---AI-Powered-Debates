"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { blogs } from "@/lib/blog-data"

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-muted to-white text-foreground">
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
        </div>
      </section>

      {/* 📰 Articles Section */}
      <section id="latest-articles" className="w-full py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-primary">
              Latest Articles
            </h2>
            <p className="text-muted-foreground">
              Deep dives into the latest discussions shaping the world of AI
            </p>
          </div>
          {/* Removed featured hero — use consistent grid for all articles */}

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog, index) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.id}`}
                className="group flex flex-col blog-card"
              >
                {/* Blog Image */}
                <div className="blog-image-wrap w-full h-52">
                  <Image
                    src={blog.image}
                    alt={blog.imageAlt || blog.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="blog-image-overlay" />
                </div>

                {/* Blog Content */}
                <div className="flex flex-col flex-grow p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`blog-badge ${blog.tagColor}`}>
                      {blog.tag}
                    </span>
                    <span className="text-xs blog-meta">{blog.date}</span>
                  </div>

                  <h2 className="text-xl blog-title-serif mb-2 leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h2>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {blog.description}
                  </p>

                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
