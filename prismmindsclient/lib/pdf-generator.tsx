import jsPDF from "jspdf"
import html2canvas from "html2canvas"

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

  // Create an iframe to render the HTML
  // We use fixed positioning off-screen but visible opacity to ensure html2canvas captures it correctly
  const iframe = document.createElement("iframe")
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    width: "794px", // A4 width at ~96 DPI
    height: "auto",
    minHeight: "1123px", // A4 height
    zIndex: "-9999",
    opacity: "1", // Must be visible for some browsers/html2canvas
    pointerEvents: "none",
    border: "none",
    background: "#ffffff",
    visibility: "visible"
  })
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) throw new Error("Could not access iframe document")

    // Build the inner HTML
    const innerHtml = getPDFTemplate(topic, personaA, personaB, transcript, createdAt, summary)

    doc.open()
    doc.write(innerHtml)
    doc.close()

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (doc.fonts && doc.fonts.ready) {
      await doc.fonts.ready.catch(e => console.warn("Font loading error", e));
    }

    // Capture with html2canvas
    const canvas = await html2canvas(doc.body as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      logging: false, // disable noise
      onclone: (clonedDoc) => {
        const body = clonedDoc.body;
        if (body) {
          body.style.background = "#ffffff";
          // Force show everything
          body.style.display = "block";
        }
      }
    })

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas generation failed or returned empty")
    }

    // Prepare PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm

    // Calculate the height of the image in the PDF
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const imgData = canvas.toDataURL("image/png")

    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add potential extra pages
    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Generate filename and save
    const safeTopic = topic.substring(0, 30).trim().replace(/[^a-z0-9]/gi, "_") || "debate"
    const filename = `${safeTopic}_transcript.pdf`

    pdf.save(filename)

  } catch (err) {
    console.warn("Advanced PDF generation failed, switching to high-fidelity fallback:", err)
    try {
      generateVisualFallbackPDF(topic, personaA, personaB, transcript, createdAt, summary)
    } catch (fallbackErr) {
      console.error("Fallback PDF generation also failed:", fallbackErr)
      alert("Failed to generate PDF. Please try again.")
    }
  } finally {
    // Cleanup
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
  }
}

function getPDFTemplate(
  topic: string,
  personaA: string,
  personaB: string,
  transcript: DebateMessage[],
  createdAt: string,
  summary?: string,
) {
  let transcriptHtml = ''
  let currentPhase = ""

  transcript.forEach((msg) => {
    if (msg.phase && msg.phase !== currentPhase) {
      currentPhase = msg.phase
      const phaseName = msg.phase.charAt(0).toUpperCase() + msg.phase.slice(1)
      transcriptHtml += `
        <div class="phase-divider">
           <div class="phase-line"></div>
           <div class="phase-label">${phaseName}</div>
           <div class="phase-line"></div>
        </div>
      `
    }

    const isPersonaB = msg.speaker === personaB
    const sideClass = isPersonaB ? "is-b" : "is-a"

    transcriptHtml += `
      <div class="message-block ${sideClass}">
         <div class="speaker-line">
            <span class="speaker-name">${escapeHtml(msg.speaker)}</span>
            ${msg.timestamp ? `<span class="msg-time">${msg.timestamp}</span>` : ''}
         </div>
         <div class="message-content">${escapeHtml(msg.message)}</div>
      </div>
    `
  })

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Debate Transcript</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700;800&display=swap');

          :root {
            --primary: #4f46e5;
            --accent: #06b6d4;
            --text-main: #111827;
            --text-muted: #4b5563;
            --text-light: #9ca3af;
            --bg-page: #ffffff;
            --bg-subtle: #f9fafb;
            --border: #e5e7eb;
          }

          body {
            margin: 0;
            padding: 48px 56px;
            background: #ffffff;
            font-family: 'Inter', sans-serif;
            color: var(--text-main);
            width: 794px; /* Fixed width for consistent capture */
            box-sizing: border-box;
          }

          /* --- Header Section --- */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 20px;
            margin-bottom: 40px;
          }

          .brand-col { display: flex; flex-direction: column; }
          .brand-logo {
            font-size: 20px; font-weight: 800; color: var(--primary);
            text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;
          }
          .brand-tag { font-size: 10px; font-weight: 600; color: var(--text-light); letter-spacing: 0.1em; text-transform: uppercase; }

          .meta-col { text-align: right; }
          .meta-date { font-size: 12px; font-weight: 500; color: var(--text-muted); }

          /* --- Cover / Title Section --- */
          .cover-section { margin-bottom: 48px; }
          .topic-label { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          .topic-title { font-family: 'Crimson Pro', serif; font-size: 32px; line-height: 1.25; font-weight: 600; color: var(--text-main); margin: 0 0 32px 0; }

          /* --- Participants -- */
          .participants {
            display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
            margin-bottom: 40px; padding: 24px; background: var(--bg-subtle);
            border-radius: 12px; border: 1px solid var(--border);
          }
          .participant-card { display: flex; flex-direction: column; gap: 4px; }
          .role-badge {
             display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase;
             padding: 4px 8px; border-radius: 4px; width: fit-content; margin-bottom: 6px;
          }
          .role-pro { background: #e0e7ff; color: var(--primary); }
          .role-con { background: #cffafe; color: var(--accent); }
          
          .participant-name { font-size: 15px; font-weight: 700; color: var(--text-main); }
          .participant-desc { font-size: 12px; color: var(--text-muted); }

          /* --- Summary Section --- */
          .summary-box { padding: 0 0 32px 0; margin-bottom: 32px; border-bottom: 1px solid var(--border); }
          .section-heading { font-size: 14px; font-weight: 700; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
          .summary-text { font-family: 'Crimson Pro', serif; font-size: 16px; line-height: 1.6; color: var(--text-muted); font-style: italic; }

          /* --- Transcript --- */
          .phase-divider { display: flex; align-items: center; gap: 16px; margin: 40px 0 24px; }
          .phase-line { flex: 1; height: 1px; background: var(--border); }
          .phase-label { font-size: 11px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }

          .message-block { margin-bottom: 24px; position: relative; padding-left: 16px; border-left: 3px solid transparent; }
          .is-a { border-left-color: var(--primary); }
          .is-b { border-left-color: var(--accent); }

          .speaker-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
          .speaker-name { font-size: 13px; font-weight: 700; color: var(--text-main); }
          .msg-time { font-size: 10px; color: var(--text-light); }
          
          .message-content { font-family: 'Crimson Pro', serif; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap; }

          .footer { margin-top: 60px; padding-top: 16px; border-top: 1px solid var(--border); text-align: center; font-size: 10px; color: var(--text-light); }
        </style>
      </head>
      <body>
          <!-- Header -->
          <div class="header">
            <div class="brand-col">
              <div class="brand-logo">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 19H22L12 2Z" fill="currentColor"/></svg>
                 PrismMinds
              </div>
              <div class="brand-tag">Intelligent Debate Archive</div>
            </div>
            <div class="meta-col">
              <div class="meta-date">${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <!-- Title -->
          <div class="cover-section">
             <div class="topic-label">Debate Topic</div>
             <div class="topic-title">${escapeHtml(topic)}</div>

             <div class="participants">
                <div class="participant-card">
                   <div class="role-badge role-pro">Proponent</div>
                   <div class="participant-name">${escapeHtml(personaA)}</div>
                </div>
                <div class="participant-card">
                   <div class="role-badge role-con">Opponent</div>
                   <div class="participant-name">${escapeHtml(personaB)}</div>
                </div>
             </div>
          </div>

          ${summary ? `
            <div class="summary-box">
               <div class="section-heading"> Executive Summary </div>
               <div class="summary-text">${escapeHtml(summary)}</div>
            </div>
          ` : ''}

          <!-- Transcript -->
          <div class="section-heading"> Debate Transcript </div>
          ${transcriptHtml}

          <div class="footer">
             Generated by PrismMinds AI • prismminds.app
          </div>
      </body>
    </html>
  `
}

// Visual Fallback logic that mimics the premium design manually via jsPDF commands
function generateVisualFallbackPDF(
  topic: string,
  personaA: string,
  personaB: string,
  transcript: DebateMessage[],
  createdAt: string,
  summary?: string
) {
  const pdf = new jsPDF()
  const pageWidth = 210
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let y = 20

  // Colors
  const colPrimary = [79, 70, 229] // #4f46e5
  const colAccent = [6, 182, 212] // #06b6d4
  const colTextMain = [17, 24, 39] // #111827
  const colTextMuted = [75, 85, 99] // #4b5563

  // Helper: check page break
  const checkPage = (heightNeeded: number) => {
    if (y + heightNeeded > 280) {
      pdf.addPage()
      y = 20
    }
  }

  // Header line
  pdf.setDrawColor(colPrimary[0], colPrimary[1], colPrimary[2])
  pdf.setLineWidth(1)
  pdf.line(margin, y + 12, pageWidth - margin, y + 12)

  // Brand
  pdf.setFontSize(16)
  pdf.setTextColor(colPrimary[0], colPrimary[1], colPrimary[2])
  pdf.setFont("helvetica", "bold")
  pdf.text("PRISMMINDS", margin, y + 6)

  // Tagline
  pdf.setFontSize(8)
  pdf.setTextColor(156, 163, 175)
  pdf.setFont("helvetica", "bold")
  pdf.text("INTELLIGENT DEBATE ARCHIVE", margin, y + 10)

  // Date
  pdf.setFontSize(10)
  pdf.setTextColor(colTextMuted[0], colTextMuted[1], colTextMuted[2])
  pdf.setFont("helvetica", "normal")
  const dateStr = new Date(createdAt).toLocaleDateString()
  pdf.text(dateStr, pageWidth - margin - pdf.getStringUnitWidth(dateStr) * 4, y + 8)

  y += 28

  // Topic Label
  pdf.setFontSize(9)
  pdf.setTextColor(colAccent[0], colAccent[1], colAccent[2])
  pdf.setFont("helvetica", "bold")
  pdf.text("DEBATE TOPIC", margin, y)
  y += 6

  // Topic Title
  pdf.setFontSize(20)
  pdf.setTextColor(colTextMain[0], colTextMain[1], colTextMain[2])
  pdf.setFont("times", "bold")
  const topicLines = pdf.splitTextToSize(topic, contentWidth)
  pdf.text(topicLines, margin, y)
  y += (topicLines.length * 8) + 12

  // Participants Box (simulated with rect)
  const boxHeight = 24
  pdf.setFillColor(249, 250, 251) // #f9fafb
  pdf.setDrawColor(229, 231, 235) // #e5e7eb
  pdf.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, "FD")

  // Pro
  const colWidth = contentWidth / 2
  let py = y + 8
  pdf.setFontSize(8)
  pdf.setTextColor(colPrimary[0], colPrimary[1], colPrimary[2])
  pdf.setFont("helvetica", "bold")
  pdf.text("PROPONENT", margin + 6, py)

  pdf.setFontSize(12)
  pdf.setTextColor(colTextMain[0], colTextMain[1], colTextMain[2])
  pdf.setFont("helvetica", "bold")
  pdf.text(personaA, margin + 6, py + 6)

  // Con
  pdf.setFontSize(8)
  pdf.setTextColor(colAccent[0], colAccent[1], colAccent[2])
  pdf.text("OPPONENT", margin + colWidth + 6, py)

  pdf.setFontSize(12)
  pdf.setTextColor(colTextMain[0], colTextMain[1], colTextMain[2])
  pdf.text(personaB, margin + colWidth + 6, py + 6)

  y += boxHeight + 20

  // Summary
  if (summary) {
    checkPage(40)
    pdf.setFontSize(10)
    pdf.setTextColor(colTextMain[0], colTextMain[1], colTextMain[2])
    pdf.setFont("helvetica", "bold")
    pdf.text("EXECUTIVE SUMMARY", margin, y)
    y += 6

    pdf.setFontSize(11)
    pdf.setFont("times", "italic")
    pdf.setTextColor(colTextMuted[0], colTextMuted[1], colTextMuted[2])
    const sumLines = pdf.splitTextToSize(summary, contentWidth)
    pdf.text(sumLines, margin, y)
    y += (sumLines.length * 6) + 16

    pdf.setDrawColor(229, 231, 235)
    pdf.line(margin, y - 8, pageWidth - margin, y - 8)
  }

  // Heading
  checkPage(20)
  pdf.setFontSize(11)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(colTextMain[0], colTextMain[1], colTextMain[2])
  pdf.text("Full Transcript", margin, y)
  y += 10

  // Transcript Loop
  let currentPhase = ""

  transcript.forEach(msg => {
    // Phase header
    if (msg.phase && msg.phase !== currentPhase) {
      checkPage(15)
      currentPhase = msg.phase
      y += 4

      pdf.setDrawColor(209, 213, 219) // thin gray line
      pdf.line(margin, y, pageWidth - margin, y)

      // Label in middle
      const phaseLabel = msg.phase.toUpperCase()
      pdf.setFillColor(255, 255, 255)
      const labelW = pdf.getStringUnitWidth(phaseLabel) * 4 // approx
      pdf.rect((pageWidth / 2) - (labelW / 2) - 4, y - 2, labelW + 8, 4, "F")

      pdf.setFontSize(8)
      pdf.setTextColor(156, 163, 175)
      pdf.setFont("helvetica", "bold")
      pdf.text(phaseLabel, pageWidth / 2, y + 1, { align: 'center' })

      y += 12
    }

    // Message Block
    // Estimate height
    pdf.setFont("times", "roman")
    pdf.setFontSize(11)
    const msgLines = pdf.splitTextToSize(msg.message, contentWidth - 8) // indent slightly
    const heightNeeded = (msgLines.length * 6) + 12
    checkPage(heightNeeded)

    // Side bar
    const isB = msg.speaker === personaB
    pdf.setDrawColor(isB ? colAccent[0] : colPrimary[0], isB ? colAccent[1] : colPrimary[1], isB ? colAccent[2] : colPrimary[2])
    pdf.setLineWidth(1)
    pdf.line(margin, y, margin, y + heightNeeded - 4)

    // Speaker Name
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.setTextColor(colTextMain[0], colTextMain[1], colTextMain[2])
    pdf.text(msg.speaker, margin + 4, y + 3)

    // Time
    if (msg.timestamp) {
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(156, 163, 175)
      pdf.text(msg.timestamp, pageWidth - margin, y + 3, { align: 'right' })
    }

    // Text
    pdf.setFont("times", "roman")
    pdf.setFontSize(11)
    pdf.setTextColor(55, 65, 81)
    pdf.text(msgLines, margin + 4, y + 9)

    y += heightNeeded
  })

  const filename = `${topic.substring(0, 30).trim().replace(/[^a-z0-9]/gi, "_")}_Transcript.pdf`
  pdf.save(filename)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
