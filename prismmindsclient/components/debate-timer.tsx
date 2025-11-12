// "use client"

// import { useEffect, useMemo, useState } from "react"
// import { motion } from "framer-motion"

// interface DebateTimerProps {
//   /** Expected format: "MM:SS" or "HH:MM:SS" */
//   duration?: string
// }

// export function DebateTimer({ duration }: DebateTimerProps) {
//   const [remaining, setRemaining] = useState(0)
//   const [total, setTotal] = useState(0)
//   console.log("DebateTimer duration prop:", duration)
//   // Parse duration safely
//   const parseDuration = (value?: string): number => {
//     if (!value || typeof value !== "string") return 0
//     const parts = value.split(":").map(Number)
//     if (parts.some(isNaN)) return 0
//     if (parts.length === 3) {
//       const [h, m, s] = parts
//       return h * 3600 + m * 60 + s
//     }
//     if (parts.length === 2) {
//       const [m, s] = parts
//       return m * 60 + s
//     }
//     return 0
//   }

//   const formatTime = (seconds: number): string => {
//     const h = Math.floor(seconds / 3600)
//     const m = Math.floor((seconds % 3600) / 60)
//     const s = seconds % 60
//     return h > 0
//       ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
//       : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
//   }

//   // ✅ Initialize once when duration changes
//   useEffect(() => {
//     const totalSeconds = parseDuration(duration)
//     setTotal(totalSeconds)
//     setRemaining(totalSeconds)

//     if (!totalSeconds) return

//     // start countdown once
//     const timer = setInterval(() => {
//       setRemaining((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer)
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [duration])

//   // compute circular progress
//   const progress = useMemo(
//     () => (total > 0 ? (remaining / total) * 100 : 0),
//     [remaining, total],
//   )

//   return (
//     <div className="flex flex-col items-center justify-center p-4 select-none">
//       <div className="relative w-44 h-44 sm:w-52 sm:h-52">
//         {/* Circular progress ring */}
//         <svg className="absolute inset-0 w-full h-full -rotate-90">
//           <circle
//             cx="50%"
//             cy="50%"
//             r="90"
//             stroke="hsl(var(--muted-foreground))"
//             strokeWidth="10"
//             fill="none"
//             className="opacity-20"
//           />
//           <motion.circle
//             cx="50%"
//             cy="50%"
//             r="90"
//             stroke="hsl(var(--primary))"
//             strokeWidth="10"
//             fill="none"
//             strokeLinecap="round"
//             strokeDasharray={2 * Math.PI * 90}
//             strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
//             animate={{
//               strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100),
//             }}
//             transition={{ duration: 0.8, ease: "linear" }}
//           />
//         </svg>

//         {/* Time display */}
//         <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
//           <motion.div
//             key={remaining}
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.25 }}
//           >
//             <p className="text-4xl sm:text-5xl font-mono font-bold text-primary leading-tight">
//               {formatTime(remaining)}
//             </p>
//             <p className="text-xs uppercase text-muted-foreground mt-1 tracking-widest">
//               {remaining > 0 ? "Remaining" : "Time’s Up!"}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   )
// }
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
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative w-44 h-44">
        {/* Base ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="90" stroke="rgba(15,23,42,0.06)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="50%"
            cy="50%"
            r="90"
            stroke="url(#timerGradient)"
            strokeWidth="10"
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

        {/* Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={remaining}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-3xl font-mono font-semibold text-slate-800">
              {formatTime(remaining)}
            </div>
            <div className="text-xs text-slate-500 uppercase mt-1">
              {remaining > 0 ? "Remaining" : "Finished"}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

