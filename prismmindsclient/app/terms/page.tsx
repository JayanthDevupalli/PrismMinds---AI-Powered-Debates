"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronRight, Gavel, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

// Section Data Structure
const sections = [
    {
        id: "agreement",
        title: "1. Agreement to Terms",
        content: (
            <div className="space-y-4">
                <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and PrismMinds ("we," "us," or "our"), concerning your access to and use of the PrismMinds platform website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").</p>
                <p>You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
            </div>
        )
    },
    {
        id: "intellectual-property",
        title: "2. Intellectual Property Rights",
        content: (
            <div className="space-y-4">
                <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
                <p>The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. No part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.</p>
            </div>
        )
    },
    {
        id: "user-representations",
        title: "3. User Representations",
        content: (
            <div className="space-y-4">
                <p>By using the Site, you represent and warrant that:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>All registration information you submit will be true, accurate, current, and complete.</li>
                    <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                    <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                    <li>You are not a minor in the jurisdiction in which you reside.</li>
                    <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                    <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                </ul>
            </div>
        )
    },
    {
        id: "ai-usage",
        title: "4. AI & Content Disclaimer",
        content: (
            <div className="space-y-4">
                <p>PrismMinds utilizes artificial intelligence ("AI") to simulate debate opponents and generate analysis. You acknowledge that:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>AI-generated content may be factually incorrect, biased, or offensive. We do not endorse or guarantee the accuracy of AI outputs.</li>
                    <li>The platform is intended for educational and entertainment purposes only.</li>
                    <li>You should not rely on the platform for professional advice (legal, medical, financial, etc.).</li>
                </ul>
            </div>
        )
    },
    {
        id: "prohibited-activities",
        title: "5. Prohibited Activities",
        content: (
            <div className="space-y-4">
                <p>You may not use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
                <p>Prohibited activity includes, but is not limited to:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Systematically retrieving data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                    <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                    <li>Circumvent, disable, or otherwise interfere with security-related features of the Site.</li>
                    <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Site.</li>
                    <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
                </ul>
            </div>
        )
    }
]

export default function TermsOfService() {
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
                            <span className="text-sm font-bold text-orange-600">Terms of Service</span>
                            <span className="text-slate-300">|</span>
                            <Link href="/privacy" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">
                                Privacy Policy
                            </Link>
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
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Terms of Service</h1>
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
                                    <FileText className="w-4 h-4 text-orange-600" />
                                    Legal Binding
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    By utilizing our platform, you acknowledge and agree to these terms in full compliance with international digital service laws.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Header Title */}
                    <div className="lg:hidden space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Terms of Service</h1>
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
                                For legal inquiries or clarifications regarding these terms, please contact:
                            </p>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                <p>PrismMinds Legal Team</p>
                                <a href="mailto:legal@prismminds.com" className="text-orange-600 hover:underline">legal@prismminds.com</a>
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
