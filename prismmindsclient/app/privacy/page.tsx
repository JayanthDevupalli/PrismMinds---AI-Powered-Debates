"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, ShieldCheck, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

// Section Data Structure
const sections = [
    {
        id: "information-collection",
        title: "1. Information Collection",
        content: (
            <div className="space-y-4">
                <p>PrismMinds ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website application PrismMinds (the "Application").</p>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Application includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and profile image that you voluntarily give to us when you register with the Application or when you choose to participate in various activities related to the Application.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
                    <li><strong>Debate Content:</strong> Text and audio data generated during your interactions with our AI personas. This allows us to generate transcripts, summaries, and performance analytics.</li>
                </ul>
            </div>
        )
    },
    {
        id: "use-of-information",
        title: "2. Use of Information",
        content: (
            <div className="space-y-4">
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Create and manage your account.</li>
                    <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Enable user-to-user communications where applicable.</li>
                    <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
                    <li>Increase the efficiency and operation of the Application.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                    <li>Process payments and refunds (if applicable).</li>
                </ul>
            </div>
        )
    },
    {
        id: "disclosure-of-info",
        title: "3. Disclosure of Information",
        content: (
            <div className="space-y-4">
                <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance. Specifically, debate content is processed by large language models (LLMs) to generate responses.</li>
                </ul>
            </div>
        )
    },
    {
        id: "data-security",
        title: "4. Data Security",
        content: (
            <div className="space-y-4">
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            </div>
        )
    },
    {
        id: "childrens-privacy",
        title: "5. Policy for Children",
        content: (
            <div className="space-y-4">
                <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.</p>
            </div>
        )
    }
]

export default function PrivacyPolicy() {
    const [activeSection, setActiveSection] = useState(sections[0].id)

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const yOffset = -100 // Banner offset
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset
            window.scrollTo({ top: y, behavior: 'smooth' })
            setActiveSection(id)
        }
    }

    // Handle scroll spy
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150

            for (const section of sections) {
                const element = document.getElementById(section.id)
                if (element) {
                    const top = element.offsetTop
                    const height = element.offsetHeight

                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section.id)
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 selection:bg-orange-100 selection:text-orange-900">

            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6">
                    <Link href="/" className="mr-8 flex items-center space-x-2 transition-opacity hover:opacity-80">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Return to Platform</span>
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            <Link href="/terms" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">
                                Terms of Service
                            </Link>
                            <span className="text-slate-300">|</span>
                            <span className="text-sm font-bold text-orange-600">Privacy Policy</span>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Navigation - Desktop */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-28 space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Privacy Policy</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={cn(
                                            "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-left",
                                            activeSection === section.id
                                                ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                                        )}
                                    >
                                        {activeSection === section.id && <ChevronRight className="w-3 h-3 mr-2" />}
                                        {section.title}
                                    </button>
                                ))}
                            </nav>

                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    GDPR & CCPA
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    We are compliant with major data protection regulations. You have the right to access, rectify, or delete your data at any time.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Header Title */}
                    <div className="lg:hidden space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Privacy Policy</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-16 max-w-3xl">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-28">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm font-bold dark:bg-orange-900/30 dark:text-orange-400">
                                        {section.title.split('.')[0]}
                                    </span>
                                    {section.title.split('. ')[1]}
                                </h2>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {section.content}
                                </div>
                            </section>
                        ))}

                        {/* Contact Section */}
                        <div className="p-8 mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Contact Us</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                If you have questions or comments about this Privacy Policy, please contact us at:
                            </p>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                <p>PrismMinds Legal Team</p>
                                <a href="mailto:support@prismminds.com" className="text-orange-600 hover:underline">support@prismminds.com</a>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 mt-12">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} PrismMinds. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
