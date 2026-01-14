"use client"

import { motion } from "framer-motion"
import { Mic2 } from "lucide-react"
import { DebateTimer } from "./debate-timer"

interface DebateSidebarProps {
  topic: string
  personaA: string
  personaB: string
  duration: string
  running?: boolean
  onTimerComplete?: () => void
}

export function DebateSidebar({
  topic,
  personaA,
  personaB,
  duration,
  running = false,
  onTimerComplete,
}: DebateSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        fixed
        top-0 left-0
        h-screen
        w-80
        bg-gradient-to-b from-slate-50 to-white
        dark:from-slate-900 dark:to-slate-950
        border-r border-border/40
        flex flex-col
        p-6
        space-y-8
        z-30
        shadow-md
        overflow-hidden
        hidden md:flex
      "
    >
      {/* Program Header */}
      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Program
        </p>
        <h2 className="text-sm font-semibold text-foreground">
          Live Debate Session
        </h2>
      </div>

      {/* Timer */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            On Air
          </span>

          {running && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                LIVE
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <DebateTimer
            duration={duration}
            running={running}
            onComplete={onTimerComplete}
          />
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      {/* Topic */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Topic
        </p>
        <p className="text-sm font-semibold leading-snug text-foreground">
          {topic}
        </p>
      </motion.section>

      <div className="h-px bg-border/40" />

      {/* Personas */}
      <div className="space-y-6">
        {/* Persona A */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-primary">
              Persona A
            </span>
            <span className="text-[10px] text-muted-foreground">
              Ready
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Mic2 className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-sm font-medium text-foreground leading-snug">
              {personaA}
            </p>
          </div>

          <div className="h-px bg-primary/20" />
        </motion.div>

        {/* Persona B */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-indigo-500 dark:text-indigo-400">
              Persona B
            </span>
            <span className="text-[10px] text-muted-foreground">
              Ready
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Mic2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5" />
            <p className="text-sm font-medium text-foreground leading-snug">
              {personaB}
            </p>
          </div>

          <div className="h-px bg-indigo-500/20" />
        </motion.div>
      </div>
    </motion.aside>
  )
}
