"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { blogs } from "@/lib/blog-data"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

export default function BlogDetailPage() {
  const params = useParams()
  const blogId = params.blogid as string
  const blog = blogs.find((b) => b.id === blogId)

  if (!blog) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/10">
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Image with overlay */}
        <div className="relative mb-8 sm:mb-12 rounded-2xl overflow-hidden shadow-xl">
            <Image
            src={blog.image || "/placeholder.svg"}
              alt={blog.imageAlt || blog.title}
            width={1200}
            height={600}
            className="w-full h-96 object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${blog.tagColor || "bg-primary/10 text-primary border-primary/20"}`}
            >
              {blog.tag}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-6 text-balance leading-tight">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-b border-border pb-6">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {blog.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {blog.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {blog.readTime}
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-none text-foreground">
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 leading-tight" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold mt-8 mb-4" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-serif font-semibold mt-6 mb-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-base text-muted-foreground mb-4 leading-relaxed" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-primary underline" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 space-y-2 text-base text-muted-foreground" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="text-foreground font-semibold" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-2 pl-4 italic text-muted-foreground my-4" {...props} />
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* Author Bio */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-border">
          <div className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">About the Author</h3>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{blog.author}</span> is a leading voice in{" "}
              {blog.category.toLowerCase()}, sharing expertise and insights at major AI events and publications.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Enjoyed this article?
          </h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for more AI insights, research, and expert analysis.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105"
          >
            Subscribe Now
          </Button>
        </div>
      </article>

      {/* Related Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8 text-center sm:text-left">
          More Articles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs
            .filter((b) => b.id !== blog.id)
            .slice(0, 3)
            .map((relatedBlog) => (
              <Link
                key={relatedBlog.id}
                href={`/blogs/${relatedBlog.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={relatedBlog.image || "/placeholder.svg"}
                    alt={relatedBlog.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {relatedBlog.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{relatedBlog.readTime}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  )
}
