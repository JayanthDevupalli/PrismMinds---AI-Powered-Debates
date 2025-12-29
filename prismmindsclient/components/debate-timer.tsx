"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"

interface DebateTimerProps {
  duration?: string
  running?: boolean
  onComplete?: () => void
}

const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function DebateTimer({
  duration,
  running = false,
  onComplete,
}: DebateTimerProps) {
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Reset timer when starting from stopped state
  const prevRunningRef = useRef(running)
  useEffect(() => {
    // If transitioning from not running to running, reset the timer
    if (running && !prevRunningRef.current && total > 0) {
      setRemaining(total)
    }
    prevRunningRef.current = running
  }, [running, total])

  useEffect(() => {
    if (!running || total <= 0) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running, total, onComplete])

  const progress = useMemo(() => {
    if (total === 0) return 0
    return remaining / total
  }, [remaining, total])

  const strokeOffset = useMemo(
    () => CIRCUMFERENCE * (1 - progress),
    [progress]
  )

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const isEnding = progress <= 0.2 && remaining > 0

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            stroke="rgba(15,23,42,0.08)"
            strokeWidth="8"
            fill="none"
          />

          {/* Progress */}
          <motion.circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke="url(#timerGradient)"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.6, ease: "linear" }}
          />

          <defs>
            <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          aria-live="polite"
        >
          <motion.div
            key={remaining}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={isEnding ? "animate-pulse" : ""}
          >
            <div className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 text-center">
              {formatTime(remaining)}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2 text-center">
              {remaining > 0 ? "Remaining" : "Finished"}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
