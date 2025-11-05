// "use client"

// import { motion } from "framer-motion"
// import { DebateTimer } from "./debate-timer"

// interface DebateSidebarProps {
//   topic: string
//   personaA: string
//   personaB: string
//   duration: string
// }

// export function DebateSidebar({ topic, personaA, personaB, duration }: DebateSidebarProps) {
//   return (
//     <motion.div
//       initial={{ x: -20, opacity: 0 }}
//       animate={{ x: 0, opacity: 1 }}
//       className="w-80 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-r border-border/40 flex flex-col p-6 space-y-8 overflow-y-auto"
//     >
//       {/* Timer Section */}
//       <div className="space-y-4">
//         <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">⏱️ Debate Timer</h3>
//         <div className="flex justify-center">
//           <DebateTimer duration={duration} />
//         </div>
//       </div>

//       <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

//       {/* Debate Info Section */}
//       <div className="space-y-4">
//         <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">📋 Debate Info</h3>

//         {/* Topic */}
//         <motion.div
//           initial={{ y: 10, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.1 }}
//           className="space-y-2"
//         >
//           <label className="text-xs font-semibold text-muted-foreground">Topic</label>
//           <p className="text-sm font-medium text-foreground leading-snug break-words">{topic}</p>
//         </motion.div>

//         {/* Persona A */}
//         <motion.div
//           initial={{ y: 10, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.15 }}
//           className="space-y-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
//         >
//           <label className="text-xs font-semibold text-primary">🎤 Persona A</label>
//           <p className="text-sm font-medium text-foreground">{personaA}</p>
//         </motion.div>

//         {/* Persona B */}
//         <motion.div
//           initial={{ y: 10, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="space-y-2 p-3 rounded-lg bg-accent/10 border border-accent/20"
//         >
//           <label className="text-xs font-semibold text-accent">🎤 Persona B</label>
//           <p className="text-sm font-medium text-foreground">{personaB}</p>
//         </motion.div>
//       </div>
//     </motion.div>
//   )
// }
"use client"

import { motion } from "framer-motion"
import { DebateTimer } from "./debate-timer"

interface DebateSidebarProps {
  topic: string
  personaA: string
  personaB: string
  duration: string
}

export function DebateSidebar({ topic, personaA, personaB, duration }: DebateSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        fixed               /* ✅ keeps sidebar fixed */
        top-0 left-0
        h-screen            /* ✅ full viewport height */
        w-80                /* ✅ fixed width */
        bg-gradient-to-b from-slate-50 to-white
        dark:from-slate-900 dark:to-slate-950
        border-r border-border/40
        flex flex-col
        p-6
        space-y-8
        z-30                /* ✅ keep it above content */
        shadow-md
        overflow-hidden
        hidden md:flex      /* ✅ visible only on md+ screens */
      "
    >
      {/* Timer Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          ⏱️ Debate Timer
        </h3>
        <div className="flex justify-center">
          <DebateTimer duration={duration} />
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Debate Info Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          📋 Debate Info
        </h3>

        {/* Topic */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-xs font-semibold text-muted-foreground">Topic</label>
          <p className="text-sm font-medium text-foreground leading-snug break-words">{topic}</p>
        </motion.div>

        {/* Persona A */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <label className="text-xs font-semibold text-primary">🎤 Persona A</label>
          <p className="text-sm font-medium text-foreground">{personaA}</p>
        </motion.div>

        {/* Persona B */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 p-3 rounded-lg bg-accent/10 border border-accent/20"
        >
          <label className="text-xs font-semibold text-accent">🎤 Persona B</label>
          <p className="text-sm font-medium text-foreground">{personaB}</p>
        </motion.div>
      </div>
    </motion.aside>
  )
}
