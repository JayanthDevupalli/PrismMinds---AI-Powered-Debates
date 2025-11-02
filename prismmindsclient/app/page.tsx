// "use client"

// import { motion } from "framer-motion"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 text-gray-900 overflow-hidden relative">
//       {/* Soft glowing background shapes */}
//       <div className="absolute inset-0 overflow-hidden -z-10">
//         <div className="absolute top-20 left-[-5rem] w-96 h-96 bg-sky-200/40 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-10 right-[-5rem] w-[28rem] h-[28rem] bg-pink-200/40 rounded-full blur-3xl animate-pulse" />
//       </div>

//       {/* Navbar */}
//       <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-gray-200/60">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <motion.div
//               initial={{ rotate: -20, opacity: 0 }}
//               animate={{ rotate: 0, opacity: 1 }}
//               transition={{ duration: 0.8 }}
//               className="w-9 h-9 bg-gradient-to-br from-sky-400 to-pink-400 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-md"
//             >
//               🧠
//             </motion.div>
//             <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-pink-600">
//               PrismMinds
//             </span>
//           </div>
//           <div className="flex gap-3">
//             <Link href="/login">
//               <Button variant="ghost" className="text-gray-800 hover:text-sky-600">Login</Button>
//             </Link>
//             <Link href="/register">
//               <Button className="bg-gradient-to-r from-sky-500 to-pink-500 text-white hover:opacity-90">
//                 Get Started
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="pt-40 pb-28 text-center">
//         <motion.h1
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//           className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight"
//         >
//           Explore <span className="bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent">AI-driven debates</span>
//           <br />
//           that reveal <span className="text-gray-800">every side of the story</span>.
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.8 }}
//           className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10"
//         >
//           Watch multiple AI agents discuss complex topics from diverse perspectives, counter one another intelligently,
//           and work together to reach common ground — enhancing your understanding through structured reasoning.
//         </motion.p>

//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="flex justify-center gap-4"
//         >
//           <Link href="/register">
//             <Button size="lg" className="bg-gradient-to-r from-sky-500 to-pink-500 text-white">
//               Start Exploring →
//             </Button>
//           </Link>
//           <Link href="#features">
//             <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
//               Learn More
//             </Button>
//           </Link>
//         </motion.div>
//       </section>

//       {/* Concept Visualization: Debate Preview */}
//       <section className="py-20 px-6">
//         <div className="max-w-4xl mx-auto rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl p-8">
//           <h2 className="text-3xl font-semibold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-pink-600">
//             How Multi-Perspective Debating Works
//           </h2>

//           <div className="space-y-4 text-gray-700">
//             <motion.div
//               initial={{ x: -80, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 w-fit max-w-[80%]"
//             >
//               <strong>Agent A (Supportive):</strong> “AI can accelerate creative problem-solving across industries.”
//             </motion.div>

//             <motion.div
//               initial={{ x: 80, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-3 ml-auto w-fit max-w-[80%]"
//             >
//               <strong>Agent B (Opposing):</strong> “But it risks homogenizing creativity by reinforcing patterns.”
//             </motion.div>

//             <motion.div
//               initial={{ x: -80, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               transition={{ delay: 0.8 }}
//               className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 w-fit max-w-[80%]"
//             >
//               <strong>Agent C (Analyst):</strong> “Both points hold value — synergy between AI and human intuition may redefine creativity.”
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-24 bg-gradient-to-br from-white to-sky-50 border-t border-gray-100">
//         <h2 className="text-4xl font-bold text-center mb-16">Why Choose PrismMinds?</h2>

//         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
//           {[
//             {
//               icon: "🤖",
//               title: "AI Personas with Roles",
//               description:
//                 "Assign AI agents unique perspectives — supporting, opposing, neutral, or custom viewpoints — to simulate real debates.",
//             },
//             {
//               icon: "💬",
//               title: "Dynamic Argument Flow",
//               description:
//                 "Each AI listens, responds, and refines its reasoning as the debate progresses, ensuring meaningful interaction.",
//             },
//             {
//               icon: "🔍",
//               title: "Consensus Summarization",
//               description:
//                 "A summarizer AI reviews the debate to highlight key arguments, points of agreement, and collective insights.",
//             },
//           ].map((f, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.2 }}
//               whileHover={{ scale: 1.05 }}
//               className="p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-xl transition-all"
//             >
//               <div className="text-5xl mb-4">{f.icon}</div>
//               <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
//               <p className="text-gray-600">{f.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="py-24 text-center px-6">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-3xl mx-auto bg-gradient-to-r from-sky-100 via-white to-pink-100 p-12 rounded-3xl shadow-md border border-gray-200"
//         >
//           <h2 className="text-3xl font-bold mb-4 text-gray-800">
//             Ready to see debates like never before?
//           </h2>
//           <p className="text-gray-600 mb-8">
//             Join PrismMinds — where intelligent dialogue fosters balanced understanding.
//           </p>
//           <Link href="/register">
//             <Button size="lg" className="bg-gradient-to-r from-sky-500 to-pink-500 text-white">
//               Create Your Account
//             </Button>
//           </Link>
//         </motion.div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500">
//         <p>© 2025 PrismMinds. Empowering balanced dialogue through AI.</p>
//         <div className="mt-3 flex justify-center gap-6">
//           <Link href="#" className="hover:text-gray-800">About</Link>
//           <Link href="#" className="hover:text-gray-800">Privacy</Link>
//           <Link href="#" className="hover:text-gray-800">Contact</Link>
//         </div>
//       </footer>
//     </main>
//   )
// }
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
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-800 dark:text-slate-200">
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
