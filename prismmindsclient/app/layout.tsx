import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import ChatBot from "@/components/ChatBot"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://prismminds.vercel.app"),

  title: {
    default: "PrismMinds - AI-Powered Debate Platform for Critical Thinking",
    template: "%s | PrismMinds",
  },

  description:
    "Experience revolutionary AI debates with PrismMinds. Engage in Human vs AI discussions, explore multi-perspective arguments, and achieve consensus through structured, intelligent debates. Features AI personas, real-time analysis, and comprehensive transcripts.",

  keywords: [
    "AI debate platform",
    "artificial intelligence debates",
    "critical thinking",
    "human vs AI",
    "debate AI",
    "consensus building",
    "structured arguments",
    "intelligent discussions",
    "debate transcripts",
    "AI personas",
    "multi-perspective analysis",
    "debate framework",
    "critical reasoning",
    "intellectual clarity",
    "collective understanding"
  ],

  authors: [{ name: "PrismMinds Team" }],

  creator: "PrismMinds",

  publisher: "PrismMinds",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "PrismMinds - AI-Powered Debate Platform for Critical Thinking",
    description:
      "Revolutionary AI debate platform where humans and AI personas engage in structured arguments. Experience Human vs AI debates, multi-perspective analysis, and achieve intellectual consensus.",
    url: "https://prismminds.vercel.app",
    siteName: "PrismMinds",
    images: [
      {
        url: "/mainlogo.png",
        width: 1200,
        height: 630,
        alt: "PrismMinds AI Debate Platform Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PrismMinds - AI-Powered Debate Platform",
    description:
      "Engage in Human vs AI debates and explore AI-driven arguments with full transcripts on PrismMinds.",
    images: ["/mainlogo.png"],
    creator: "@prismminds",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "ZoqqZ6cB_22XWp19-ulO7LDFOIkaS24zOov1Vn8A5Ek",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PrismMinds",
    "description": "AI-powered debate platform for critical thinking and consensus building through structured arguments",
    "url": "https://prismminds.vercel.app",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "creator": {
      "@type": "Organization",
      "name": "PrismMinds Team"
    },
    "featureList": [
      "AI Personas for debates",
      "Human vs AI discussions",
      "Real-time argument analysis",
      "Structured debate transcripts",
      "Consensus synthesis",
      "Multi-perspective analysis"
    ],
    "screenshot": "/mainlogo.png"
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>


      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ChatBot />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>

    </html>
  )
}
