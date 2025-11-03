"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  LightBulbIcon,
  BoltIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"

export default function Home() {
  const features = [
    {
      Icon: LightBulbIcon,
      title: "AI Personas",
      desc: "Assign distinct roles — supportive, opposing, neutral or custom viewpoints to each agent.",
    },
    {
      Icon: BoltIcon,
      title: "Dynamic Arguments",
      desc: "Agents generate concise bullet arguments, counter, and adapt reasoning in real time.",
    },
    {
      Icon: UserGroupIcon,
      title: "Consensus Synthesis",
      desc: "A summarizer AI analyzes transcripts and highlights agreements, disagreements and insights.",
    },
    {
      Icon: DocumentTextIcon,
      title: "Transcript History",
      desc: "Debates are recorded and searchable for later review and research.",
    },
    {
      Icon: ChatBubbleLeftRightIcon,
      title: "Interactive UI",
      desc: "Animated avatars, live text flow, and adjustable debate duration for immersive exploration.",
    },
  ]

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-slate-50 via-sky-50 to-pink-50 text-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      {/* SVG Prism Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute w-[150%] left-1/2 -translate-x-1/2 top-[-10%] opacity-60 dark:opacity-40"
          viewBox="0 0 1440 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="url(#grad1)"
            fillOpacity="0.7"
            d="M0,320L80,298.7C160,277,320,235,480,240C640,245,800,299,960,293.3C1120,288,1280,224,1360,192L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          >
            <animate
              attributeName="d"
              dur="16s"
              repeatCount="indefinite"
              values="
                M0,320L80,298.7C160,277,320,235,480,240C640,245,800,299,960,293.3C1120,288,1280,224,1360,192L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z;
                M0,320L80,310C160,300,320,250,480,260C640,270,800,330,960,320C1120,310,1280,220,1360,180L1440,140L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z;
                M0,320L80,298.7C160,277,320,235,480,240C640,245,800,299,960,293.3C1120,288,1280,224,1360,192L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z;
              "
            />
          </path>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Frosted Glass Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg border-b border-slate-200/30 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-sky-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold shadow">
              🧠
            </div>
            <span className="text-lg sm:text-xl font-semibold gradient-text hidden sm:block">PrismMinds</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-800 dark:text-slate-200">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-sm hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Gradient Text Helper */}
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 50%, #ec4899 100%);
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
          Engage in <span className="gradient-text">AI-Powered Debates</span>
          <br />
          and Reach <span className="gradient-text">True Consensus</span>
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
            <Button size="lg" className="bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-lg">
              Start Debating →
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="ghost" className="border-slate-300 text-slate-800 dark:text-slate-200">
              Learn More
            </Button>
          </a>
        </motion.div>
      </header>

      {/* Features Section */}
      <section id="features" className="pb-24 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold">Why Choose PrismMinds?</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3">
            Built to make complex debates insightful, balanced, and beautifully interactive.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl backdrop-blur-lg bg-white/40 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/40 shadow-md hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center bg-gradient-to-tr from-sky-400 to-pink-400 text-white">
                <f.Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center backdrop-blur-lg bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-slate-200/30 dark:border-slate-700/40 shadow-lg p-10">
          <h3 className="text-2xl font-bold mb-3">Join the Conversation</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Explore perspectives. Challenge assumptions. Discover truth through AI-driven dialogue.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-sky-500 to-pink-500 text-white shadow-md">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border-t border-slate-200/30 dark:border-slate-700/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-slate-700 dark:text-slate-300 gap-3">
          <p>© {new Date().getFullYear()} PrismMinds — Enhancing Human Understanding.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              About
            </Link>
            <Link href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
