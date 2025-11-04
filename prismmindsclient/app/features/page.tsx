'use client';

import { motion } from "framer-motion"
import Link from 'next/link';
import { 
  ArrowLeft,
  Brain,
  Clock,
  FileText,
  Share2,
  Sparkles,
  MessageSquareMore,
  Zap,
  Target,
  Timer,
  BookOpen,
  Lightbulb,
  ScrollText,
  CheckCircle2
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-teal-100/40 to-indigo-100/40 dark:from-slate-900 dark:via-purple-900/40 dark:to-slate-900 text-gray-800 dark:text-gray-200 px-6 sm:px-10 lg:px-20 py-16">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center mb-16"
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <Brain size={60} className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500" />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent mb-4">
          PrismMinds — Features
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          AI-powered debates made simple. Get clear summaries, focused persona arguments, and export-ready transcripts to
          understand complex topics faster.
        </p>
      </motion.header>

      {/* Why Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto mb-20 text-center"
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Why PrismMinds?</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          PrismMinds turns complicated discussions into short, digestible arguments. Our AI uses plain language and
          practical examples so you can grasp every viewpoint effortlessly.
        </p>
      </motion.section>

      {/* Steps Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto mb-20"
      >
        <h2 className="text-2xl font-semibold mb-8 text-indigo-600 text-center">
          How It Works — In 3 Simple Steps
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "1. Choose a Topic & Personas",
              desc: "Pick your subject and two opposing viewpoints. Our AI prepares each persona with a distinct voice.",
            },
            {
              title: "2. Set Duration",
              desc: "Control debate depth with duration — longer debates mean richer arguments without the bloat.",
            },
            {
              title: "3. Read or Export",
              desc: "View clear transcripts, moderator summaries, and export PDFs for easy sharing.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl shadow-lg bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:shadow-indigo-300/20 transition"
            >
              <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-400 mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Key Features */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-20"
      >
        <h2 className="text-2xl font-semibold text-center mb-10 text-indigo-600">Key Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <MessageSquareMore size={24} className="text-rose-500" />,
              title: "Plain-language Output",
              desc: "AI writes in short, simple sentences and explains jargon clearly.",
              gradient: "from-rose-500/10 to-transparent"
            },
            {
              icon: <Timer size={24} className="text-emerald-500" />,
              title: "Controlled Length",
              desc: "Smart length balancing for focused, non-repetitive debates.",
              gradient: "from-emerald-500/10 to-transparent"
            },
            {
              icon: <Lightbulb size={24} className="text-teal-500" />,
              title: "Moderator Summary",
              desc: "2–3 sentence takeaways highlighting main points and conclusions.",
              gradient: "from-teal-500/10 to-transparent"
            },
            {
              icon: <Share2 size={24} className="text-indigo-500" />,
              title: "Export & Share",
              desc: "Download clean, formatted PDFs for study or presentation.",
              gradient: "from-indigo-500/10 to-transparent"
            },
          ].map((f, i) => (
            <motion.article
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`p-6 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-md bg-gradient-to-br ${f.gradient} backdrop-blur-sm hover:shadow-lg transition duration-300`}
            >
              <div className="flex items-center gap-3 mb-3">
                {f.icon}
                <h3 className="text-lg font-semibold bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">{f.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* Examples */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mb-20"
      >
        <h2 className="text-2xl font-semibold mb-6 text-indigo-600 text-center">Examples & Tips</h2>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Make prompts specific:</strong> Instead of “Climate change”, try “Should cities ban cars downtown to
            reduce pollution?” — you’ll get more actionable debates.
          </li>
          <li>
            <strong>Short durations:</strong> Perfect for class warm-ups or quick overviews.
          </li>
          <li>
            <strong>Longer durations:</strong> Use when exploring trade-offs deeply — summaries keep things concise.
          </li>
        </ul>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto mb-20"
      >
        <h2 className="text-2xl font-semibold text-indigo-600 text-center mb-10">Frequently Asked Questions</h2>
        <dl className="space-y-8">
          {[
            {
              q: "Will the AI always be accurate?",
              a: "We aim for balanced, reasonable arguments — but debates are conversation starters, not final sources.",
            },
            {
              q: "How do you keep language simple?",
              a: "We instruct the AI to use short sentences and explain any technical term immediately for clarity.",
            },
            {
              q: "What if the transcript is too long?",
              a: "We cap exchanges and sentence length. Reduce duration or enable compact summaries (coming soon).",
            },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 shadow-sm backdrop-blur border border-gray-200 dark:border-gray-700">
              <dt className="font-semibold text-indigo-700 dark:text-indigo-400">{item.q}</dt>
              <dd className="text-gray-600 dark:text-gray-300 mt-2">{item.a}</dd>
            </motion.div>
          ))}
        </dl>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="max-w-3xl mx-auto">
          <Zap size={32} className="inline-block text-yellow-500 mb-4" />
          <p className="text-xl mb-6 bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
            Ready to experience AI-powered debates?
          </p>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-rose-500 via-teal-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              Try PrismMinds Now
            </motion.button>
          </Link>
        </div>
      </motion.footer>
    </main>
  )
}
