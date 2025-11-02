// "use client"

// import { useState, useMemo } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { ProtectedRoute } from "@/components/protected-route"
// import { useAuth } from "@/lib/auth-context"
// import { DebateForm } from "@/components/debate-form"
// import {
//   Cog6ToothIcon,
//   PlusIcon,
//   ClockIcon,
//   ChartBarIcon,
//   DocumentTextIcon,
//   ArrowRightOnRectangleIcon,
// } from "@heroicons/react/24/outline"

// /**
//  * Dashboard Page (UI-only)
//  * - Glassy layout, subtle animations
//  * - Sticky frosted navbar (icon-only on mobile)
//  * - Welcome hero + stats
//  * - Debate creation card (DebateForm)
//  * - Recent debates list (mocked for UI) + quick actions
//  *
//  * Note: Replace mock data and navigation with your backend calls as needed.
//  */

// export default function DashboardPage() {
//   const { user, logout } = useAuth()
//   const router = useRouter()
//   const [loading, setLoading] = useState(false)
//   const [recent, setRecent] = useState(() => [
//     {
//       id: "debate-01",
//       topic: "Is AI creativity real?",
//       personas: ["Supportive", "Opposing", "Analyst"],
//       duration: 60,
//       status: "Completed",
//       updatedAt: "2h ago",
//     },
//     {
//       id: "debate-02",
//       topic: "Universal basic income — yes or no?",
//       personas: ["Pro", "Con"],
//       duration: 45,
//       status: "Running",
//       updatedAt: "10m ago",
//     },
//     {
//       id: "debate-03",
//       topic: "Should social media be regulated?",
//       personas: ["Regulate", "No Regulation", "Moderate"],
//       duration: 30,
//       status: "Queued",
//       updatedAt: "1d ago",
//     },
//   ])

//   const stats = useMemo(
//     () => ({
//       debates: recent.length + 12, // mock
//       active: recent.filter((r) => r.status === "Running").length,
//       saved: 124,
//     }),
//     [recent]
//   )

//   const handleStartDebate = async (data) => {
//     // UI-only flow: store config and navigate — replace with backend API call later
//     setLoading(true)
//     try {
//       // create a temporary id and create preview card
//       const id = `debate-${Date.now()}`
//       const newDebate = {
//         id,
//         topic: data.topic,
//         personas: data.personas || [],
//         duration: data.duration,
//         status: "Queued",
//         updatedAt: "just now",
//       }
//       setRecent((s) => [newDebate, ...s])
//       sessionStorage.setItem("debateConfig", JSON.stringify({ id, ...data }))
//       // navigate to demo or to a real debate page
//       router.push("/debate/demo")
//     } catch (err) {
//       console.error("Start debate failed", err)
//       alert("Failed to start debate")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleLogout = async () => {
//     await logout()
//     router.push("/login")
//   }

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground">
//         {/* NAVBAR */}
//         <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/30 dark:bg-slate-900/40 border-b border-border/50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between h-16">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center font-bold shadow">
//                   🧠
//                 </div>
//                 {/* hidden on mobile (show icon only) */}
//                 <div className="hidden sm:block">
//                   <span className="font-semibold text-lg gradient-text">PrismMinds</span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
//                   <div>Hi, <span className="font-medium text-foreground">{user?.displayName || user?.email?.split("@")[0]}</span></div>
//                 </div>

//                 <Link href="/history">
//                   <Button variant="ghost" className="hidden sm:inline-flex">History</Button>
//                 </Link>

//                 <Link href="/settings">
//                   <Button variant="ghost" className="hidden sm:inline-flex" title="Settings">
//                     <Cog6ToothIcon className="w-4 h-4" />
//                   </Button>
//                 </Link>

//                 <Button variant="ghost" onClick={handleLogout} title="Logout">
//                   <ArrowRightOnRectangleIcon className="w-5 h-5" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* PAGE CONTENT */}
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//           {/* TOP HERO + STATS */}
//           <motion.section
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45 }}
//             className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-8"
//           >
//             {/* Left: Welcome + quick actions */}
//             <div className="lg:col-span-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-border/40 rounded-2xl p-6 shadow-sm">
//               <div className="flex items-start justify-between gap-6">
//                 <div>
//                   <h2 className="text-2xl font-bold">Welcome back</h2>
//                   <p className="text-sm text-muted-foreground mt-1 max-w-xl">
//                     Ready to explore new debates? Create a session, pick personas, and watch AI reason in real time.
//                   </p>

//                   <div className="mt-5 flex flex-wrap gap-3">
//                     <Button onClick={() => document.getElementById("debateForm")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2">
//                       <PlusIcon className="w-4 h-4" /> Start Debate
//                     </Button>

//                     <Link href="/debate/library">
//                       <Button variant="ghost" className="inline-flex items-center gap-2">
//                         <DocumentTextIcon className="w-4 h-4" /> Saved Debates
//                       </Button>
//                     </Link>

//                     <Link href="/analytics">
//                       <Button variant="ghost" className="inline-flex items-center gap-2">
//                         <ChartBarIcon className="w-4 h-4" /> Insights
//                       </Button>
//                     </Link>
//                   </div>
//                 </div>

//                 {/* quick stats */}
//                 <div className="flex gap-3 items-center">
//                   <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-border/40 text-center min-w-[90px]">
//                     <div className="text-2xl font-semibold">{stats.debates}</div>
//                     <div className="text-xs text-muted-foreground">Total debates</div>
//                   </div>
//                   <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-border/40 text-center min-w-[90px]">
//                     <div className="text-2xl font-semibold">{stats.active}</div>
//                     <div className="text-xs text-muted-foreground">Active</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right: compact panel (profile overview) */}
//             <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-border/40 rounded-2xl p-4 shadow-sm">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-semibold"> { (user?.displayName || user?.email || "U").charAt(0).toUpperCase() } </div>
//                 <div>
//                   <div className="text-sm font-medium">{user?.displayName || user?.email?.split("@")[0]}</div>
//                   <div className="text-xs text-muted-foreground">Member since 2025</div>
//                 </div>
//               </div>

//               <div className="mt-4 space-y-3">
//                 <div className="text-xs text-muted-foreground">Quick controls</div>
//                 <div className="flex gap-2">
//                   <Button variant="ghost" className="flex-1">Edit Profile</Button>
//                   <Button variant="outline" className="flex-1">API Keys</Button>
//                 </div>
//               </div>
//             </div>
//           </motion.section>

//           {/* Main Grid: Debate Form & Recent debates */}
//           <motion.section
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45, delay: 0.06 }}
//             className="grid grid-cols-1 lg:grid-cols-3 gap-6"
//           >
//             {/* Debate Form (prominent) */}
//             <div id="debateForm" className="lg:col-span-2">
//               <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-border/40 rounded-2xl p-6 shadow-sm">
//                 <h3 className="text-lg font-semibold mb-2">Create a debate</h3>
//                 <p className="text-sm text-muted-foreground mb-4">Define the topic, duration, and personas. Debates run in structured rounds.</p>

//                 <DebateForm onSubmit={handleStartDebate} loading={loading} />
//                 <div className="mt-4 text-xs text-muted-foreground">Tip: Add precise persona prompts for higher-quality debate responses.</div>
//               </div>

//               {/* Extras: persona presets */}
//               <div className="mt-5 grid grid-cols-2 gap-3">
//                 {[
//                   { name: "Academic vs Industry", personas: ["Academic", "Industry"] },
//                   { name: "Ethics vs Efficiency", personas: ["Ethicist", "Technocrat"] },
//                   { name: "Policy Debate", personas: ["Policy Maker", "Critic"] },
//                   { name: "Science vs Philosophy", personas: ["Scientist", "Philosopher"] },
//                 ].map((p) => (
//                   <motion.button
//                     key={p.name}
//                     whileHover={{ opacity: 0.95 }}
//                     className="text-left p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-border/30"
//                     onClick={() => {
//                       // fill the form via event dispatch — accessible approach: store in sessionStorage and navigate to form
//                       const preset = { topic: p.name, duration: 30, personas: p.personas }
//                       // prefill - simple UX: store and open the debate form anchor
//                       sessionStorage.setItem("debatePreset", JSON.stringify(preset))
//                       document.getElementById("debateForm")?.scrollIntoView({ behavior: "smooth" })
//                     }}
//                   >
//                     <div className="font-medium">{p.name}</div>
//                     <div className="text-xs text-muted-foreground mt-1">{p.personas.join(" • ")}</div>
//                   </motion.button>
//                 ))}
//               </div>
//             </div>

//             {/* Recent debates */}
//             <aside className="space-y-4">
//               <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-border/40 rounded-2xl p-4 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-semibold">Recent Debates</h4>
//                     <div className="text-xs text-muted-foreground">Latest activity</div>
//                   </div>
//                   <Button variant="ghost" size="sm">View All</Button>
//                 </div>

//                 <div className="mt-4 space-y-3">
//                   {recent.map((r) => (
//                     <motion.div
//                       key={r.id}
//                       initial={{ opacity: 0, y: 6 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.3 }}
//                       className="p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-border/30"
//                     >
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2">
//                             <div className="font-medium truncate">{r.topic}</div>
//                             <div className="text-xs text-muted-foreground">• {r.personas.join(", ")}</div>
//                           </div>
//                           <div className="text-xs text-muted-foreground mt-1">{r.updatedAt} • {r.duration}m</div>
//                         </div>

//                         <div className="flex flex-col items-end gap-2">
//                           <div className={`text-xs font-semibold px-2 py-1 rounded text-white ${r.status === "Running" ? "bg-emerald-500" : r.status === "Completed" ? "bg-slate-700/80" : "bg-yellow-500"}`}>
//                             {r.status}
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Button variant="ghost" size="sm" onClick={() => {
//                               // preview: save debate and go to demo
//                               sessionStorage.setItem("debateConfig", JSON.stringify(r))
//                               router.push("/debate/demo")
//                             }}>Open</Button>
//                             <Button variant="ghost" size="sm" onClick={() => {
//                               setRecent((prev) => prev.filter(x => x.id !== r.id))
//                             }}>Remove</Button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               </div>

//               {/* Small insights card */}
//               <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg border border-border/30 rounded-2xl p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-xs text-muted-foreground">Quick Insight</div>
//                     <div className="font-semibold">Top trends: Ethics, Automation, Privacy</div>
//                   </div>
//                   <div className="text-xs text-muted-foreground">Updated</div>
//                 </div>
//                 <div className="mt-3">
//                   {/* tiny sparkline (SVG) */}
//                   <svg viewBox="0 0 60 20" className="w-full h-8">
//                     <polyline fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                       points="0,14 10,9 20,11 30,6 40,9 50,5 60,8" />
//                   </svg>
//                 </div>
//               </div>
//             </aside>
//           </motion.section>

//           {/* FOOTER area inside dashboard */}
//           <footer className="mt-10 text-center text-sm text-muted-foreground">
//             © {new Date().getFullYear()} PrismMinds — Crafted for thoughtful debate.
//           </footer>
//         </main>
//       </div>
//     </ProtectedRoute>
//   )
// }
"use client";

import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const summaryCards = [
    {
      title: "Total Debates",
      value: "42",
      icon: ClipboardDocumentListIcon,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Active Members",
      value: "18",
      icon: UserGroupIcon,
      color: "from-violet-500 to-fuchsia-400",
    },
    {
      title: "Winning Rate",
      value: "67%",
      icon: SparklesIcon,
      color: "from-amber-500 to-orange-400",
    },
    {
      title: "Upcoming Events",
      value: "5",
      icon: ChartBarIcon,
      color: "from-emerald-500 to-teal-400",
    },
  ];

  const recentDebates = [
    { title: "AI in Education", date: "Oct 22, 2025", status: "Completed" },
    { title: "Ethics of Quantum Computing", date: "Oct 25, 2025", status: "Ongoing" },
    { title: "Privacy in the AI Era", date: "Oct 28, 2025", status: "Upcoming" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Welcome back 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
          Here’s what’s happening with your debates today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-5 rounded-2xl shadow-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-border flex items-center justify-between"
          >
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">{card.title}</h2>
              <p className="text-2xl font-semibold mt-1">{card.value}</p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}
            >
              <card.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics / Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-border shadow-md"
      >
        <h2 className="text-lg font-semibold mb-4">Debate Analytics</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
          📊 Chart will appear here (integrate with Recharts / Chart.js)
        </div>
      </motion.div>

      {/* Recent Debates */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-border shadow-md"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Debates</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDebates.map((debate, index) => (
                <tr key={index} className="border-b border-border/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3">{debate.title}</td>
                  <td className="py-2 px-3">{debate.date}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        debate.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400"
                          : debate.status === "Ongoing"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-400"
                      }`}
                    >
                      {debate.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
