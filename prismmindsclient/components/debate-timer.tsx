// // "use client"

// // import { useEffect, useState } from "react"
// // import { motion } from "framer-motion"

// // interface DebateTimerProps {
// //   duration: string // Format: "45:30" or "01:23:45"
// // }

// // export function DebateTimer({ duration }: DebateTimerProps) {
// //   const [displayTime, setDisplayTime] = useState(duration)
// //   const [rotation, setRotation] = useState(0)

// //   useEffect(() => {
// //     const timeRegex = /(\d+):(\d+)(?::(\d+))?/
// //     const match = duration.match(timeRegex)

// //     if (match) {
// //       const hours = Number.parseInt(match[1] || "0")
// //       const minutes = Number.parseInt(match[2] || "0")
// //       const seconds = Number.parseInt(match[3] || "0")

// //       const totalSeconds = hours * 3600 + minutes * 60 + seconds
// //       const totalDuration = 2 * 3600 // Assume 2 hours total debate

// //       // Calculate rotation (360 degrees for full circle)
// //       const progressPercent = totalSeconds / totalDuration
// //       setRotation(progressPercent * 360)
// //     }

// //     setDisplayTime(duration)
// //   }, [duration])

// //   return (
// //     <div className="flex flex-col items-center justify-center">
// //       {/* Outer Clock Ring */}
// //       <div className="relative w-40 h-40 rounded-full border-8 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 flex items-center justify-center">
// //         {/* Inner Circle */}
// //         <div className="absolute inset-4 rounded-full border-4 border-primary/20 bg-background/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center">
// //           {/* Hour marks */}
// //           {[...Array(12)].map((_, i) => (
// //             <motion.div
// //               key={i}
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               transition={{ delay: i * 0.05 }}
// //               className="absolute w-1 h-6 bg-primary/40 rounded-full origin-center"
// //               style={{
// //                 transform: `rotate(${(i * 30) % 360}deg) translateY(-60px)`,
// //               }}
// //             />
// //           ))}

// //           {/* Center dot */}
// //           <div className="absolute w-3 h-3 rounded-full bg-primary z-10" />

// //           {/* Main hand (minute/hour hand) */}
// //           <motion.div
// //             animate={{ rotate: rotation }}
// //             transition={{ duration: 0.5, ease: "easeOut" }}
// //             className="absolute w-2 h-16 bg-gradient-to-t from-accent to-accent/70 rounded-full origin-bottom shadow-md"
// //             style={{ bottom: "50%", marginLeft: -4 }}
// //           />

// //           {/* Second hand */}
// //           <motion.div
// //             animate={{ rotate: (rotation * 60) % 360 }}
// //             transition={{ duration: 0.3, ease: "linear" }}
// //             className="absolute w-1 h-14 bg-destructive/70 rounded-full origin-bottom shadow-sm"
// //             style={{ bottom: "50%", marginLeft: -2 }}
// //           />
// //         </div>

// //         {/* Time Display */}
// //         <div className="absolute inset-0 flex items-center justify-center">
// //           <motion.div
// //             initial={{ scale: 0.9, opacity: 0 }}
// //             animate={{ scale: 1, opacity: 1 }}
// //             transition={{ duration: 0.5 }}
// //             className="text-center"
// //           >
// //             <div className="text-3xl sm:text-4xl font-bold text-primary font-mono">{displayTime}</div>
// //             <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Remaining</div>
// //           </motion.div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// "use client"

// import { useEffect, useState } from "react"
// import { motion } from "framer-motion"

// interface DebateTimerProps {
//   duration: string // Expected format: "45:30" or "01:23:45"
// }

// export function DebateTimer({ duration }: DebateTimerProps) {
//   const [displayTime, setDisplayTime] = useState(duration ?? "00:00")
//   const [rotation, setRotation] = useState(0)

//   // Helper: safely parse duration string
//   const parseDuration = (timeStr: string) => {
//     const timeRegex = /(\d+):(\d+)(?::(\d+))?/
//     const match = timeStr.match(timeRegex)
//     if (!match) return { hours: 0, minutes: 0, seconds: 0 }

//     const hours = Number.parseInt(match[1] || "0")
//     const minutes = Number.parseInt(match[2] || "0")
//     const seconds = Number.parseInt(match[3] || "0")
//     return { hours, minutes, seconds }
//   }

//   useEffect(() => {
//     if (typeof duration !== "string") {
//       console.warn("Invalid duration type passed to DebateTimer:", duration)
//       return
//     }

//     const { hours, minutes, seconds } = parseDuration(duration)
//     const totalSeconds = hours * 3600 + minutes * 60 + seconds
//     const totalDuration = 2 * 3600 // 2-hour full debate circle

//     const progressPercent = totalSeconds / totalDuration
//     setRotation(progressPercent * 360)
//     setDisplayTime(duration)
//   }, [duration])

//   /*
//   // 🕒 Optional: make it count down automatically
//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null
//     const { hours, minutes, seconds } = parseDuration(duration)
//     let remaining = hours * 3600 + minutes * 60 + seconds

//     const updateDisplay = () => {
//       const h = Math.floor(remaining / 3600)
//       const m = Math.floor((remaining % 3600) / 60)
//       const s = remaining % 60
//       const newTime =
//         h > 0
//           ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
//           : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
//       setDisplayTime(newTime)

//       const progressPercent = remaining / (2 * 3600)
//       setRotation(progressPercent * 360)
//     }

//     if (remaining > 0) {
//       updateDisplay()
//       timer = setInterval(() => {
//         remaining--
//         if (remaining <= 0) {
//           clearInterval(timer!)
//           setDisplayTime("00:00")
//         } else {
//           updateDisplay()
//         }
//       }, 1000)
//     }

//     return () => timer && clearInterval(timer)
//   }, [duration])
//   */

//   return (
//     <div className="flex flex-col items-center justify-center">
//       <div className="relative w-40 h-40 rounded-full border-8 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 flex items-center justify-center">
//         {/* Inner Circle */}
//         <div className="absolute inset-4 rounded-full border-4 border-primary/20 bg-background/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center">
//           {/* Hour Marks */}
//           {[...Array(12)].map((_, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: i * 0.05 }}
//               className="absolute w-1 h-6 bg-primary/40 rounded-full origin-center"
//               style={{
//                 transform: `rotate(${(i * 30) % 360}deg) translateY(-60px)`,
//               }}
//             />
//           ))}

//           {/* Center Dot */}
//           <div className="absolute w-3 h-3 rounded-full bg-primary z-10" />

//           {/* Main Hand */}
//           <motion.div
//             animate={{ rotate: rotation }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//             className="absolute w-2 h-16 bg-gradient-to-t from-accent to-accent/70 rounded-full origin-bottom shadow-md"
//             style={{ bottom: "50%", marginLeft: -4 }}
//           />

//           {/* Second Hand */}
//           <motion.div
//             animate={{ rotate: (rotation * 60) % 360 }}
//             transition={{ duration: 0.3, ease: "linear" }}
//             className="absolute w-1 h-14 bg-destructive/70 rounded-full origin-bottom shadow-sm"
//             style={{ bottom: "50%", marginLeft: -2 }}
//           />
//         </div>

//         {/* Time Display */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5 }}
//             className="text-center"
//           >
//             <div className="text-3xl sm:text-4xl font-bold text-primary font-mono">
//               {displayTime}
//             </div>
//             <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
//               Remaining
//             </div>
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
  /** Expected format: "MM:SS" or "HH:MM:SS" */
  duration?: string
}

export function DebateTimer({ duration }: DebateTimerProps) {
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  console.log("DebateTimer duration prop:", duration)
  // Parse duration safely
  const parseDuration = (value?: string): number => {
    if (!value || typeof value !== "string") return 0
    const parts = value.split(":").map(Number)
    if (parts.some(isNaN)) return 0
    if (parts.length === 3) {
      const [h, m, s] = parts
      return h * 3600 + m * 60 + s
    }
    if (parts.length === 2) {
      const [m, s] = parts
      return m * 60 + s
    }
    return 0
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0
      ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  // ✅ Initialize once when duration changes
  useEffect(() => {
    const totalSeconds = parseDuration(duration)
    setTotal(totalSeconds)
    setRemaining(totalSeconds)

    if (!totalSeconds) return

    // start countdown once
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [duration])

  // compute circular progress
  const progress = useMemo(
    () => (total > 0 ? (remaining / total) * 100 : 0),
    [remaining, total],
  )

  return (
    <div className="flex flex-col items-center justify-center p-4 select-none">
      <div className="relative w-44 h-44 sm:w-52 sm:h-52">
        {/* Circular progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="90"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="10"
            fill="none"
            className="opacity-20"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="90"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            animate={{
              strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100),
            }}
            transition={{ duration: 0.8, ease: "linear" }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            key={remaining}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-4xl sm:text-5xl font-mono font-bold text-primary leading-tight">
              {formatTime(remaining)}
            </p>
            <p className="text-xs uppercase text-muted-foreground mt-1 tracking-widest">
              {remaining > 0 ? "Remaining" : "Time’s Up!"}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
