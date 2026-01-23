"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Trophy, Zap, Brain, Loader2, CheckCircle2, TrendingUp, AlertCircle, Quote, Download, Swords } from "lucide-react"
import { fetchDebateById, generateAnalysis } from "@/lib/api"
import confetti from "canvas-confetti"
import { downloadAnalysisReportPDF } from "@/lib/pdf-generator"
import { useAuth } from "@/lib/auth-context"

export default function AnalysisPage() {
    return (
        <Suspense fallback={<AnalysisSkeleton />}>
            <AnalysisContent />
        </Suspense>
    )
}

function AnalysisContent() {
    const { id } = useParams()
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [debate, setDebate] = useState<any>(null)
    const [analysis, setAnalysis] = useState<any>(null)
    const [generating, setGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

    useEffect(() => {
        const loadDebate = async () => {
            if (!id) return;
            try {
                const data = await fetchDebateById(id as string);
                setDebate(data);
                // If the debate already has analysis, set it here (optional, depending on API)
                if (data.analysis) {
                    setAnalysis(data.analysis);
                }
            } catch (error) {
                console.error("Failed to load debate:", error);
                showToast("Failed to load debate details", "error");
            } finally {
                setLoading(false);
            }
        };

        loadDebate();
    }, [id]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }



    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await generateAnalysis(id as string)
            setAnalysis(res.analysis)
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#059669'] // Emerald theme confettis
            })
        } catch (e) {
            showToast("Analysis generation failed. Please try again.", "error")
        } finally {
            setGenerating(false)
        }
    }



    const handleDownloadPDF = () => {
        if (!analysis || !debate) return
        // Use user.displayName or a fallback
        const userName = user?.displayName || "Debater"
        downloadAnalysisReportPDF(debate, analysis, userName)
        showToast("Downloading full report...", "success")
    }

    if (loading) return <AnalysisSkeleton />

    // Calculate Overall Score
    const overallScore = analysis?.scores
        ? Math.round((analysis.scores.logic + analysis.scores.persuasion + analysis.scores.clarity + analysis.scores.emotional_intelligence) / 4)
        : 0

    const challengerScore = searchParams.get("challengerScore")
    const challengerName = searchParams.get("challengerName")

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 pb-20">
            {/* Toast Notification */}
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className={`px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium text-sm ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {toast.message}
                </div>
            </div>

            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky-header">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition font-medium text-sm group"
                    >
                        <div className="p-1.5 rounded-md group-hover:bg-indigo-50 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
                            POST-DEBATE AUDIT
                        </span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-24 max-w-6xl mx-auto px-6">

                {/* State: No Analysis (Pre-generation) */}
                {!analysis ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Compact, Refined Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80 w-full max-w-xl flex flex-col items-center text-center relative overflow-hidden ring-1 ring-slate-400/5"
                        >
                            {/* Simple Top Decoration */}
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mb-8"></div>

                            {/* Icon */}
                            <div className="mb-6 p-4 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                                <Sparkles className="w-6 h-6 text-slate-400" />
                            </div>

                            {/* Hero Text */}
                            <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
                                Analysis Ready
                            </h1>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-sm">
                                Debate on <span className="text-slate-700 font-semibold">"{debate?.topic}"</span> is complete. Generate your performance report.
                            </p>

                            {/* Minimal Stats */}
                            <div className="flex items-center justify-center gap-6 mb-8 w-full border-t border-b border-slate-50 py-4">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">{debate?.transcript?.length || 0}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exchanges</div>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">
                                        {new Date(debate?.createdAt).getDate()}
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {new Date(debate?.createdAt).toLocaleString('default', { month: 'short' })}
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-slate-200 transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2.5 disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate Report</span>
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </>
                                )}
                            </button>

                        </motion.div>
                    </div>
                ) : (
                    // State: Analysis Results
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">

                        {/* Comparison Card */}
                        {challengerScore && (
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/30"
                            >
                                {/* Ambient Glow */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] -mr-32 -mt-32 mix-blend-screen animate-pulse-slow"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -ml-32 -mb-32 mix-blend-screen"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4 backdrop-blur-md">
                                            <Swords className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Challenge Results</span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                                            {Number(overallScore) > Number(challengerScore) ? "Victory! You won! 🎉" : Number(overallScore) === Number(challengerScore) ? "It's a Tie! 🤝" : "Nice Try! 🛡️"}
                                        </h2>
                                        <p className="text-indigo-200 font-medium text-lg max-w-lg">
                                            {Number(overallScore) > Number(challengerScore)
                                                ? `Incredible! You outperformed ${challengerName} by ${Number(overallScore) - Number(challengerScore)} points.`
                                                : `So close! You were just ${Number(challengerScore) - Number(overallScore)} points shy of beating ${challengerName}.`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-0 bg-white/5 rounded-2xl border border-white/10 p-2 backdrop-blur-md">
                                        {/* Challenger */}
                                        <div className="px-8 py-4 text-center border-r border-white/10 opacity-70">
                                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{challengerName}</div>
                                            <div className="text-3xl font-black text-white">{challengerScore}</div>
                                        </div>

                                        {/* User */}
                                        <div className="px-8 py-4 text-center bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 rounded-xl border border-emerald-500/30 shadow-lg transform scale-105 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-emerald-400/10 blur-xl"></div>
                                            <div className="relative z-10">
                                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">You</div>
                                                <div className="text-4xl font-black text-white">
                                                    {overallScore}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 1. Hero Analytics Section */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                            {/* Title & Overall Score */}
                            <div className="md:col-span-5 flex flex-col gap-6">
                                <div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider mb-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Analysis Complete
                                    </motion.div>
                                    <h1 className="text-3xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                        Performance Audit
                                    </h1>
                                    <p className="text-slate-500 text-lg">
                                        Topic: <span className="font-semibold text-slate-900">"{debate?.topic}"</span>
                                    </p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">Overall Performance</p>
                                    <div className="relative z-10">
                                        <span className="text-7xl font-black text-slate-900 tracking-tighter">{overallScore}</span>
                                        <span className="text-2xl text-slate-400 font-medium ml-1">/100</span>
                                    </div>
                                    <div className="mt-4 flex gap-2 justify-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Sparkles key={star} className={`w-5 h-5 ${overallScore > star * 20 - 10 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Radar Chart (Analytics Vibe) */}
                            <div className="md:col-span-7">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 text-white h-full relative overflow-hidden flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>

                                    <div className="relative z-10 w-full max-w-md">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                                <Brain className="w-4 h-4 text-emerald-400" />
                                                Skill Profile
                                            </h3>
                                            <span className="text-xs font-mono text-emerald-300 bg-emerald-900/50 px-2 py-1 rounded">AI METRICS V2.0</span>
                                        </div>
                                        <div className="aspect-square w-full max-h-[300px]">
                                            <RadarChart scores={analysis.scores} />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* 2. Detailed Metrics (Mini Cards) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard label="Logic" score={analysis.scores.logic} icon={<Brain className="w-5 h-5 text-blue-500" />} colorClass="text-blue-600" bgClass="bg-blue-50" delay={0.3} />
                            <MetricCard label="Persuasion" score={analysis.scores.persuasion} icon={<Zap className="w-5 h-5 text-violet-500" />} colorClass="text-violet-600" bgClass="bg-violet-50" delay={0.35} />
                            <MetricCard label="Clarity" score={analysis.scores.clarity} icon={<Sparkles className="w-5 h-5 text-amber-500" />} colorClass="text-amber-600" bgClass="bg-amber-50" delay={0.4} />
                            <MetricCard label="Emotional EQ" score={analysis.scores.emotional_intelligence} icon={<TrendingUp className="w-5 h-5 text-pink-500" />} colorClass="text-pink-600" bgClass="bg-pink-50" delay={0.45} />
                        </div>

                        {/* 3. Coach's Feedback */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Quote className="w-32 h-32 text-indigo-900 transform rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Trophy className="w-5 h-5 text-indigo-700" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Head Coach's Insight</h2>
                                </div>
                                <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium">
                                    "{analysis.feedback.coach_note}"
                                </p>
                            </div>
                        </motion.div>

                        {/* 4. Strengths & Improvements */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-700" /></div>
                                    <h3 className="font-bold text-slate-900">Top Strengths</h3>
                                </div>
                                <ul className="space-y-4">{analysis.feedback.strengths.map((item: string, i: number) => (<li key={i} className="flex gap-4 items-start"><span className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span><span className="text-slate-600 font-medium">{item}</span></li>))}</ul>
                            </motion.div>

                            {/* Improvements */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-100 rounded-lg"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
                                    <h3 className="font-bold text-slate-900">Areas to Focus On</h3>
                                </div>
                                <ul className="space-y-4">{analysis.feedback.improvements.map((item: string, i: number) => (<li key={i} className="flex gap-4 items-start"><span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span><span className="text-slate-600 font-medium">{item}</span></li>))}</ul>
                            </motion.div>
                        </div>

                        {/* 5. Recommended Guides CTA (Must Have) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-1 shadow-lg mt-8"
                        >
                            <div className="bg-slate-900 rounded-[22px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                                <div className="flex items-start gap-6 relative z-10 max-w-2xl">
                                    <div className="p-4 bg-indigo-500/20 rounded-2xl hidden sm:block">
                                        <Brain className="w-8 h-8 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Want to master these skills?</h3>
                                        <p className="text-slate-300 text-lg leading-relaxed">
                                            Our <span className="text-indigo-300 font-semibold">Expert Learning Guides</span> cover advanced Logic, Rhetoric, and Debate strategies. Level up your game now.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push("/knowledgecenter/guides/")}
                                    className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white text-lg font-bold rounded-xl transition shadow-lg hover:shadow-indigo-500/30 shrink-0 w-full md:w-auto flex items-center justify-center gap-2 group relative z-10"
                                >
                                    Explore Guides
                                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition" />
                                </button>
                            </div>
                        </motion.div>


                        {/* Footer */}

                        {/* Footer Actions */}
                        <div className="md:col-span-12 flex flex-col sm:flex-row justify-center items-center pt-8 pb-12 gap-4">
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 hover:scale-[1.02] shadow-xl hover:shadow-2xl transition-all active:scale-95"
                            >
                                <Download className="w-5 h-5" />
                                Download Full Report
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        showToast("Creating unique challenge link...", "success")
                                        const { createChallenge } = await import("@/lib/api")

                                        const result = await createChallenge({
                                            topic: debate?.topic,
                                            score: overallScore,
                                            challengerName: user?.displayName || "A Debater",
                                            challengerId: user?.uid
                                        })

                                        if (result.success && result.id) {
                                            const url = `${window.location.origin}/challenge?id=${result.id}`
                                            await navigator.clipboard.writeText(url)
                                            showToast("Secure Challenge Link Copied! Good for 7 days.")
                                        } else {
                                            throw new Error("Failed to create challenge")
                                        }
                                    } catch (e) {
                                        console.error(e)
                                        showToast("Failed to create challenge link", "error")
                                    }
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                <Swords className="w-5 h-5" />
                                Challenge Friends
                            </button>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}


function MetricCard({ label, score, icon, colorClass, bgClass, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow h-40"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${bgClass}`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className={`text-3xl font-black ${colorClass} mb-1 tracking-tight`}>
                    {score}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                </div>
            </div>
        </motion.div>
    )
}

function RadarChart({ scores }: { scores: { logic: number, persuasion: number, clarity: number, emotional_intelligence: number } }) {
    const data = [
        { label: "LOGIC", value: scores.logic },
        { label: "PERSUASION", value: scores.persuasion },
        { label: "CLARITY", value: scores.clarity },
        { label: "EQ", value: scores.emotional_intelligence },
    ]

    // Scale and calculations
    const size = 300
    const center = size / 2
    const radius = 90 // Slightly smaller to fit labels
    const angleStep = (Math.PI * 2) / 4

    // Helper to get coords
    const getPoint = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2 // Start from top (-90deg)
        const r = (value / 100) * radius
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        return `${x},${y}`
    }

    // Background Levels (25%, 50%, 75%, 100%)
    const levels = [0.25, 0.5, 0.75, 1]

    // Generate the path for the actual score
    const scorePath = data.map((d, i) => getPoint(d.value, i)).join(" ")

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
                {/* Levels (Hexagons/Diamonds) */}
                {levels.map((level, i) => (
                    <polygon
                        key={i}
                        points={data.map((_, idx) => {
                            const angle = idx * angleStep - Math.PI / 2
                            const r = (level * 100 * radius) / 100
                            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
                        }).join(" ")}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {data.map((item, i) => {
                    const angle = i * angleStep - Math.PI / 2
                    const x = center + radius * Math.cos(angle)
                    const y = center + radius * Math.sin(angle)
                    return (
                        <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    )
                })}

                {/* Data Polygon */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0, originX: "50%", originY: "50%" }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    points={scorePath}
                    fill="rgba(16, 185, 129, 0.3)" // Emerald green fill
                    stroke="#34d399" // Emerald-400 stroke
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data Points & Labels */}
                {data.map((item, i) => {
                    const angle = i * angleStep - Math.PI / 2
                    // Label radius
                    const labelR = radius + 30
                    const lx = center + labelR * Math.cos(angle)
                    const ly = center + labelR * Math.sin(angle)

                    // Point co-ords
                    const [px, py] = getPoint(item.value, i).split(",").map(Number)

                    return (
                        <g key={i}>
                            <motion.circle
                                cx={px} cy={py} r="4" fill="#fff" stroke="#10b981" strokeWidth="2" // Emerald-500 stroke
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }}
                            />
                            {/* Label */}
                            <text
                                x={lx} y={ly}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-slate-400 text-[11px] font-bold tracking-widest"
                            >
                                {item.label}
                            </text>
                            {/* Value */}
                            <text
                                x={lx} y={ly + 14}
                                textAnchor="middle"
                                className="fill-white text-sm font-bold"
                            >
                                {item.value}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

function AnalysisSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Loading analysis...</p>
            </div>
        </div>
    )
}
