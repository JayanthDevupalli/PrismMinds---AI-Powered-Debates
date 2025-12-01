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

  // Build inner HTML content for the iframe with modern design
  let innerHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          /* Modern professional PDF styling */
          html,body{margin:0;padding:0;background:#ffffff;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",system-ui,sans-serif;line-height:1.6}
          .container{padding:40px 60px;width:760px;box-sizing:border-box;position:relative;z-index:1}
          
          /* Typography */
          h1{font-size:32px;margin:0 0 16px;color:#0f172a;font-weight:700;line-height:1.2;letter-spacing:-0.025em}
          h2{font-size:18px;margin:0 0 12px;color:#1e293b;font-weight:600}
          p{margin:0 0 12px;color:#475569;font-size:14px}
          
          /* Layout elements */
          hr{border:0;height:1px;background:#e2e8f0;margin:28px 0}
          
          /* Header section */
          .header{
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            margin-bottom:40px;
            padding-bottom:24px;
            border-bottom:2px solid #e2e8f0;
          }
          .branding{display:flex;align-items:center;gap:12px}
          .logo{width:40px;height:40px}
          .brand-info .name{
            font-size:24px;
            font-weight:700;
            background:linear-gradient(135deg,#4f46e5 0%,#06b6d4 100%);
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
            background-clip:text;
            margin-bottom:2px
          }
          .brand-info .tagline{
            font-size:11px;
            color:#64748b;
            font-weight:500
          }
          .metadata{text-align:right;font-size:12px;color:#64748b}
          .metadata .date{display:flex;align-items:center;gap:6px;margin-bottom:4px}
          
          /* Topic & personas section */
          .debate-header{margin-bottom:32px}
          .topic-title{
            font-size:28px;
            font-weight:700;
            color:#0f172a;
            margin-bottom:18px;
            line-height:1.25
          }
          .personas{
            display:flex;
            gap:16px;
            margin-bottom:14px
          }
          .persona{
            flex:1;
            padding:14px 16px;
            background:linear-gradient(135deg,rgba(79,70,229,0.08) 0%,rgba(79,70,229,0.04) 100%);
            border-radius:10px;
            border:1px solid #e2e8f0
          }
          .persona.b{
            background:linear-gradient(135deg,rgba(6,182,212,0.08) 0%,rgba(6,182,212,0.04) 100%)
          }
          .persona-label{
            font-size:11px;
            font-weight:600;
            color:#64748b;
            text-transform:uppercase;
            letter-spacing:0.05em;
            margin-bottom:4px
          }
          .persona-name{
            font-size:15px;
            font-weight:700;
            color:#0f172a
          }
          .debate-stats{
            font-size:12px;
            color:#64748b;
            margin-top:12px;
            display:flex;
            gap:20px
          }
          .stat{display:flex;align-items:center;gap:6px}
          
          /* Phase dividers */
          .phase{
            margin:32px 0 20px;
            text-align:center;
            font-weight:700;
            color:#0f172a;
            font-size:12px;
            text-transform:uppercase;
            letter-spacing:0.08em;
            position:relative;
            display:flex;
            align-items:center;
            gap:12px
          }
          .phase:before, .phase:after {
            content:'';
            flex:1;
            height:1px;
            background:#cbd5e1
          }
          .phase-badge{
            background:#f1f5f9;
            padding:6px 12px;
            border-radius:20px;
            color:#475569
          }
          
          /* Message styling */
          .msg{
            margin-bottom:18px;
            padding:18px 20px;
            background:#f8fafc;
            border-radius:10px;
            border-left:4px solid #4f46e5;
            transition:background 0.2s
          }
          .msg.persona-b{border-left-color:#06b6d4}
          .speaker{
            font-weight:700;
            font-size:13px;
            margin-bottom:8px;
            color:#0f172a;
            display:flex;
            align-items:center;
            justify-content:space-between;
          }
          .speaker-badge{
            font-size:10px;
            padding:4px 8px;
            border-radius:4px;
            background:#e0e7ff;
            color:#4f46e5
          }
          .msg.persona-b .speaker-badge{
            background:#e0f2fe;
            color:#06b6d4
          }
          .body{
            font-size:14px;
            line-height:1.7;
            color:#334155;
            margin:0;
            white-space:pre-wrap;
            word-break:break-word
          }
          .timestamp{
            font-size:11px;
            color:#94a3b8;
            margin-top:10px;
            padding-top:8px;
            border-top:1px solid #e2e8f0
          }
          
          /* Summary section */
          .summary{
            margin-top:32px;
            padding:24px;
            background:linear-gradient(135deg,#f0f9ff 0%,#f0f4f8 100%);
            border-radius:12px;
            border:1px solid #bae6fd;
            break-inside:avoid
          }
          .summary h2{
            color:#0c4a6e;
            font-size:14px;
            margin:0 0 14px;
            display:flex;
            align-items:center;
            gap:8px;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:0.05em
          }
          .summary-content{
            font-size:14px;
            line-height:1.8;
            color:#334155
          }
          
          /* Footer */
          .footer{
            margin-top:40px;
            padding-top:20px;
            border-top:1px solid #e2e8f0;
            text-align:center;
            font-size:10px;
            color:#94a3b8
          }
          
          /* Watermark */
          .watermark{
            position:fixed;
            top:45%;
            left:50%;
            transform:translate(-50%,-50%) rotate(-45deg);
            font-size:120px;
            font-weight:700;
            color:rgba(15,23,42,0.03);
            white-space:nowrap;
            pointer-events:none;
            z-index:0
          }
        </style>
      </head>
      <body>
        <div class="watermark">PrismMinds</div>

        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="branding">
              <svg class="logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 19H22L12 2Z" stroke="url(#grad)" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="12" cy="14" r="3" fill="#4f46e5"/>
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="brand-info">
                <div class="name">PrismMinds</div>
                <div class="tagline">AI-POWERED DEBATES</div>
              </div>
            </div>
            <div class="metadata">
              <div class="date">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div style="font-size:10px;color:#a0aec0">Report Document</div>
            </div>
          </div>

          <!-- Debate title & personas -->
          <div class="debate-header">
            <div class="topic-title">${escapeHtml(topic)}</div>
            <div class="personas">
              <div class="persona">
                <div class="persona-label">Pro Advocate</div>
                <div class="persona-name">${escapeHtml(personaA)}</div>
              </div>
              <div class="persona b">
                <div class="persona-label">Skeptic</div>
                <div class="persona-name">${escapeHtml(personaB)}</div>
              </div>
            </div>
            <div class="debate-stats">
              <div class="stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>${transcript.length} exchanges</span>
              </div>
              <div class="stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>Generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
              </div>
            </div>
          </div>
          <hr />
  `

  let currentPhase = ""
  transcript.forEach((msg) => {
    if (msg.phase && msg.phase !== currentPhase) {
      currentPhase = msg.phase
      const phaseEmoji = msg.phase === "opening" ? "🎤" : msg.phase === "discussion" ? "💬" : "🎯"
      const phaseLabel = msg.phase.charAt(0).toUpperCase() + msg.phase.slice(1)
      innerHtml += `<div class="phase"><span class="phase-badge">${phaseEmoji} ${phaseLabel}</span></div>`
    }

    const isPersonaB = msg.speaker === personaB
    const msgClass = isPersonaB ? "msg persona-b" : "msg"
    const badgeClass = isPersonaB ? "speaker-badge" : "speaker-badge"
    const persona = isPersonaB ? "Skeptic" : "Advocate"
    
    innerHtml += `
      <div class="${msgClass}">
        <div class="speaker">
          <span>${escapeHtml(msg.speaker)}</span>
          <span class="${badgeClass}">${persona}</span>
        </div>
        <div class="body">${escapeHtml(msg.message)}</div>
        ${msg.timestamp ? `<div class="timestamp">⏱ ${escapeHtml(msg.timestamp)}</div>` : ""}
      </div>
    `
  })

    if (summary) {
      innerHtml += `
        <div class="summary">
          <h2>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
            Key Insights
          </h2>
          <div class="summary-content">${escapeHtml(summary)}</div>
        </div>
      `
    }

    innerHtml += `
      <div class="footer">
        <p style="margin:0">This document was automatically generated by PrismMinds | AI-Powered Debates</p>
        <p style="margin:4px 0 0">For more information, visit <strong>prismminds.app</strong></p>
      </div>
    </div></body></html>`

  // Create an iframe and write the minimal HTML into it
  const iframe = document.createElement("iframe")
  iframe.style.position = "absolute"
  iframe.style.left = "-9999px"
  iframe.style.width = "800px"
  iframe.style.height = "auto"
  iframe.setAttribute("aria-hidden", "true")
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) throw new Error("Could not access iframe document")
    doc.open()
    doc.write(innerHtml)
    doc.close()

    // Wait a tick for fonts/images to settle
    await new Promise((res) => setTimeout(res, 150))

    // Use html2canvas on the iframe's body to avoid global page styles
    let canvas: HTMLCanvasElement | null = null
    try {
      canvas = await html2canvas(doc.body as HTMLElement, {
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        scale: 2,
      })
    } catch (err) {
      console.error("html2canvas failed, falling back to text PDF:", err)
    }

    // If html2canvas failed (e.g., due to parsing unsupported CSS), fall back
    // to a simple text-based PDF generated directly with jsPDF.
    if (!canvas) {
      try {
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
        const margin = 12
        const pageWidth = 210 - margin * 2
        const lineHeight = 5.5
        let cursorY = 15

        // Gradient header background simulation
        pdf.setFillColor(79, 70, 229)
        pdf.rect(0, 0, 210, 28, "F")

        // Company name (in white)
        pdf.setFontSize(22)
        pdf.setTextColor(255, 255, 255)
        pdf.setFont("Helvetica", "bold")
        pdf.text("PrismMinds", margin, 12)
        
        // Tagline
        pdf.setFontSize(9)
        pdf.setTextColor(255, 255, 255)
        pdf.setFont("Helvetica", "normal")
        pdf.text("AI-POWERED DEBATES", margin, 18)
        
        // Date on right
        pdf.setFontSize(9)
        pdf.setTextColor(255, 255, 255)
        pdf.text(
          `Generated: ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
          pageWidth + margin,
          18,
          { align: 'right' }
        )

        cursorY = 35

        // Topic as main title
        pdf.setFontSize(18)
        pdf.setTextColor(15, 23, 42)
        pdf.setFont("Helvetica", "bold")
        const topicLines = pdf.splitTextToSize(topic, pageWidth) as string[]
        topicLines.forEach((line: string) => {
          pdf.text(line, margin, cursorY)
          cursorY += lineHeight + 1
        })

        // Personas
        pdf.setFontSize(11)
        pdf.setTextColor(31, 41, 55)
        pdf.setFont("Helvetica", "bold")
        pdf.text(`${personaA}  vs  ${personaB}`, margin, cursorY)
        cursorY += lineHeight + 2

        // Date and stats
        pdf.setFontSize(10)
        pdf.setTextColor(71, 85, 105)
        pdf.setFont("Helvetica", "normal")
        pdf.text(`Date: ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, cursorY)
        cursorY += lineHeight
        pdf.text(`Exchanges: ${transcript.length}`, margin, cursorY)
        cursorY += lineHeight + 3

        // Horizontal line
        pdf.setDrawColor(226, 232, 240)
        pdf.setLineWidth(0.5)
        pdf.line(margin, cursorY, pageWidth + margin, cursorY)
        cursorY += 5

        const addWrappedText = (text: string, isBold = false, isPhase = false) => {
          if (isPhase) {
            pdf.setFontSize(10)
            pdf.setTextColor(15, 23, 42)
            pdf.setFont("Helvetica", "bold")
            pdf.setFillColor(241, 245, 249)
            pdf.rect(margin - 1, cursorY - 3, pageWidth + 2, lineHeight + 2, "F")
          } else {
            pdf.setFontSize(10)
            pdf.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105)
            pdf.setFont("Helvetica", isBold ? "bold" : "normal")
          }

          const split: string[] = pdf.splitTextToSize(text, pageWidth) as string[]
          split.forEach((line: string) => {
            if (cursorY > 280) {
              pdf.addPage()
              cursorY = 15
            }
            pdf.text(line, margin, cursorY)
            cursorY += lineHeight
          })
        }

        transcript.forEach((msg) => {
          if (msg.phase && msg.phase !== currentPhase) {
            currentPhase = msg.phase
            const phaseLabel = msg.phase.charAt(0).toUpperCase() + msg.phase.slice(1)
            addWrappedText(`\n${phaseLabel}\n`, false, true)
            cursorY += 2
          }

          const persona = msg.speaker === personaB ? "Skeptic" : "Advocate"
          addWrappedText(`${msg.speaker} (${persona}):`, true)
          addWrappedText(msg.message, false)
          if (msg.timestamp) {
            pdf.setFontSize(8)
            pdf.setTextColor(148, 163, 184)
            pdf.text(`⏱ ${msg.timestamp}`, margin, cursorY)
            cursorY += lineHeight
          }
          cursorY += 2
        })

        if (summary) {
          cursorY += 2
          pdf.addPage()
          cursorY = 15

          // Summary header
          pdf.setFontSize(12)
          pdf.setTextColor(15, 23, 42)
          pdf.setFont("Helvetica", "bold")
          pdf.text("Key Insights", margin, cursorY)
          cursorY += lineHeight + 2

          // Summary content
          const summaryLines = pdf.splitTextToSize(summary, pageWidth) as string[]
          pdf.setFontSize(10)
          pdf.setTextColor(71, 85, 105)
          pdf.setFont("Helvetica", "normal")
          summaryLines.forEach((line: string) => {
            if (cursorY > 280) {
              pdf.addPage()
              cursorY = 15
            }
            pdf.text(line, margin, cursorY)
            cursorY += lineHeight
          })
        }

        const filename = `${topic.substring(0, 50).replace(/[^a-z0-9]/gi, "_")}_debate.pdf`
        pdf.save(filename)
        return
      } catch (err) {
        console.error("Fallback PDF generation also failed:", err)
        throw err
      }
    }

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210 - 20 // A4 width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 10 // Top margin

    // Add image to PDF, creating new pages as needed
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
    heightLeft -= 277 // A4 height

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
      heightLeft -= 277
    }

    // Download the PDF
    const filename = `${topic.substring(0, 50).replace(/[^a-z0-9]/gi, "_")}_debate.pdf`
    pdf.save(filename)
  } finally {
    // Clean up iframe if it was appended
    try {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    } catch (e) {
      // ignore cleanup errors
    }
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
