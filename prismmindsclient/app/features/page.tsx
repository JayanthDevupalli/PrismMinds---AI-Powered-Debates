'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Zap,
  Sparkles,
  Share2,
  Timer,
  Lightbulb,
  MessageSquareMore,
  Target,
  BookOpen,
  Layers,
  Users,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function FeaturesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-teal-50 to-rose-50 dark:from-slate-950 dark:via-purple-900/40 dark:to-slate-900 text-gray-800 dark:text-gray-200 px-6 sm:px-10 lg:px-20 py-16 font-['Inter',sans-serif]">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center mb-24"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 blur-2xl opacity-30 rounded-full" />
            <Brain
              size={70}
              className="relative text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500"
            />
          </motion.div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent mb-4 mt-[-50px]">
          Discover the Power of PrismMinds
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          The AI-driven platform turning debates into structured clarity. Learn faster, think deeper, and explore multiple perspectives effortlessly.
        </p>
      </motion.header>
      {/* VIDEO SECTION – Clean Centered Viewer */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mb-20 px-2"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 140 }}
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-200/30 
               dark:border-gray-700/30 bgw-white/40 dark:bg-gray-800/40 backdrop-blur-md"
        >
          <div className="relative aspect-video w-full">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/kmZmHXnnvzs"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </motion.section>


      {/* Value Cards */}
      {/* Value Cards — New Futuristic Layout */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-28"
      >
        <h2 className="text-3xl font-semibold text-center mb-14 bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
          Why PrismMinds Stands Out
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Sparkles size={28} />,
              title: "AI-Enhanced Debates",
              desc: "Dual-persona reasoning that explores multiple viewpoints with structured logic.",
            },
            {
              icon: <Target size={28} />,
              title: "Focus & Clarity",
              desc: "Complex arguments distilled into clean summaries and focused insights.",
            },
            {
              icon: <Layers size={28} />,
              title: "Layered Understanding",
              desc: "Choose the depth — from quick takeaways to deep analytical dives.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 160 }}
              className="relative p-8 rounded-2xl bg-white/50 dark:bg-gray-900/40 shadow-xl border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-xl"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-300">
                  {item.icon}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center mb-2 bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
                {item.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>


      {/* Workflow Section */}
      {/* Workflow — Sleek Step Layout */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto mb-28"
      >
        <h2 className="text-3xl font-semibold text-center mb-14 bg-gradient-to-r from-indigo-500 via-teal-500 to-rose-500 bg-clip-text text-transparent">
          How PrismMinds Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <BookOpen size={28} />,
              title: "Choose & Define",
              desc: "Select your topic and configure debate personas.",
            },
            {
              icon: <Timer size={28} />,
              title: "Simulate Debate",
              desc: "AI personas engage in structured reasoning.",
            },
            {
              icon: <Share2 size={28} />,
              title: "Summarize & Export",
              desc: "Get clean summaries or export as polished PDFs.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="p-8 rounded-xl bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/40 shadow-lg text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5 backdrop-blur-md shadow-sm border border-white/30">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-300">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>


      {/* Advanced Features */}
      {/* Advanced Capabilities — New Premium Frosted Style */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-28"
      >
        <h2 className="text-3xl font-semibold text-center mb-14 bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500 bg-clip-text text-transparent">
          Advanced Capabilities
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Users size={24} className="text-rose-500" />,
              title: "Persona Diversity",
              desc: "Choose tones: academic, journalistic, political, or philosophical for richer context.",
            },
            {
              icon: <Lightbulb size={24} className="text-teal-500" />,
              title: "Smart Summaries",
              desc: "AI moderator synthesizes unbiased conclusions automatically.",
            },
            {
              icon: <ShieldCheck size={24} className="text-indigo-500" />,
              title: "Ethical Reasoning",
              desc: "Built-in fairness checks that identify potential bias in arguments.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 180 }}
              className="p-8 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-white/30 dark:border-gray-700/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition"
            >
              {/* ICON — Frosted Glass Badge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border border-white/40 dark:border-gray-700/40 shadow-sm">
                  {f.icon}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {f.title}
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>




      {/* Dashboard & Tools Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-28"
      >
        <h2 className="text-3xl font-semibold text-center mb-14 bg-gradient-to-r from-rose-500 via-indigo-500 to-teal-500 bg-clip-text text-transparent">
          Dashboard Power Tools
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 rounded-2xl bg-white/60 dark:bg-gray-900/50 border border-indigo-100 dark:border-indigo-900/30 shadow-lg backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <MessageSquareMore size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Human vs. AI Mode
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Step into the arena yourself. Challenge an AI persona directly in real-time debates to test your arguments against an infinitely knowledgeable opponent.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Real-time counter-arguments
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Personalized feedback loop
              </li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 rounded-2xl bg-white/60 dark:bg-gray-900/50 border border-teal-100 dark:border-teal-900/30 shadow-lg backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-lg">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Library & Export
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Your intellectual journey, organized. Save your favorite debates, search through history, and export professional PDF transcripts for offline study.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                One-click PDF download
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Favorites & Smart Search
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Accordion */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mb-24"
      >
        <h2 className="text-3xl font-semibold text-center mb-10 text-indigo-600">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Is the AI always accurate?",
              a: "Our models simulate reasoning across multiple verified data sources. While precise, debates are designed to encourage critical thinking, not replace human judgment.",
            },
            {
              q: "Can I customize the personas?",
              a: "Yes! You can adjust persona tones (logical, emotional, or neutral) and even upload custom context to align with your goals.",
            },
            {
              q: "How does summarization work?",
              a: "An AI moderator listens to both sides and creates a concise synthesis — separating facts from rhetoric with academic precision.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              layout
              onClick={() => toggleAccordion(i)}
              className="bg-white/70 dark:bg-gray-800/60 rounded-xl p-6 shadow-md backdrop-blur border border-gray-200 dark:border-gray-700 cursor-pointer transition hover:shadow-lg"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-indigo-700 dark:text-indigo-400">{faq.q}</h3>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${openIndex === i ? "rotate-180 text-indigo-500" : "text-gray-400"
                    }`}
                />
              </div>
              <motion.div
                initial={false}
                animate={{ height: openIndex === i ? "auto" : 0, opacity: openIndex === i ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden text-gray-600 dark:text-gray-300 mt-3"
              >
                <p>{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto"
      >
        <Zap size={36} className="inline-block text-yellow-500 mb-4" />
        <p className="text-xl mb-6 bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
          Ready to experience the next era of structured AI debates?
        </p>
        <Link href="/login">
          <motion.button
            animate={{
              scale: [1, 1.07, 1], // expands & shrinks smoothly
              boxShadow: [
                "0 0 0px rgba(0,0,0,0)",
                "0 0 25px rgba(147, 51, 234, 0.5)", // subtle glow
                "0 0 0px rgba(0,0,0,0)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.12,
              boxShadow: "0 0 30px rgba(147, 51, 234, 0.8)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 text-white shadow-lg hover:shadow-2xl transition-all"
          >
            Try PrismMinds Now
          </motion.button>
        </Link>

      </motion.footer>
    </main>
  );
}
