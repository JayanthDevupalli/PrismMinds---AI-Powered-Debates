'use client';

import Head from 'next/head';
import { motion, useScroll, useTransform } from "framer-motion";
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
  ChevronDown,
  BarChart3,
  Gauge,
  TrendingUp,
  Award,
  Rocket,
  Lock,
  Check,
  Star,
  Globe,
  Download,
  Search,
  Heart,
  Mic
} from "lucide-react";
import { useState, useRef } from "react";

export default function FeaturesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Features - PrismMinds AI Debate Platform</title>
        <meta name="description" content="Discover the powerful features of PrismMinds: AI personas, dynamic arguments, consensus synthesis, transcript history, interactive UI, and human-AI debating capabilities." />
        <meta name="keywords" content="AI debate features, debate platform features, AI personas, dynamic arguments, consensus synthesis, debate transcripts, interactive debating" />
        <meta property="og:title" content="Features - PrismMinds AI Debate Platform" />
        <meta property="og:description" content="Explore the comprehensive features that make PrismMinds the leading AI-powered debate platform for critical thinking and consensus building." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prismminds.vercel.app/features" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Features - PrismMinds AI Debate Platform" />
        <meta name="twitter:description" content="Discover the powerful features of PrismMinds AI debate platform." />
        <link rel="canonical" href="https://prismminds.vercel.app/features" />
      </Head>
      <main ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900 text-gray-800 dark:text-gray-200 font-['Inter',sans-serif]">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50 sm:opacity-100">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-300/20 to-pink-300/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 right-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 px-4 sm:px-10 lg:px-20 py-6 sm:py-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.header
          className="max-w-5xl mx-auto text-center mb-12 sm:mb-20"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 blur-3xl opacity-40 animate-pulse" />
              <Brain size={56} className="relative text-indigo-600 dark:text-indigo-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Think Smarter.
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Debate Better.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto px-2"
          >
            PrismMinds transforms complex topics into structured AI debates, helping you explore multiple perspectives and make informed decisions with confidence.
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-6"
          >
            {[
              { value: "50+", label: "Debates Generated" },
              { value: "95%", label: "User Satisfaction" },
              { value: "Real-time", label: "AI Response" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.header>

        {/* Video Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-5xl mx-auto mb-12 sm:mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/30 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/kmZmHXnnvzs"
                  allowFullScreen
                  title="PrismMinds Demo"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Core Value Proposition */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-7xl mx-auto mb-20 sm:mb-32"
        >
          <div className="text-center mb-10 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4"
            >
              <Star size={16} />
              Why Choose PrismMinds
            </motion.div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Structured Intelligence at Your Fingertips
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the power of AI-driven debates that break down complexity and illuminate every angle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target size={32} className="text-rose-500" />,
                title: "Multi-Perspective Analysis",
                description: "Every topic examined from opposing viewpoints with structured reasoning and evidence-based arguments.",
                color: "rose"
              },
              {
                icon: <Gauge size={32} className="text-purple-500" />,
                title: "Real-Time Intelligence",
                description: "Instant AI-powered debates that adapt to your questions, delivering insights within seconds.",
                color: "purple"
              },
              {
                icon: <Award size={32} className="text-indigo-500" />,
                title: "Actionable Insights",
                description: "Clear summaries and takeaways that help you make informed decisions with confidence.",
                color: "indigo"
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`} />
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 h-full">
                  <div className="mb-4 inline-block p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Interactive Feature Showcase */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-7xl mx-auto mb-20 sm:mb-32"
        >
          <div className="text-center mb-10 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-4"
            >
              <Rocket size={16} />
              Powerful Features
            </motion.div>
            <h2 className="text-2xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Everything You Need to Master Any Topic
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[
              {
                icon: <MessageSquareMore size={28} />,
                title: "AI vs AI Debates",
                description: "Watch two AI personas engage in structured debates on any topic. Choose their personalities (Support, Against) and let them explore every angle.",
                features: ["Custom persona selection", "Adjustable debate duration", "Structured argumentation"],
                gradient: "from-indigo-500 to-purple-600"
              },
              {
                icon: <Mic size={28} />,
                title: "Human vs AI Challenges",
                description: "Test your arguments against an AI opponent. Get real-time rebuttals and receive detailed performance analytics after each debate.",
                features: ["Live counter-arguments", "Performance audit reports", "Skill improvement tracking"],
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: <BarChart3 size={28} />,
                title: "Performance Analytics",
                description: "Your personal PrismMinds AI Coach analyzes your entire debate performance, providing comprehensive feedback on your argumentation skills, logical reasoning, and areas for improvement.",
                features: ["AI Coach insights", "Detailed metrics dashboard", "Strengths & weaknesses analysis"],
                gradient: "from-teal-500 to-emerald-600"
              },
              {
                icon: <BookOpen size={28} />,
                title: "Smart Library & Export",
                description: "Organize your intellectual journey with favorites, advanced search, and professional PDF exports for offline study and sharing.",
                features: ["One-click PDF generation", "Favorite debates collection", "Advanced search filters"],
                gradient: "from-rose-500 to-pink-600"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur transition duration-500 rounded-2xl" style={{
                  background: `linear-gradient(to right, var(--tw-gradient-stops))`
                }} />
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 h-full">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className={`p-1 rounded-full bg-gradient-to-r ${feature.gradient}`}>
                          <Check size={12} className="text-white" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              How PrismMinds Works
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Simple and powerful - get started in 3 easy steps
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                number: "1",
                icon: <BookOpen className="w-8 h-8" />,
                title: "Choose Your Topic",
                description: "Enter any question or topic you want to explore. Select AI personas or join the debate yourself.",
                color: "indigo"
              },
              {
                number: "2",
                icon: <Sparkles className="w-8 h-8" />,
                title: "Watch AI Debate",
                description: "AI personas engage in structured debate, exploring multiple perspectives with evidence and reasoning.",
                color: "purple"
              },
              {
                number: "3",
                icon: <Target className="w-8 h-8" />,
                title: "Get Clear Insights",
                description: "Receive summaries, key themes, and actionable insights to guide your understanding and decisions.",
                color: "pink"
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group"
              >
                {/* Number Circle */}
                <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl text-white
                  ${step.color === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : ''}
                  ${step.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                  ${step.color === 'pink' ? 'bg-gradient-to-br from-pink-500 to-pink-600' : ''}
                  shadow-lg group-hover:scale-110 transition-transform`}>
                  {step.number}
                </div>

                {/* Content Card */}
                <div className="flex-1 p-4 sm:p-6 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 
                  group-hover:shadow-xl group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`
                      ${step.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : ''}
                      ${step.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : ''}
                      ${step.color === 'pink' ? 'text-pink-600 dark:text-pink-400' : ''}
                    `}>
                      {step.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trust & Security */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-6xl mx-auto mb-16 sm:mb-20"
        >
          <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                    <Lock size={14} className="sm:w-4 sm:h-4" />
                    Trust & Reliability
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    Built on Principles of Fairness & Accuracy
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                    Our AI models are trained on diverse, verified sources to ensure balanced perspectives. Every debate includes built-in bias detection and ethical reasoning checks.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-white">
                      <Check size={20} className="text-green-400" />
                      <span>Verified Data Sources</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Check size={20} className="text-green-400" />
                      <span>Bias Detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Check size={20} className="text-green-400" />
                      <span>Privacy Protected</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <ShieldCheck size={24} />, label: "Ethical AI", desc: "Fair & unbiased" },
                    { icon: <Globe size={24} />, label: "Global Data", desc: "Diverse sources" },
                    { icon: <Lock size={24} />, label: "Secure", desc: "Privacy first" },
                    { icon: <Users size={24} />, label: "Community", desc: "Trusted by thousands" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="p-5 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <div className="text-indigo-400 mb-2 sm:mb-3">{item.icon}</div>
                      <div className="text-white font-semibold mb-1">{item.label}</div>
                      <div className="text-gray-400 text-sm">{item.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Find answers to common questions about PrismMinds
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How accurate are the AI-generated debates?",
                a: "Our AI models are trained on extensive verified datasets and use advanced reasoning techniques. While highly accurate, debates are designed to encourage critical thinking and should complement, not replace, human judgment and research.",
                icon: <ShieldCheck className="w-5 h-5" />
              },
              {
                q: "Can I customize the debate personas?",
                a: "Absolutely! You can adjust persona tones (logical, emotional, neutral), set debate duration, choose specific viewpoints, and even provide custom context to align debates with your specific needs and goals.",
                icon: <Users className="w-5 h-5" />
              },
              {
                q: "How does the performance audit work in Human vs AI mode?",
                a: "After each debate, our AI analyzes your arguments, reasoning patterns, and debate effectiveness. You receive detailed metrics on argumentation quality, logical consistency, evidence usage, and personalized recommendations for improvement.",
                icon: <BarChart3 className="w-5 h-5" />
              },
              {
                q: "Can I export and share my debates?",
                a: "Yes! All debates can be exported as professionally formatted PDFs with one click. You can also save debates to your favorites library and search through your entire debate history.",
                icon: <Download className="w-5 h-5" />
              },
              {
                q: "Is my data private and secure?",
                a: "Privacy is our top priority. All your debates and personal data are encrypted and stored securely. We never share your information with third parties, and you have full control over your data.",
                icon: <Lock className="w-5 h-5" />
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group"
              >
                <div
                  onClick={() => toggleAccordion(i)}
                  className={`bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 border-2 cursor-pointer transition-all ${openIndex === i
                    ? 'border-indigo-400 dark:border-indigo-600 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-0.5 flex-shrink-0 transition-colors ${openIndex === i
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-400 dark:text-gray-600'
                        }`}>
                        {faq.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base sm:text-lg transition-colors ${openIndex === i
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-900 dark:text-white'
                          }`}>
                          {faq.q}
                        </h3>
                        <motion.div
                          initial={false}
                          animate={{
                            height: openIndex === i ? "auto" : 0,
                            opacity: openIndex === i ? 1 : 0,
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed pt-3">
                            {faq.a}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-colors ${openIndex === i
                          ? "text-indigo-500 dark:text-indigo-400"
                          : "text-gray-400 dark:text-gray-600"
                          }`}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500" />
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-block mb-6"
              >
                <Zap size={48} className="text-yellow-500" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Ready to Transform How You Think?
              </h2>

              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Join thousands of users who are making smarter decisions through AI-powered debates
              </p>

              <Link href="/login" className="block sm:inline-block w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white shadow-2xl hover:shadow-rose-500/50 transition-all"
                >
                  Start Your First Debate
                </motion.button>
              </Link>

              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                No credit card required • Free to start • Instant access
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
    </>
  );
}
