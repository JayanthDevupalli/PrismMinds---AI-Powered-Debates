import jsPDF from "jspdf"

export type DebateMessage = {
  speaker: string
  message: string
  phase?: "opening" | "discussion" | "closing"
  timestamp?: string
}

export async function downloadDebateTranscriptPDF(
  topic: string,
  personaA: string,
  personaB: string,
  transcript: DebateMessage[] | undefined,
  createdAt: string,
  summary?: string,
) {
  if (!transcript || transcript.length === 0) {
    alert("No transcript to download")
    return
  }

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    })

    // Setup Constants
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let y = margin

    // Color Palette (Classic Professional)
    const colors = {
      primary: [31, 41, 55],    // Dark Gray/Black #1f2937
      accent: [79, 70, 229],    // Indigo #4f46e5
      secondary: [107, 114, 128], // Gray #6b7280
      light: [243, 244, 246],     // Light Gray #f3f4f6
    } as const

    // Helper: Check Page Break
    const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > pageHeight - margin) {
        pdf.addPage()
        y = margin
        return true
      }
      return false
    }

    // Helper: Draw Header on new pages?
    // For now, we only draw main header on page 1.

    // --- PAGE 1 HEADER ---

    // Brand
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
    pdf.text("PRISMMINDS", margin, y)

    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    const dateStr = new Date(createdAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    pdf.text(dateStr, pageWidth - margin, y, { align: "right" })

    y += 15

    // Title Section
    pdf.setFont("times", "bold")
    pdf.setFontSize(24)
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])

    const titleLines = pdf.splitTextToSize(topic, contentWidth)
    pdf.text(titleLines, margin, y)
    y += (titleLines.length * 9) + 10

    // Participants Section
    const boxBg = [249, 250, 251] // very light gray

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")

    // Measure Heights
    const colWidth = contentWidth / 2 - 5
    const pAName = pdf.splitTextToSize(personaA, colWidth)
    const pBName = pdf.splitTextToSize(personaB, colWidth)
    const boxHeight = Math.max(pAName.length, pBName.length) * 6 + 16

    // Draw Box
    pdf.setFillColor(boxBg[0], boxBg[1], boxBg[2])
    pdf.setDrawColor(229, 231, 235)
    pdf.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, "FD")

    // Proponent
    let py = y + 8
    pdf.setFontSize(9)
    pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
    pdf.text("PROPONENT", margin + 5, py)

    pdf.setFontSize(12)
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.text(pAName, margin + 5, py + 6)

    // Opponent
    pdf.setFontSize(9)
    pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
    pdf.text("OPPONENT", margin + (contentWidth / 2) + 5, py)

    pdf.setFontSize(12)
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.text(pBName, margin + (contentWidth / 2) + 5, py + 6)

    y += boxHeight + 15

    // Executive Summary (Optional)
    if (summary) {
      checkPageBreak(40)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      pdf.text("EXECUTIVE SUMMARY", margin, y)
      y += 6

      pdf.setFont("times", "italic")
      pdf.setFontSize(11)
      pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])

      const sumLines = pdf.splitTextToSize(summary, contentWidth)
      pdf.text(sumLines, margin, y)
      y += (sumLines.length * 5) + 15

      // Separator
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, y - 5, pageWidth - margin, y - 5)
    }

    // --- TRANSCRIPT ---
    checkPageBreak(20)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    // pdf.setFontStyle("bold") - removed, use setFont instead
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.text("Transcript", margin, y)
    y += 10

    let currentPhase = ""

    transcript.forEach((msg, index) => {
      // Phase Divider
      if (msg.phase && msg.phase !== currentPhase) {
        currentPhase = msg.phase
        const phaseTitle = msg.phase.charAt(0).toUpperCase() + msg.phase.slice(1)

        checkPageBreak(20)
        y += 5

        // Center text with lines
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])

        const textWidth = pdf.getTextWidth(phaseTitle)
        const center = pageWidth / 2

        pdf.text(phaseTitle, center, y, { align: 'center' })

        pdf.setDrawColor(229, 231, 235)
        pdf.line(margin, y - 1, center - (textWidth / 2) - 5, y - 1)
        pdf.line(center + (textWidth / 2) + 5, y - 1, pageWidth - margin, y - 1)

        y += 10
      }

      const isPersonaB = msg.speaker === personaB

      // Prepare Content
      pdf.setFont("times", "roman")
      pdf.setFontSize(11)
      const msgLines = pdf.splitTextToSize(msg.message, contentWidth - 8) // minus indent

      // Calculate Block Height
      // Speaker Header (6) + Text (lines * 5) + Padding (10)
      const blockHeight = 6 + (msgLines.length * 5) + 6

      checkPageBreak(blockHeight + 5)

      // Visual Indication Line
      pdf.setLineWidth(1)
      if (isPersonaB) {
        // Right/Different color for Opponent? Or just same style?
        // Let's stick to a clean left border for everyone, maybe different color
        pdf.setDrawColor(14, 165, 233) // Sky Blue
      } else {
        pdf.setDrawColor(79, 70, 229) // Indigo
      }

      pdf.line(margin, y + 2, margin, y + blockHeight - 2)

      // Speaker Name
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      pdf.text(msg.speaker, margin + 4, y + 5)

      // Timestamp
      if (msg.timestamp) {
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(9)
        pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
        pdf.text(msg.timestamp, pageWidth - margin, y + 5, { align: 'right' })
      }

      // Message Body
      pdf.setFont("times", "roman")
      pdf.setFontSize(11)
      pdf.setTextColor(31, 41, 55) // Darker gray for readibility
      pdf.text(msgLines, margin + 4, y + 10)

      y += blockHeight + 4
    })

    // Footer Page Numbers
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(156, 163, 175)
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" })
    }

    // Save
    const safeTopic = topic.substring(0, 30).trim().replace(/[^a-z0-9]/gi, "_") || "debate"
    pdf.save(`${safeTopic}_PrismMinds.pdf`)

  } catch (err) {
    console.error("PDF Generation Failed:", err)
    alert("Failed to generate PDF. Please try again.")
  }
}

export async function downloadAnalysisReportPDF(debate: any, analysis: any, userName?: string) {
  if (!analysis || !debate) return;

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    })

    // Layout Constants
    const pageWidth = 210
    const margin = 20
    let y = margin
    const contentWidth = pageWidth - (margin * 2)

    // Colors
    const colors = {
      primary: [15, 23, 42],      // Slate-900
      secondary: [71, 85, 105],   // Slate-600
      accent: [79, 70, 229],      // Indigo-600
      emerald: [16, 185, 129],    // Emerald-500
      light: [248, 250, 252]      // Slate-50
    }

    // --- PAGE 1: OVERVIEW ---

    // Header Logo
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(12)
    pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
    pdf.text("PRISMMINDS", margin, y)

    // Date
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    const dateStr = new Date(debate.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    pdf.text(dateStr, pageWidth - margin, y, { align: "right" })

    if (userName) {
      y += 5
      pdf.setFontSize(10)
      pdf.text(`Prepared for: ${userName}`, pageWidth - margin, y, { align: "right" })
    }

    y += 20

    // Title
    pdf.setFont("times", "bold")
    pdf.setFontSize(28)
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    const titleLines = pdf.splitTextToSize(debate.topic, contentWidth)
    pdf.text(titleLines, margin, y)
    y += (titleLines.length * 10) + 10

    // Overall Score Badge
    const overallScore = Math.round((analysis.scores.logic + analysis.scores.persuasion + analysis.scores.clarity + analysis.scores.emotional_intelligence) / 4)

    // Draw Badge Background
    pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2])
    pdf.roundedRect(margin, y, contentWidth, 50, 4, 4, "F")

    // Score Text inside Badge
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(48)
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.text(`${overallScore}`, margin + 20, y + 38)

    pdf.setFontSize(14)
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    pdf.text("/ 100", margin + 55, y + 38)

    pdf.setFontSize(12)
    pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
    pdf.text("OVERALL PERFORMANCE SCORE", margin + 20, y + 15)

    y += 65

    // Metric Grid (2x2)
    const metricsY = y
    const boxW = (contentWidth / 2) - 5
    const boxH = 25

    const drawMetric = (label: string, score: number, bx: number, by: number) => {
      pdf.setDrawColor(226, 232, 240)
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(bx, by, boxW, boxH, 2, 2, "FD")

      pdf.setFontSize(10)
      pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
      pdf.text(label.toUpperCase(), bx + 5, by + 16)

      pdf.setFontSize(14)
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      pdf.text(`${score}`, bx + boxW - 10, by + 16, { align: "right" })
    }

    drawMetric("Logic", analysis.scores.logic, margin, metricsY)
    drawMetric("Persuasion", analysis.scores.persuasion, margin + boxW + 10, metricsY)
    drawMetric("Clarity", analysis.scores.clarity, margin, metricsY + boxH + 5)
    drawMetric("Emotional EQ", analysis.scores.emotional_intelligence, margin + boxW + 10, metricsY + boxH + 5)

    y += (boxH * 2) + 20

    // Coach Feedback
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.text("Head Coach's Insight", margin, y)
    y += 8

    pdf.setFont("times", "italic")
    pdf.setFontSize(12)
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    const feedbackLines = pdf.splitTextToSize(`"${analysis.feedback.coach_note}"`, contentWidth)
    pdf.text(feedbackLines, margin, y)
    y += (feedbackLines.length * 6) + 15

    // --- PAGE CHANGE CHECK ---
    const checkHeight = (needed: number) => {
      if (y + needed > 280) {
        pdf.addPage()
        y = margin
      }
    }

    // Strengths
    checkHeight(60)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.setTextColor(16, 185, 129) // Emerald for Strengths
    pdf.text("Top Strengths", margin, y)
    y += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])

    analysis.feedback.strengths.forEach((str: string) => {
      const lines = pdf.splitTextToSize(`• ${str}`, contentWidth - 5)
      pdf.text(lines, margin + 5, y)
      y += (lines.length * 6) + 2
    })
    y += 10

    // Improvements
    checkHeight(60)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.setTextColor(245, 158, 11) // Amber for improvements
    pdf.text("Areas to Focus On", margin, y)
    y += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])

    analysis.feedback.improvements.forEach((imp: string) => {
      const lines = pdf.splitTextToSize(`• ${imp}`, contentWidth - 5)
      pdf.text(lines, margin + 5, y)
      y += (lines.length * 6) + 2
    })

    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`PrismMinds Analysis Report - Page ${i}`, pageWidth / 2, 290, { align: 'center' })
    }

    const safeTopic = debate.topic.substring(0, 20).replace(/[^a-z0-9]/gi, "_")
    pdf.save(`Analysis_${safeTopic}.pdf`)

  } catch (e) {
    console.error("PDF Report Gen Failed", e)
    alert("Could not generate report PDF.")
  }
}
