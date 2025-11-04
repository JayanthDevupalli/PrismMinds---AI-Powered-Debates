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
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent mb-4">
          Discover the Power of PrismMinds
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          The AI-driven platform turning debates into structured clarity. Learn faster, think deeper, and explore multiple perspectives effortlessly.
        </p>
      </motion.header>

      {/* Value Cards */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-24 max-w-6xl mx-auto"
      >
        {[
          {
            icon: <Sparkles size={28} className="text-rose-500" />,
            title: "AI-Enhanced Debates",
            desc: "Our dual-persona model simulates diverse viewpoints, powered by academic reasoning and logical contrast.",
          },
          {
            icon: <Target size={28} className="text-teal-500" />,
            title: "Focus & Clarity",
            desc: "We distill complex arguments into bite-sized summaries and highlight key takeaways automatically.",
          },
          {
            icon: <Layers size={28} className="text-indigo-500" />,
            title: "Multi-Layer Understanding",
            desc: "From quick overviews to deep dives — control how deep you want to go in a topic.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="p-8 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition"
          >
            <div className="flex justify-center mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-center bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
              {item.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Workflow Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto mb-24 text-center"
      >
        <h2 className="text-3xl font-semibold mb-10 text-indigo-600">
          How It Works — From Idea to Insight
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            {
              icon: <BookOpen size={28} className="text-rose-500" />,
              title: "1. Choose & Define",
              desc: "Pick your topic and customize AI personas representing different schools of thought.",
            },
            {
              icon: <Timer size={28} className="text-teal-500" />,
              title: "2. Simulate Debate",
              desc: "AI personas engage in structured argument, citing data and reasoning patterns.",
            },
            {
              icon: <Share2 size={28} className="text-indigo-500" />,
              title: "3. Summarize & Export",
              desc: "Generate clean summaries or export full transcripts as polished PDFs.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-gradient-to-br from-white/80 to-gray-50/40 dark:from-slate-800/50 dark:to-slate-900/40 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex justify-center mb-3">{s.icon}</div>
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">{s.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Advanced Features */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-24"
      >
        <h2 className="text-3xl font-semibold text-center mb-12 text-indigo-600">
          Advanced Capabilities
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <Users size={26} className="text-rose-500" />,
              title: "Persona Diversity",
              desc: "Choose debate tones: academic, journalistic, political, or philosophical for richer context.",
            },
            {
              icon: <Lightbulb size={26} className="text-teal-500" />,
              title: "Smart Summaries",
              desc: "AI moderator wraps every session with crisp, unbiased conclusions.",
            },
            {
              icon: <ShieldCheck size={26} className="text-indigo-500" />,
              title: "Ethical Reasoning",
              desc: "Each debate respects fairness principles and identifies potential biases.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-8 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 bg-white/70 dark:bg-gray-800/50 shadow-lg hover:shadow-xl backdrop-blur-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                {f.icon}
                <h3 className="text-lg font-semibold bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
                  {f.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
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
