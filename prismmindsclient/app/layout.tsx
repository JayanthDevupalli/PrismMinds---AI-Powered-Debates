import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://prismminds.vercel.app"),

  title: {
    default: "PrismMinds - Multi-Perspective AI Debating & Consensus Platform",
    template: "%s | PrismMinds",
  },

  description:
    "PrismMinds is an AI debate platform where humans and AI personas engage in structured arguments, critical thinking, and real-time debates with full transcripts.",

  openGraph: {
    title: "PrismMinds - AI Debate Platform",
    description:
      "Debate AI personas, explore Human vs AI and AI vs AI discussions, and analyze structured arguments with transparent transcripts.",
    url: "https://prismminds.vercel.app",
    siteName: "PrismMinds",
    images: [
      {
        url: "mainlogo.jpg",
        width: 1200,
        height: 630,
        alt: "PrismMinds AI Debate Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PrismMinds - AI Debate Platform",
    description:
      "Engage in Human vs AI debates and explore AI-driven arguments with full transcripts.",
    images: ["mainlogo.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
