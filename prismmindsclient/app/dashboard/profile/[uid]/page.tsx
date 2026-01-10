"use client"

import React, { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { fetchRecentDebates } from "@/lib/api"
import {
    Trophy,
    Target,
    Flame,
    Brain,
    Mic2,
    MessageCircle,
    Zap,
    Calendar,
    TrendingUp,
    Loader2,
    BarChart3,
    User,
    Heart,
    Edit2,
    Check,
    X,
    Trash2,
    AlertTriangle,
    ArrowLeft,
    UserCog,
    Lock,
    Eye,
    EyeOff,
    Save
} from "lucide-react"

import Link from "next/link"
import { toast } from "sonner"

// --- Types ---

type DebateScores = {
    logic: number
    persuasion: number
    clarity: number
    emotional_intelligence: number
}

type Debate = {
    id: string
    topic: string
    createdAt: string
    duration: string
    analysis?: {
        scores?: DebateScores
    }
}

// --- Components ---

/**
 * Radar Chart Component
 * Visualizes the 4 key skills: Logic, Persuasion, Clarity, EQ
 */
const SkillBars = ({ scores }: { scores: DebateScores }) => {
    const skills = [
        {
            name: "Logic",
            value: scores.logic,
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            barColor: "bg-blue-500",
            text: "text-blue-600 dark:text-blue-400",
            icon: Brain
        },
        {
            name: "Persuasion",
            value: scores.persuasion,
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            barColor: "bg-purple-500",
            text: "text-purple-600 dark:text-purple-400",
            icon: Zap
        },
        {
            name: "Clarity",
            value: scores.clarity,
            iconBg: "bg-teal-100 dark:bg-teal-900/30",
            barColor: "bg-teal-500",
            text: "text-teal-600 dark:text-teal-400",
            icon: MessageCircle
        },
        {
            name: "Emotional IQ",
            value: scores.emotional_intelligence,
            iconBg: "bg-rose-100 dark:bg-rose-900/30",
            barColor: "bg-rose-500",
            text: "text-rose-600 dark:text-rose-400",
            icon: Heart
        },
    ]

    return (
        <div className="space-y-6 pt-2">
            {skills.map((skill, i) => (
                <div key={i} className="group">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${skill.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                <skill.icon className={`w-4 h-4 ${skill.text}`} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{skill.name}</div>
                            </div>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(skill.value)}</span>
                            <span className="text-xs text-slate-400 mb-1">/100</span>
                        </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.value}%` }}
                            transition={{ duration: 1, delay: i * 0.1, type: "spring", stiffness: 50 }}
                            className={`h-full rounded-full ${skill.barColor}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

const ActivityHeatmap = ({ dates, year }: { dates: string[], year: number }) => {
    // 1. Prepare data map
    const counts: Record<string, number> = {}
    dates.forEach(d => {
        const dateStr = new Date(d).toDateString()
        counts[dateStr] = (counts[dateStr] || 0) + 1
    })

    const getColor = (count: number) => {
        if (!count) return "bg-slate-100 dark:bg-slate-800"
        if (count === 1) return "bg-orange-200 dark:bg-orange-900/40"
        if (count === 2) return "bg-orange-300 dark:bg-orange-800/60"
        if (count >= 3) return "bg-orange-500 dark:bg-orange-600"
        return "bg-slate-100 dark:bg-slate-800"
    }

    // 2. Generate Grid for the specific Year (Jan 1 - Dec 31)
    const startDate = new Date(year, 0, 1) // Jan 1
    const endDate = new Date(year, 11, 31) // Dec 31
    const today = new Date()

    // Adjust start to previous Sunday for proper grid alignment
    while (startDate.getDay() !== 0) {
        startDate.setDate(startDate.getDate() - 1)
    }

    const weeks = []
    let currentDate = new Date(startDate)

    // Generate weeks until we pass the end date
    while (currentDate <= endDate) {
        const weekDays = []
        for (let d = 0; d < 7; d++) {
            weekDays.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }
        weeks.push(weekDays)
        // Safety break if we go too far (leap years etc could cause issue if logic loops forever)
        if (weeks.length > 55) break;
    }

    // Months labels logic
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[700px]">
                {/* Month Labels */}
                <div className="flex text-xs text-muted-foreground mb-2 h-4 relative">
                    {weeks.map((week, i) => {
                        const firstDay = week[0];
                        const isNewMonth = firstDay.getDate() <= 7; // Show label if it's the first week of month
                        // Filter to avoid crowding (don't show consecutive if weeks are weirdly aligned, though logic holds)
                        if (isNewMonth) {
                            return <span key={i} className="absolute" style={{ left: `${i * 14}px` }}>{months[firstDay.getMonth()]}</span>
                        }
                        return null;
                    })}
                </div>

                <div className="flex gap-[3px]">
                    {/* Day Labels (Mon, Wed, Fri) - Optional left column */}
                    {/* Using hidden sm:block to save space on tiny screens if needed */}
                    <div className="hidden sm:flex flex-col gap-[3px] pr-2 text-[10px] text-muted-foreground leading-[10px] pt-[13px]">
                        <span className="h-[10px]"></span>
                        <span className="h-[10px]">Mon</span>
                        <span className="h-[10px]"></span>
                        <span className="h-[10px]">Wed</span>
                        <span className="h-[10px]"></span>
                        <span className="h-[10px]">Fri</span>
                        <span className="h-[10px]"></span>
                    </div>

                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dIndex) => {
                                const count = counts[day.toDateString()] || 0
                                // Always render the grid, but future days could be dimmed optionally
                                // For yearly view, we just render the full calendar grid usually.
                                // But if it's the current year, maybe dim future days?
                                const isFuture = day > today
                                if (year === today.getFullYear() && isFuture) return <div key={dIndex} className="w-[10px] h-[10px]" /> // Empty space for future

                                return (
                                    <div
                                        key={dIndex}
                                        title={`${day.toDateString()}: ${count} debates`}
                                        className={`w-[10px] h-[10px] rounded-[2px] ${getColor(count)}`}
                                    />
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-4">
                    <span>Less</span>
                    <div className="w-[10px] h-[10px] bg-slate-100 dark:bg-slate-800 rounded-[2px]" />
                    <div className="w-[10px] h-[10px] bg-orange-200 dark:bg-orange-900/40 rounded-[2px]" />
                    <div className="w-[10px] h-[10px] bg-orange-300 dark:bg-orange-800/60 rounded-[2px]" />
                    <div className="w-[10px] h-[10px] bg-orange-500 dark:bg-orange-600 rounded-[2px]" />
                    <span>More</span>
                </div>
            </div>
        </div>
    )
}

// --- Main Page ---

import { useRouter } from "next/navigation"



export default function ProfilePage() {
    const { user, deleteUserAccount, updateDisplayName, updateUserPassword, reauthenticate } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [debates, setDebates] = useState<Debate[]>([])
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // --- Data Fetching ---
    const [viewMode, setViewMode] = useState<'overview' | 'settings'>('overview')

    // Edit Profile State
    const [newName, setNewName] = useState("")
    const [isEditingName, setIsEditingName] = useState(false)

    // Password Update State
    // Password Update State
    const [currentPassword, setCurrentPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Set initial name when user loads
    useEffect(() => {
        if (user?.displayName) {
            setNewName(user.displayName)
        }
    }, [user])

    // --- Actions ---
    const handleUpdateName = async () => {
        if (!newName.trim()) return
        try {
            await updateDisplayName(newName)
            setIsEditingName(false)
            toast.success("Profile name updated successfully")
        } catch (error) {
            console.error("Failed to update name:", error)
            toast.error("Failed to update name")
        }
    }



    const handleUpdatePassword = async () => {
        if (!currentPassword) {
            toast.error("Please enter your current password")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long")
            return
        }

        const hasUpperCase = /[A-Z]/.test(newPassword)
        const hasLowerCase = /[a-z]/.test(newPassword)
        const hasNumber = /[0-9]/.test(newPassword)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            toast.error("Password must contain uppercase, lowercase, number and special character")
            return
        }

        try {
            // Verify old password first
            await reauthenticate(currentPassword)

            // If verification correct, update to new password
            await updateUserPassword(newPassword)

            setNewPassword("")
            setConfirmPassword("")
            setCurrentPassword("")
            toast.success("Password updated successfully")
        } catch (error: any) {
            console.error("Failed to update password:", error)
            toast.error(error.message || "Failed to update password. Please check your current password.")
        }
    }

    // --- Actions ---
    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to call this delete? This action cannot be undone.")) {
            return
        }

        try {
            await deleteUserAccount()
            router.push("/")
            toast.success("Account deleted successfully")
        } catch (error) {
            console.error("Failed to delete account:", error)
            toast.error("Failed to delete account. You may need to re-login explicitly.")
        }
    }

    useEffect(() => {
        if (user) {
            fetchRecentDebates(100)
                .then(data => {
                    // Ensure data is array
                    setDebates(Array.isArray(data) ? data : [])
                })
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [user])

    // --- Derived Stats ---
    const stats = useMemo(() => {
        const total = debates.length

        // 1. Sort by date descending (Newest first) to ensure weights apply to recent debates
        const sortedDebates = [...debates].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        // 2. Filter debates that have valid scores
        const scoredDebates = sortedDebates.filter(d => d.analysis?.scores)

        if (scoredDebates.length === 0) {
            return {
                total,
                avgScores: { logic: 0, persuasion: 0, clarity: 0, emotional_intelligence: 0 },
                overallRating: 0,
                dates: [],
                years: [new Date().getFullYear()]
            }
        }

        // 3. Calculate Weighted Averages
        // We use an exponential decay weight to prioritize recent performance.
        // Recent debates have higher influence on the profile rating.
        let totalWeight = 0
        const weightedSums = { logic: 0, persuasion: 0, clarity: 0, emotional_intelligence: 0 }

        scoredDebates.forEach((d, index) => {
            const s = d.analysis!.scores!
            // Decay factor of 0.9 mean the 10th debate back has ~38% influence of the 1st.
            // This balances "Current Form" with "History".
            const weight = Math.pow(0.92, index)

            totalWeight += weight
            weightedSums.logic += s.logic * weight
            weightedSums.persuasion += s.persuasion * weight
            weightedSums.clarity += s.clarity * weight
            weightedSums.emotional_intelligence += s.emotional_intelligence * weight
        })

        const avgScores = {
            logic: weightedSums.logic / totalWeight,
            persuasion: weightedSums.persuasion / totalWeight,
            clarity: weightedSums.clarity / totalWeight,
            emotional_intelligence: weightedSums.emotional_intelligence / totalWeight
        }

        // 4. Calculate Overall Rating (0-100)
        const overallRating = Math.round(
            (avgScores.logic + avgScores.persuasion + avgScores.clarity + avgScores.emotional_intelligence) / 4
        )

        // Available Years
        const years = Array.from(new Set(debates.map(d => new Date(d.createdAt).getFullYear())))
            .sort((a, b) => b - a)

        // Ensure current year is in the list even if no debates
        if (!years.includes(new Date().getFullYear())) {
            years.unshift(new Date().getFullYear())
        }

        return {
            total,
            avgScores,
            overallRating,
            dates: sortedDebates.map(d => d.createdAt),
            years
        }
    }, [debates])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-orange-50/30">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20">
            {/* Top Banner */}
            <div className="h-48 bg-gradient-to-r from-orange-500 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20"></div>

                <div className="absolute top-6 left-4 sm:left-6 z-10">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm text-white transition-all border border-white/10 shadow-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-16">

                {/* Profile Header Card */}
                {/* ... (existing header code) ... */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6"
                >
                    {/* ... content of header ... */}
                    {/* Avatar - overlapping top */}
                    <div className="shrink-0 -mt-20 sm:-mt-24 relative">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-slate-900/5">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover rounded-xl bg-slate-100" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                    <User className="w-16 h-16 text-slate-400" />
                                </div>
                            )}


                        </div>
                        {/* Rank Badge */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white dark:border-slate-900 whitespace-nowrap">
                            {stats.overallRating > 80 ? "Master Debater" : "Rising Star"}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {user?.displayName || "Debater"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center justify-center sm:justify-start gap-2">
                            <Brain className="w-4 h-4 text-orange-500" />
                            Debate Enthusiast
                        </p>
                    </div>

                    {/* Stats - Right Aligned */}
                    <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-6 sm:pt-0 mt-2 sm:mt-0">
                        <div className="text-center px-4 sm:px-0">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.overallRating}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rating</div>
                        </div>
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        <div className="text-center px-4 sm:px-0">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Debates</div>
                        </div>
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        <div className="text-center px-4 sm:px-0">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.dates.length > 0 ?
                                    Math.max(1, Math.floor((new Date().getTime() - new Date(stats.dates[stats.dates.length - 1]).getTime()) / (1000 * 3600 * 24)))
                                    : 0}
                            </div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Day Streak</div>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setViewMode('overview')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${viewMode === 'overview' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <User className="w-4 h-4" />
                        Overview
                        {viewMode === 'overview' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setViewMode('settings')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${viewMode === 'settings' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <UserCog className="w-4 h-4" />
                        Settings
                        {viewMode === 'settings' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                        )}
                    </button>
                </div>

                {viewMode === 'overview' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


                        {/* Left Col - Skills (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 h-full"
                            >
                                <h3 className="text-base font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
                                    <Target className="w-4 h-4 text-orange-500" />
                                    Skill Breakdown
                                </h3>

                                {stats.total > 0 ? (
                                    <SkillBars scores={stats.avgScores} />
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-sm">Complete a debate to see your skills!</p>
                                    </div>
                                )}
                            </motion.div>


                        </div>

                        {/* Right Col - Activity & History (8 cols) */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Heatmap Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6"
                            >
                                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        Activity History
                                    </h3>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border-none focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer"
                                    >
                                        {stats.years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <ActivityHeatmap dates={stats.dates} year={selectedYear} />
                            </motion.div>

                            {/* Recent Debates List */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                        <TrendingUp className="w-4 h-4 text-orange-500" />
                                        Your Recent Performance ({selectedYear})
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {debates
                                        .filter(d => new Date(d.createdAt).getFullYear() === selectedYear)
                                        .slice(0, 5)
                                        .map((debate, i) => (
                                            <div key={debate.id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:shadow-md hover:border-orange-100 dark:hover:border-orange-900/30 transition-all duration-300 cursor-default">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-orange-600 transition-colors">
                                                        {debate.topic}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs text-slate-400 font-medium bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                            {new Date(debate.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {debate.duration} mins
                                                        </span>
                                                    </div>
                                                </div>

                                                {debate.analysis?.scores ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${(debate.analysis.scores.logic + debate.analysis.scores.persuasion + debate.analysis.scores.clarity + debate.analysis.scores.emotional_intelligence) / 4 >= 80
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                            }`}>
                                                            {Math.round(
                                                                (debate.analysis.scores.logic +
                                                                    debate.analysis.scores.persuasion +
                                                                    debate.analysis.scores.clarity +
                                                                    debate.analysis.scores.emotional_intelligence) / 4
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-slate-400 italic">Pending</span>
                                                )}
                                            </div>
                                        ))}

                                    {debates.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <BarChart3 className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm text-slate-500">No debates recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>



                        </div>

                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Account Settings */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6"
                        >
                            <h3 className="text-base font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
                                <UserCog className="w-4 h-4 text-orange-500" />
                                Account Settings
                            </h3>

                            <div className="space-y-6">
                                {/* Name Update */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Display Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            disabled={!isEditingName}
                                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-60"
                                        />
                                        {isEditingName ? (
                                            <button
                                                onClick={handleUpdateName}
                                                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Password Update */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Reset Password</label>
                                    <div className="space-y-3">
                                        {/* Current Password */}
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Current Password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* New Password */}
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                    </div>
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={!newPassword || !confirmPassword}
                                        className="w-full mt-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30 p-6"
                        >
                            <h3 className="text-base font-bold flex items-center gap-2 mb-4 text-red-600 dark:text-red-500">
                                <AlertTriangle className="w-4 h-4" />
                                Danger Zone
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                <div>
                                    <h4 className="font-bold text-sm text-red-900 dark:text-red-200">Delete Account</h4>
                                    <p className="text-xs text-red-600/80 dark:text-red-400">
                                        Permanently remove your account and all associated data.
                                    </p>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 bg-white dark:bg-red-950 text-red-600 dark:text-red-400 text-sm font-bold border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </div>
        </div>
    )
}
