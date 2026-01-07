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
  Sparkles,
  ArrowRight
} from "lucide-react"

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const features = [
    {
      Icon: Brain,
      title: "AI Personas",
      desc: "Assign distinct roles—supportive, opposing, neutral, or custom viewpoints to each agent.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      Icon: Zap,
      title: "Dynamic Arguments",
      desc: "Agents generate concise bullet arguments, counter, and adapt reasoning in real time.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      Icon: Users,
      title: "Consensus Synthesis",
      desc: "A summarizer AI analyzes transcripts and highlights agreements, disagreements, and insights.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      Icon: FileText,
      title: "Interactive UI",
      desc: "Animated avatars, live text flow, and adjustable debate duration for immersive exploration.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      Icon: MessageSquare,
      title: "Human → AI Debating",
      desc: "Engage directly with AI agents by presenting your own arguments to structured counterpoints.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      Icon: User,
      title: "Spectrum of Thought",
      desc: "See the spectrum of thought, not just the single opinion. Build paths to collective understanding.",
      color: "bg-orange-50 text-orange-600"
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

      <main className="min-h-screen relative overflow-x-hidden bg-[#fafafa] text-slate-800 font-sans selection:bg-orange-200 selection:text-orange-900 bg-noise">

        {/* Ambient Background Texture */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[#fafafa]">
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-gradient-to-bl from-orange-100/40 via-amber-50/20 to-transparent blur-[120px] rounded-full mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-gradient-to-tr from-slate-200/40 via-zinc-100/50 to-transparent blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        {/* Clean Bubbled Navbar */}
        <nav className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border border-white/60 shadow-md rounded-full py-2 px-6 sm:px-8 transition-all duration-300 hover:shadow-lg hover:bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center overflow-hidden p-1">
                  <img src="/mainlogo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  PrismMinds
                </span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-3">
                <Link href="/knowledgecenter" className="text-sm font-medium text-slate-600 hover:text-orange-600 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
                  Knowledge
                </Link>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-orange-600 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
                  Login
                </Link>
                <Link href="/register">
                  <Button className="rounded-full bg-slate-900 text-white hover:bg-orange-500 hover:text-white border-0 shadow-lg shadow-slate-900/10 transition-all duration-300 px-6">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown (Bubble) */}
          <motion.div
            initial={false}
            animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 10 : -20, display: isMobileMenuOpen ? "block" : "none" }}
            className="md:hidden absolute top-20 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-[2rem] p-6 text-center"
          >
            <nav className="flex flex-col gap-4">
              <Link href="/knowledgecenter" className="p-3 bg-slate-50 rounded-2xl text-slate-700 font-medium">Knowledge Center</Link>
              <Link href="/login" className="p-3 bg-slate-50 rounded-2xl text-slate-700 font-medium">Login</Link>
              <Link href="/register" className="p-3 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20">Get Started</Link>
            </nav>
          </motion.div>
        </nav>

        {/* HERO SECTION: "The Golden Standard" */}
        <header className="relative pt-40 pb-20 px-6 min-h-[90vh] flex items-center">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

            {/* Content Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 border border-orange-200 text-orange-700 text-xs font-bold tracking-wider uppercase mb-8 mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5" />
                Multi-Perspective AI
              </div>

              <h1 className="text-5xl sm:text-6xl/tight lg:text-7xl/tight font-extrabold text-slate-900 mb-8 tracking-tight">
                Engage in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
                  AI Debates
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Witness structured, multi-perspective AI debates that analyze, challenge, and summarize complex ideas with clarity and balance.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="rounded-full h-14 px-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all text-lg font-semibold cursor-pointer relative overflow-hidden group">
                    <span className="relative z-10">Start Debating</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="ghost" size="lg" className="rounded-full h-14 px-8 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 text-lg group border border-transparent hover:border-slate-200 transaction-all duration-300">
                    How it works <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Visual Bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[400px] lg:h-[550px] flex items-center justify-center p-6 lg:p-0"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 via-amber-100 to-transparent opacity-30 rounded-full blur-[80px] animate-pulse-slow"></div>
              <img
                src="/hero_avatars_gold.png"
                alt="AI Avatars Debating"
                className="relative w-full h-full object-cover shadow-2xl z-10 animate-float-complex rounded-[4rem] border-[8px] border-orange-200"
              />
            </motion.div>
          </div>
        </header>


        {/* Quote Section - Floating Card */}
        <section className="hidden md:block py-24 px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative bg-white/80 backdrop-blur-md rounded-[3rem] p-12 sm:p-20 shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-center border-[3px] border-slate-200/80">
              <div className="absolute top-10 left-10 text-6xl text-slate-200 font-serif">"</div>
              <blockquote className="text-2xl sm:text-4xl font-light text-slate-800 leading-relaxed font-serif relative z-10">
                True intelligence isn't about having all the answers. It's about asking the <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600 font-medium">right questions</span>.
              </blockquote>
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-slate-300"></div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">PrismMinds Philosophy</span>
                <div className="h-px w-12 bg-slate-300"></div>
              </div>
            </div>
          </motion.div>
        </section>


        {/* Features - Bento Grid Style */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Use PrismMinds?</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">Powerful tools that are easy to use.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.15)" }}
                  className="group p-6 rounded-[2rem] bg-white border-2 border-slate-100 hover:border-orange-200 shadow-sm transition-all duration-300 relative overflow-hidden"
                >
                  {/* Spotlight Gradient on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_at_center,rgba(255,165,0,0.08),transparent)] pointer-events-none"></div>

                  <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 text-current group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                    <f.Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors relative z-10">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm relative z-10">
                    {f.desc}
                  </p>

                  {/* Subtle corner gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-50/50 to-transparent rounded-bl-[100px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Knowledge Hub - Asymmetrical Layout */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] text-white p-8 sm:p-16 lg:p-24 relative overflow-hidden shadow-2xl">
            {/* Background Accents */}
            {/* Background Accents with Glass Effect */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/30 opacity-30 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 opacity-20 blur-[120px] rounded-full mix-blend-screen"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 text-center lg:text-left">
                <div className="w-16 h-1 bg-orange-500 mb-8 rounded-full mx-auto lg:mx-0"></div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">Learn How to <br /> Think Better</h2>
                <p className="text-slate-300 text-lg mb-10 leading-relaxed opacity-90">
                  Check out our library of thinking tools. Learn how to ask better questions and build stronger arguments.
                </p>
                <Link href="/knowledgecenter">
                  <Button className="bg-white text-slate-900 hover:bg-orange-50 rounded-full px-10 py-6 text-lg font-bold shadow-lg shadow-white/10 transition-all hover:scale-105">
                    Open Library
                  </Button>
                </Link>
              </div>

              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <img
                  src="/knowledge_light_hub.png"
                  alt="Knowledge Tree 3D"
                  className="w-full max-w-md object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-morph-scale rounded-[3rem] border-4 border-white/20 bg-white/5"
                />
              </div>
            </div>
          </div>
        </section>


        {/* Contact & Community - The "Lighter Prism" */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto relative rounded-[2.5rem] p-1 bg-gradient-to-br from-orange-200 via-amber-100 to-orange-200 shadow-2xl">
            <div className="relative rounded-[2.4rem] bg-white/80 backdrop-blur-xl overflow-hidden text-center sm:text-left isolate">

              {/* Subtle Ambient Background */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/40 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

              <div className="grid lg:grid-cols-5 gap-12 p-10 sm:p-14 w-full items-center">
                <div className="lg:col-span-3">
                  <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                    Ready to Expand <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                      Your Perspective?
                    </span>
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed max-w-lg mb-8">
                    Join a community of thinkers. Shape the future of discourse today.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <Link href="/register">
                      <Button className="rounded-full h-14 px-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-lg font-bold hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all">
                        Get Started Now
                      </Button>
                    </Link>
                    <Link href="/contactus">
                      <Button variant="outline" className="rounded-full h-14 px-8 border-slate-200 text-slate-600 text-lg font-medium hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Decorative Element - Cleaner & lighter */}
                <div className="lg:col-span-2 flex justify-center lg:justify-end">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <div className="absolute inset-0 border-[3px] border-orange-100 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border-[3px] border-amber-50 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="relative z-10 p-6 text-center bg-white rounded-full shadow-xl border border-orange-50">
                      <span className="block text-4xl font-bold text-slate-900 mb-1">24/7</span>
                      <span className="text-xs text-orange-500 font-bold tracking-wider uppercase">Global Support</span>
                    </div>
                  </div>
                </div>
              </div>
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
      </main >
    </>
  )
}
