"use client"

import { Clock, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Blog {
  id: string
  title: string
  description: string
  image: string
  tag: string
  tagColor: string
  date: string
  readTime: string
  author: string
  category: string
}

interface BlogCardProps {
  blog: Blog
  isHovered: boolean
  index: number
}

export default function BlogCard({ blog, isHovered, index }: BlogCardProps) {
  return (
    <div
      className="h-full rounded-lg overflow-hidden bg-card border border-border transition-all duration-300 hover:border-accent/50"
      style={{
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      {/* Image Container with Overlay */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-muted">
        <img
          src={blog.image || "/placeholder.svg"}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tag Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${blog.tagColor}`}>
            {blog.tag}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Title */}
        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300">
          {blog.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{blog.description}</p>

        {/* Meta Information */}
        <div className="space-y-3 mb-5 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {blog.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTime}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            By <span className="font-medium text-foreground">{blog.author}</span>
          </p>
        </div>

        {/* Read Article Button */}
        <Button
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 group-hover:pr-2"
          size="sm"
        >
          Read Article
          <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
        </Button>
      </div>
    </div>
  )
}