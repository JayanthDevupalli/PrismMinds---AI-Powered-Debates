"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { blogs } from "@/lib/blog-data"
import Link fr  om "next/link"
import { notFound } from "next/navigation"

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.blogId as string

  const blog = blogs.find((b) => b.id === blogId)

  if (!blog) {
    notFound()
  }

  // Parse markdown-like content into HTML
  const renderContent = (content: string) => {
    return content.split("\n").map((line, idx) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-4xl font-bold mt-8 mb-6">
            {line.replace("# ", "")}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-2xl font-bold mt-6 mb-4">
            {line.replace("## ", "")}
          </h2>
        )
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">
            {line.replace("### ", "")}
          </h3>
        )
      }
      if (line.startsWith("- ")) {
        return (
          <li key={idx} className="ml-6 mb-2">
            {line.replace("- ", "")}
          </li>
        )
      }
      if (line.trim() === "") {
        return <div key={idx} className="mb-4" />
      }
      return (
        <p key={idx} className="text-muted-foreground mb-3 leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Image */}
        <div className="mb-8 sm:mb-12 rounded-lg overflow-hidden">
          <img src={blog.image || "/placeholder.svg"} alt={blog.title} className="w-full h-96 object-cover" />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${blog.tagColor}`}>
              {blog.tag}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">{blog.title}</h1>

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
        <div className="prose prose-invert max-w-none text-foreground">
          <div className="space-y-4">{renderContent(blog.content)}</div>
        </div>

        {/* Author Bio */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-border">
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">About the Author</h3>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{blog.author}</span> is a leading voice in the field of
              artificial intelligence, with extensive experience in {blog.category.toLowerCase()}. They regularly
              contribute to industry publications and speak at major conferences.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 sm:mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
          <p className="text-muted-foreground mb-6">Subscribe to our newsletter for more AI insights and debate</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Subscribe Now
          </Button>
        </div>
      </article>

      {/* Related Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">More Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs
            .filter((b) => b.id !== blog.id)
            .slice(0, 3)
            .map((relatedBlog) => (
              <Link
                key={relatedBlog.id}
                href={`/blogs/${relatedBlog.id}`}
                className="group bg-card rounded-lg overflow-hidden border border-border hover:border-accent/50 transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={relatedBlog.image || "/placeholder.svg"}
                    alt={relatedBlog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
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
