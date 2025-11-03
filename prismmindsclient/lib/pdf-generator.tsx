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

  // To avoid html2canvas parsing global page styles (which may include modern
  // color functions like lab()), render the transcript inside a small
  // same-origin iframe with only minimal inline CSS. This isolates the
  // content from Tailwind/global styles and prevents parsing errors.

  // Build inner HTML content for the iframe
  let innerHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          /* Professional PDF styling with enhanced typography and spacing */
          html,body{margin:0;padding:0;background:#ffffff;color:#1a1a1a;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;line-height:1.6}
          .container{padding:30px 50px 50px;width:720px;box-sizing:border-box;position:relative;z-index:1}
          
          /* Typography */
          h1{font-size:28px;margin:0 0 12px;color:#111827;font-weight:600;line-height:1.3;letter-spacing:-0.02em}
          h2{font-size:20px;margin:0 0 8px;color:#1f2937;font-weight:600}
          p{margin:0 0 12px;color:#374151;font-size:14px}
          
          /* Layout elements */
          hr{border:0;height:1px;background:#e5e7eb;margin:25px 0;opacity:0.7}
          
          /* Header branding */
          .header{
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin:-30px -50px 30px;
            padding:24px 50px;
            background:linear-gradient(to right,#f8fafc,#f1f5f9);
            border-bottom:1px solid #e2e8f0;
          }
          .branding{display:flex;align-items:center;gap:15px}
          .logo{width:38px;height:38px}
          .brand-name{
            font-size:22px;
            font-weight:700;
            color:#1e40af;
            letter-spacing:-0.02em;
            margin-bottom:2px
          }
          
          /* Debate content */
          .phase{
            margin:30px 0;
            text-align:center;
            font-weight:600;
            color:#4b5563;
            font-size:15px;
            text-transform:uppercase;
            letter-spacing:0.05em;
            position:relative;
          }
          .phase:before, .phase:after {
            content:'';
            position:absolute;
            top:50%;
            width:100px;
            height:1px;
            background:#e5e7eb;
          }
          .phase:before{right:calc(50% + 80px)}
          .phase:after{left:calc(50% + 80px)}
          
          .msg{
            margin-bottom:20px;
            padding:16px 20px;
            background:#f9fafb;
            border-radius:12px;
            border-left:4px solid #3b82f6;
            box-shadow:0 1px 3px rgba(0,0,0,0.05);
          }
          .speaker{
            font-weight:600;
            font-size:14px;
            margin-bottom:6px;
            color:#1f2937;
            display:flex;
            align-items:center;
            justify-content:space-between;
          }
          .body{
            font-size:14px;
            line-height:1.7;
            color:#4b5563;
            margin:0;
            white-space:pre-wrap
          }
          .timestamp{
            font-size:12px;
            color:#6b7280;
            margin-top:8px;
            text-align:right
          }
          
          /* Summary section */
          .summary{
            margin-top:30px;
            padding:20px 25px;
            background:#f0f7ff;
            border-radius:12px;
            border:1px solid #e0eefb
          }
          .summary h2{
            color:#1e40af;
            font-size:16px;
            margin-bottom:12px;
            display:flex;
            align-items:center;
            gap:8px
          }
          
          /* Watermark */
          .watermark{
            position:fixed;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%) rotate(-45deg);
            font-size:80px;
            font-weight:700;
            color:rgba(241,245,249,0.5);
            white-space:nowrap;
            pointer-events:none;
            z-index:0;
            opacity:0.7
          }
        </style>
      </head>
      <body>
        <!-- Light watermark text in background -->
        <div class="watermark">PrismMinds AI</div>

        <div class="container">
          <!-- Branding header -->
          <div class="header">
            <div class="branding">
              <!-- Embedded minimal logo as SVG for reliability -->
              <svg class="logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 19H22L12 2Z" stroke="#1e40af" stroke-width="2"/>
                <circle cx="12" cy="14" r="3" fill="#3b82f6"/>
              </svg>
              <div>
                <div class="brand-name">PrismMinds</div>
                <div style="font-size:10px;color:#64748b">AI-Powered Debates</div>
              </div>
            </div>
            <div style="font-size:10px;color:#64748b;text-align:right">
              Generated on<br/>${new Date().toLocaleDateString()}
            </div>
          </div>

          <!-- Debate content -->
          <div class="debate-header" style="margin-bottom:35px">
            <h1>${escapeHtml(topic)}</h1>
            <div style="display:flex;align-items:center;gap:15px;margin-top:15px">
              <div style="flex:1">
                <p style="font-size:15px;color:#4b5563;margin-bottom:6px">
                  <strong style="color:#1e40af">${escapeHtml(personaA)}</strong>
                  <span style="margin:0 8px;color:#9ca3af">vs</span>
                  <strong style="color:#3b82f6">${escapeHtml(personaB)}</strong>
                </p>
                <p style="font-size:13px;color:#6b7280">
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    Duration: ${escapeHtml(String(transcript.length))} exchanges
                  </span>
                </p>
              </div>
              <div style="text-align:right">
                <p style="font-size:13px;color:#6b7280;margin:0">
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    ${new Date(createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <hr />
  `

  let currentPhase = ""
  transcript.forEach((msg) => {
    if (msg.phase && msg.phase !== currentPhase) {
      currentPhase = msg.phase
      const phaseLabel =
        msg.phase === "opening" ? "🎤 Opening" : msg.phase === "discussion" ? "💬 Discussion" : "🎯 Closing"
      innerHtml += `<div class="phase">${phaseLabel}</div>`
    }

    innerHtml += `
      <div class="msg">
        <div class="speaker">${escapeHtml(msg.speaker)}</div>
        <div class="body">${escapeHtml(msg.message)}</div>
        ${msg.timestamp ? `<div class="timestamp">${escapeHtml(msg.timestamp)}</div>` : ""}
      </div>
    `
  })

    if (summary) {
      innerHtml += `
        <hr />
        <div class="summary">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Key Insights
          </h2>
          <div style="font-size:14px;line-height:1.7;color:#4b5563">${escapeHtml(summary)}</div>
        </div>
      `
    }  innerHtml += `</div></body></html>`

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
        const margin = 10
        const pageWidth = 210 - margin * 2
        const lineHeight = 7
        let cursorY = 15

        // Add professional header with better spacing
        const headerY = 20
        const headerLineSpacing = 6

        // Company name with larger size
        pdf.setFontSize(24)
        pdf.setTextColor(30, 64, 175) // #1e40af
        pdf.text("PrismMinds", margin, headerY)
        
        // Tagline and date on the same line
        pdf.setFontSize(10)
        pdf.setTextColor(75, 85, 99) // #4b5563
        pdf.text("AI-Powered Debates", margin, headerY + headerLineSpacing)
        pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, pageWidth, headerY + headerLineSpacing, { align: 'right' })
        
        // Add a subtle divider
        pdf.setDrawColor(229, 231, 235) // #e5e7eb
        pdf.setLineWidth(0.5)
        pdf.line(margin, headerY + headerLineSpacing + 5, pageWidth + margin, headerY + headerLineSpacing + 5)
        
        cursorY = headerY + headerLineSpacing + 15 // Start content below header

        // Debate content
        pdf.setTextColor(31, 41, 55) // #1f2937
        pdf.setFontSize(14)
        pdf.text(topic, margin, cursorY)
        cursorY += lineHeight + 2
        pdf.setFontSize(10)
        pdf.text(`${personaA} vs ${personaB}`, margin, cursorY)
        cursorY += lineHeight
        pdf.text(`Date: ${new Date(createdAt).toLocaleString()}`, margin, cursorY)
        cursorY += lineHeight + 4

        const addWrappedText = (text: string) => {
          const split: string[] = pdf.splitTextToSize(text, pageWidth) as string[]
          split.forEach((line: string) => {
            if (cursorY > 287) {
              pdf.addPage()
              cursorY = 15
            }
            pdf.text(line, margin, cursorY)
            cursorY += lineHeight
          })
        }

        transcript.forEach((msg) => {
          if (msg.phase) {
            addWrappedText(`\n${msg.phase.toUpperCase()}`)
          }
          addWrappedText(`${msg.speaker}: ${msg.message}`)
          if (msg.timestamp) addWrappedText(`(${msg.timestamp})`)
        })

        if (summary) {
          pdf.addPage()
          pdf.setFontSize(12)
          addWrappedText(`Summary:\n${summary}`)
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
