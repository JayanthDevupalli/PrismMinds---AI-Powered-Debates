"use client"

import Head from 'next/head';
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Menu,
  Brain,
  Zap,
  Users,
  FileText,
  User,
  MessageSquare,
  BookOpen,
} from "lucide-react"

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const cardColors = [
    {
      bg: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      accent: "from-blue-400 to-indigo-500",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      border: "border-blue-200 dark:border-blue-800"
    },
    {
      bg: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
      accent: "from-purple-400 to-pink-500",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      border: "border-purple-200 dark:border-purple-800"
    },
    {
      bg: "from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20",
      accent: "from-emerald-400 to-teal-500",
      iconBg: "bg-emerald-500",
      iconColor: "text-white",
      border: "border-emerald-200 dark:border-emerald-800"
    },
    {
      bg: "from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20",
      accent: "from-orange-400 to-red-500",
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      border: "border-orange-200 dark:border-orange-800"
    },
    {
      bg: "from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20",
      accent: "from-cyan-400 to-blue-500",
      iconBg: "bg-cyan-500",
      iconColor: "text-white",
      border: "border-cyan-200 dark:border-cyan-800"
    },
    {
      bg: "from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20",
      accent: "from-rose-400 to-pink-500",
      iconBg: "bg-rose-500",
      iconColor: "text-white",
      border: "border-rose-200 dark:border-rose-800"
    }
  ]

  const features = [
    {
      Icon: Brain,
      title: "AI Personas",
      desc: "Assign distinct roles — supportive, opposing, neutral or custom viewpoints to each agent.",
    },
    {
      Icon: Zap,
      title: "Dynamic Arguments",
      desc: "Agents generate concise bullet arguments, counter, and adapt reasoning in real time.",
    },
    {
      Icon: Users,
      title: "Consensus Synthesis",
      desc: "A summarizer AI analyzes transcripts and highlights agreements, disagreements and insights.",
    },
    {
      Icon: FileText,
      title: "Transcript History",
      desc: "Debates are recorded and searchable for later review and research.",
    },
    {
      Icon: MessageSquare,
      title: "Interactive UI",
      desc: "Animated avatars, live text flow, and adjustable debate duration for immersive exploration.",
    },
    {
      Icon: User,
      title: "Human → AI Debating",
      desc: "Engage directly with AI agents by presenting your own arguments and receiving structured, real-time counterpoints.",
    }
  ]

  return (
    <>
      <Head>
        <title>PrismMinds - AI-Powered Debate Platform for Critical Thinking</title>
        <meta name="description" content="Experience revolutionary AI debates with PrismMinds. Engage in Human vs AI discussions, explore multi-perspective arguments, and achieve consensus through structured, intelligent debates." />
        <meta name="keywords" content="AI debate platform, artificial intelligence debates, critical thinking, human vs AI, debate AI, consensus building, structured arguments, intelligent discussions" />
        <link rel="canonical" href="https://prismminds.vercel.app" />
      </Head>
      <main className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-[#fcfeff] via-[#eef2ff] to-[#fff6fb] text-slate-900 dark:bg-gradient-to-br dark:from-[#071124] dark:via-[#0b1220] dark:to-[#060611]">
        {/* Decorative UI background (radial blobs + subtle grid + grain) */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fcfeff] via-[#eef2ff] to-[#fff6fb] dark:from-transparent"></div>

          {/* Stronger radial color blobs for clear visibility with pulse animation */}
          <div className="absolute left-[-16%] top-[-16%] w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-[#9f7aea] to-[#fb7185] opacity-60 blur-[60px] animate-pulse-slow mix-blend-screen"></div>
          <div className="absolute right-[-10%] bottom-[-10%] w-[760px] h-[760px] rounded-full bg-gradient-to-tr from-[#34d399] to-[#60a5fa] opacity-50 blur-[70px] animate-pulse-slow delay-1000 mix-blend-screen"></div>

          <div className="absolute inset-0 pointer-events-none -z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/4 dark:to-black/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent mix-blend-overlay"></div>
          </div>

          {/* Subtle grid + film grain overlay for texture (more visible) */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth="1" />
              </pattern>
              <filter id="grain">
                <feTurbulence baseFrequency="0.6" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer><feFuncA type="linear" slope="0.03" /></feComponentTransfer>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.7" />
            <rect width="100%" height="100%" filter="url(#grain)" fill="transparent" opacity="0.8" />
          </svg>
        </div>

        {/* Frosted Glass Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg border-b border-slate-200/30 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 md:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow overflow-hidden bg-transparent">
                  <img
                    src="/mainlogo.png"   // your actual logo file path
                    alt="PrismMinds Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <span className="text-xl sm:text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  PrismMindsAI
                </span>
              </div>


              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/knowledgecenter"
                  className="
    text-slate-700 text-[16px] font-medium
    dark:text-slate-200
    hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500
    hover:bg-clip-text hover:text-transparent
    transition-all duration-300
  "
                >
                  Knowledge Center
                </Link>


                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="relative overflow-hidden text-slate-800 dark:text-slate-200 hover:text-white hover:no-underline transition-all duration-300 border border-purple-300/20 hover:bg-gradient-to-r from-purple-600 to-pink-600 hover:border-transparent hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] group"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-pink-600 border border-purple-400/30"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative overflow-hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
              >
                <Menu className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
              </button>
            </div>

            {/* Mobile Menu */}
            <motion.div
              initial={false}
              animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                <Link href="/knowledgecenter" className="block">
                  <Button
                    variant="ghost"
                    className="w-full text-left px-4 py-3 text-slate-800 dark:text-slate-200 hover:text-white transition-all duration-200"
                  >
                    Knowledge Center
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button
                    variant="ghost"
                    className="w-full relative overflow-hidden text-slate-800 dark:text-slate-200 hover:text-white transition-all duration-300 hover:bg-gradient-to-r from-purple-600 to-pink-600 group"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button
                    className="w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </nav>

        {/* Gradient Text Helper */}
        <style jsx>{`
        .gradient-text {
          background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 40%, #ec4899 60%, #06b6d4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

        {/* Hero Section */}
        <header className="pt-28 sm:pt-32 pb-20 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
          >
            Engage in <span className="gradient-text animate-shimmer-text">AI-Powered Debates</span>
            <br />
            and Reach <span className="gradient-text animate-shimmer-text">True Consensus</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
          >
            Witness structured, multi-perspective AI debates that analyze, challenge, and summarize complex ideas with
            clarity and balance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-105 group border border-purple-400/30 ring-2 ring-purple-500/20 hover:ring-purple-500/40"
              >
                <span className="relative z-10 flex items-center font-semibold tracking-wide">
                  Start Debating
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200 ml-2">→</span>
                </span>
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="ghost"
                className="relative overflow-hidden border border-purple-300/20 text-slate-800 dark:text-slate-200 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] group"
              >
                <span className="relative z-10">Know More</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* Quote Section */}

        <section className="pb-20 px-6 sm:px-8 relative font-['Merriweather',serif]">
          <motion.div
            className="max-w-3xl mx-auto text-center relative group"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* top decorative quote */}
            <motion.div
              className="absolute left-1/2 -top-5 transform -translate-x-1/2 text-5xl text-purple-300/40 transition-colors duration-500 group-hover:text-purple-400/60 font-light"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              "
            </motion.div>

            <motion.blockquote
              className={
                "relative rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/20 " +
                "backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] " +
                "p-10 sm:p-14 transition-all duration-500 ease-out " +
                "hover:scale-[1.01] hover:shadow-[0_20px_60px_rgba(147,51,234,0.1)] hover:border-purple-300/50 ring-1 ring-white/30 dark:ring-white/5"
              }
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

              <p className="relative z-10 text-xl sm:text-2xl md:text-[1.75rem] leading-relaxed font-light text-slate-800 dark:text-slate-100 tracking-wide text-pretty">
                See the&nbsp;
                <span className="italic font-medium bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  spectrum of thought
                </span>
                , not just the&nbsp;
                <span className="italic font-medium bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  single opinion
                </span>
                .&nbsp;
                <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  PrismMinds
                </span>
                &nbsp;is the AI-driven engine for&nbsp;
                <span className="italic font-medium bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  intellectual clarity
                </span>
                , building the path to&nbsp;
                <span className="italic font-medium bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  collective understanding
                </span>
                , one structured debate at a time.
              </p>

              <footer className="relative z-10 mt-10 text-sm sm:text-base text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] transition-colors duration-500 group-hover:text-purple-500/90 font-semibold flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-purple-400/50"></span>
                The Philosophy Behind PrismMinds
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-purple-400/50"></span>
              </footer>
            </motion.blockquote>

            {/* bottom decorative quote */}
            <motion.div
              className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 text-5xl text-purple-300/40 transition-colors duration-500 group-hover:text-purple-400/60 font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              "
            </motion.div>
          </motion.div>
        </section>




        {/* Features Section */}
        <section id="features" className="pb-24 px-6 sm:px-8">
          <div className="max-w-6xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose PrismMinds?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3">
              Built to make complex debates insightful, balanced, and beautifully interactive.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((f, i) => {
              const colorScheme = cardColors[i % cardColors.length]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} border-2 shadow-lg hover:shadow-2xl transform transition-all duration-300 group`}
                >
                  {/* Colorful accent corner */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${colorScheme.accent} opacity-10 rounded-bl-full`} />

                  {/* Icon at top center */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className={`p-3 rounded-xl ${colorScheme.iconBg} ${colorScheme.iconColor} shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <f.Icon className="w-7 h-7" />
                    </div>

                    <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100 group-hover:scale-105 transition-transform duration-300">
                      {f.title}
                    </h4>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  {/* Bottom accent bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorScheme.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center`} />
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Knowledge Center Intro */}
        <section id="knowledge-intro" className="py-2 px-6 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 lg:p-20 shadow-xl text-center"
            >
              {/* Background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-indigo-100/60 to-purple-100/70 dark:from-slate-900/70 dark:via-indigo-900/40 dark:to-purple-900/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/30 dark:to-transparent" />

              {/* Decorative blobs */}
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-indigo-300/30 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-purple-300/30 rounded-full blur-3xl opacity-35" />

              <div className="relative z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-gradient-to-r from-indigo-100/80 to-purple-100/80 border border-indigo-300/30 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-700/50">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Learn • Analyze • Improve
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent mb-4 leading-tight">
                  Knowledge Center
                </h2>

                {/* Description */}
                <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8">
                  Explore structured guides, debate frameworks, and curated learning
                  resources designed to sharpen reasoning and critical thinking.
                </p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link href="/knowledgecenter">
                    <Button
                      size="lg" /* Increased size for better touch targets on mobile */
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-[0_0_24px_rgba(99,102,241,0.45)] transition-all duration-300 hover:scale-105"
                    >
                      Explore Knowledge Center
                    </Button>
                  </Link>

                  <Link
                    href="/knowledgecenter"
                    className="text-indigo-600 dark:text-indigo-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium text-base"
                  >
                    Browse resources →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Us Showcase */}
        <section className="py-20 px-6 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
              Need Help or Want to Collaborate?
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our team would love to hear from you — questions, ideas, or partnership opportunities.
            </p>

            <div className="mt-8">
              <Link href="/contactus">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border-t border-slate-200/30 dark:border-slate-700/40 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-slate-700 dark:text-slate-300 gap-3">
            <p>&copy; {new Date().getFullYear()} PrismMinds</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                About
              </Link>
              <Link href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                Privacy
              </Link>
              <Link href="/contactus" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
