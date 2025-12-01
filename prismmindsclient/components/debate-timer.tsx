
"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"

interface DebateTimerProps {
  duration?: string
  running?: boolean
  onComplete?: () => void
}

export function DebateTimer({ duration, running = false, onComplete }: DebateTimerProps) {
  const [remaining, setRemaining] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  const parseDuration = (value?: string) => {
    if (!value) return 0
    const parts = value.split(":").map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
  }

  useEffect(() => {
    const t = parseDuration(duration)
    setTotal(t)
    setRemaining(t)
  }, [duration])

  useEffect(() => {
    if (!running || total <= 0) return
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running, total])

  const formatTime = (s: number) => {
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const progress = useMemo(() => (total > 0 ? (remaining / total) * 100 : 0), [remaining, total])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* SVG Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          {/* Background circle */}
          <circle cx="100" cy="100" r="90" stroke="rgba(15,23,42,0.08)" strokeWidth="8" fill="none" />
          {/* Animated progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#timerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.div
            key={remaining}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100">
              {formatTime(remaining)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mt-2 tracking-widest text-center">
              {remaining > 0 ? "Remaining" : "Finished"}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

