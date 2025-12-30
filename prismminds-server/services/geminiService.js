import { GoogleGenerativeAI } from "@google/generative-ai"

// IMPORTANT: no hardcoded API key here.
// Ensure GEMINI_API_KEY and GEMINI_HUMAN_API_KEY are set in your environment.

export async function startDebate(topic, personaA, personaB, duration) {
  try {
    console.log("🔍 Starting debate generation...")
    console.log("Topic:", topic)
    console.log("Personas:", personaA, "vs", personaB)
    console.log("Duration:", duration, "minutes")

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.")
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Try different model names
    const modelNames = [
      "gemini-2.5-flash",
    ]

    let model = null
    let workingModel = null

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`)
        model = genAI.getGenerativeModel({ model: modelName })

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'")
        await testResult.response.text()

        console.log(`✅ Model ${modelName} works!`)
        workingModel = modelName
        break
      } catch (e) {
        console.log(`❌ Model ${modelName} failed:`, e.message)
        model = null
      }
    }

    if (!model) {
      throw new Error("All Gemini models failed. Please check your API key and try again.")
    }

    // Calculate number of exchanges based on duration
    const exchangesPerMinute = 1.2 // more focused content
    const totalExchanges = Math.max(4, Math.min(12, Math.round(duration * exchangesPerMinute))) // min 4, max 12
    const approxWords = Math.round(duration * 135) // ≈ spoken word count

    const prompt = `
You are generating a natural, human-like spoken debate between two personas.

⏱️ STRICT TIME MANAGEMENT
The entire debate must comfortably fit inside approximately ${duration} minutes of real spoken conversation.

- Assume ~135 words per minute.
- Total maximum word budget ≈ ${approxWords} words.
- You MUST use at most ${totalExchanges} total turns (objects in the "transcript" array).
- End the debate naturally once this budget is reached.
- Do NOT go beyond this turn limit or word budget.

TOPIC: ${topic}
PERSONA A (${personaA}): (${personaA})
PERSONA B (${personaB}): (${personaB})

🎯 OBJECTIVE
Create a lively, back-and-forth discussion that sounds like two real people having a thoughtful debate.
It should feel spontaneous — each persona reacts to what the other just said.
The conversation should reach a natural conclusion within the time and turn limits.

🗣️ STRUCTURE

Opening (phase: "opening", first ~30–45 seconds)
- Both personas greet each other casually.
- They acknowledge the topic and why it's interesting.
- Each shares a short opening thought (1–2 sentences).

Main Discussion (phase: "discussion")
- Natural back-and-forth responses.
- Each turn is short and spoken-like:
  - Typically 1–3 sentences per turn.
- Use conversational reactions:
  - "Yeah, I get that, but..."
  - "I see your point."
  - "That's fair, though I think..."
- Mild disagreement is okay, but keep it respectful and energetic.
- No long essays; keep things crisp and spoken.

Closing (phase: "closing", final ~30–45 seconds)
- Each persona briefly summarizes their stance.
- One or both may acknowledge valid points from the other side.
- End with a friendly, natural closing (e.g., "Good chat", "Thanks for the discussion").

🧠 STYLE RULES
- NO lists, bullet points, or headings in the messages — only conversational dialogue.
- Vary length: some shorter lines, some slightly longer, but never a long paragraph.
- Each message must sound like natural speech, not formal writing.
- Do NOT include any "Moderator" voice or narration in the transcript.
- The debate MUST end within the word and turn limits and feel concluded (not abruptly cut off).

📦 OUTPUT FORMAT (STRICT JSON ONLY)
Return ONLY valid JSON (no markdown, no code fences) in this shape:

{
  "transcript": [
    {
      "speaker": "${personaA}",
      "message": "Short, natural opening line.",
      "phase": "opening",
      "timestamp": "0:00"
    },
    {
      "speaker": "${personaB}",
      "message": "Short, natural reply.",
      "phase": "opening",
      "timestamp": "0:20"
    }
  ],
  "moderator_summary": "Neutral spoken-style summary of how ${personaA} and ${personaB} discussed ${topic}, the main arguments from each side, the tone, and how the debate concluded within ${duration} minutes.",
  "debate_metrics": {
    "total_duration": "${duration} minutes",
    "approx_exchanges": ${totalExchanges},
    "max_word_limit": ${approxWords},
    "key_themes": ["theme1", "theme2", "theme3"]
  }
}
`

    console.log("📤 Sending prompt to Gemini...")
    const result = await model.generateContent(prompt)

    let text = result.response.text()
    console.log("📥 Received response from Gemini")

    // Clean up the response
    let cleanText = text.trim()
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/g, "")
    }
    cleanText = cleanText.trim()

    try {
      const parsed = JSON.parse(cleanText)
      console.log("✅ Successfully parsed JSON response")
      console.log("Transcript entries:", parsed.transcript?.length || 0)

      return {
        transcript: parsed.transcript || [],
        moderator_summary:
          parsed.moderator_summary || parsed.summary || "Debate completed successfully.",
      }
    } catch (e) {
      console.error("❌ Failed to parse JSON response from Gemini API")
      throw new Error("Invalid response from AI service. Please try again.")
    }
  } catch (error) {
    console.error("💥 Debate creation error:", error.message)
    throw new Error(`Failed to generate debate: ${error.message}`)
  }
}

export async function generateAIResponse(topic, conversationHistory) {
  try {
    console.log("🤖 Generating AI response for human-to-AI debate...")
    console.log("Topic:", topic)
    console.log("Conversation history length:", conversationHistory.length)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_HUMAN_API_KEY)

    // Check if API key exists
    if (!process.env.GEMINI_HUMAN_API_KEY) {
      throw new Error("Gemini Human API key not configured. Please set GEMINI_HUMAN_API_KEY environment variable.")
    }



    // Try different model names
    const modelNames = ["gemini-2.5-flash"]
    let model = null

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`)
        model = genAI.getGenerativeModel({ model: modelName })

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'")
        await testResult.response.text()

        console.log(`✅ Model ${modelName} works!`)
        break
      } catch (e) {
        console.log(`❌ Model ${modelName} failed:`, e.message)
        model = null
      }
    }

    if (!model) {
      console.warn("⚠️ All Gemini models failed, using mock response")
      return {
        message:
          "I get where you're coming from, and it's an interesting angle. Can you say a bit more about why you see it that way?",
      }
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .map((msg) => `${msg.speaker}: ${msg.message}`)
      .join("\n")

    // Try to find the last human message
    let lastHumanMessage = ""
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i]
      const speaker = (msg.speaker || "").toLowerCase()
      if (speaker.includes("you") || speaker.includes("human") || speaker.includes("user")) {
        lastHumanMessage = msg.message || ""
        break
      }
    }
    if (!lastHumanMessage && conversationHistory.length > 0) {
      lastHumanMessage = conversationHistory[conversationHistory.length - 1].message || ""
    }

    const prompt = `
You are in a live, passionate, spoken debate against a human opponent.

DEBATE TOPIC: "${topic}"

FULL CONVERSATION SO FAR:
${conversationContext}

The human just said:
"""
${lastHumanMessage}
"""

YOUR JOB:
- Respond exactly like a sharp, confident debater on stage would — not an interviewer.
- Keep every reply short and punchy: 1–3 sentences max (20–50 words).
- Never ask questions back unless it’s rhetorical for emphasis (“You really think that’s fair?”).
- Instead of asking, make strong statements, counter-arguments, concessions, or analogies.
- React directly and forcefully to what the human just said.

DEBATE STYLE (must follow):
- Sound human, energetic, and slightly competitive — this is a real debate!
- Use natural spoken rhythm: “Look…”, “Come on…”, “That’s the thing —”, “Here’s the problem…”, “Exactly!”, “No way”, “Actually…”, “With respect…”
- If the human says “good point” → acknowledge quickly then pivot: “Glad you see that, but here’s why it still falls apart…”
- If the human says “you’re wrong” → push back calmly but firmly: “I get why you’d feel that way, but the evidence actually shows…”
- Partial agreement is powerful: “You’re right about X, but that doesn’t change Y.”

ABSOLUTELY NO:
- Questions (unless rhetorical)
- Long explanations
- Bullet points, markdown, JSON, labels
- Saying “as an AI”
- Sounding robotic or overly polite

Just reply with raw spoken text — short, strong, natural, ready to be spoken aloud right now.
`;
    console.log("📤 Sending prompt to Gemini for AI response...")
    const result = await model.generateContent(prompt)

    let text = result.response.text()
    console.log("📥 Received response from Gemini")

    // Clean up the response
    let cleanText = text.trim()

    // Remove any markdown code blocks
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```[\w]*\n?/g, "").replace(/```\n?/g, "")
    }

    // Remove quotes if wrapped
    if (
      (cleanText.startsWith('"') && cleanText.endsWith('"')) ||
      (cleanText.startsWith("'") && cleanText.endsWith("'"))
    ) {
      cleanText = cleanText.slice(1, -1)
    }

    cleanText = cleanText.trim()

    if (!cleanText) {
      throw new Error("Empty response from AI")
    }

    return {
      message: cleanText,
    }
  } catch (error) {
    console.error("💥 AI response generation error:", error.message)
    throw new Error(`Failed to generate AI response: ${error.message}`)
  }
}

// Human-to-AI Debate: Generate initial AI response to start the debate
export async function startHumanDebate(topic) {
  try {
    console.log("🔍 Starting human-to-AI debate generation...")
    console.log("Topic:", topic)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_HUMAN_API_KEY)

    // Check if API key exists
    if (!process.env.GEMINI_HUMAN_API_KEY) {
      console.warn("⚠️ No GEMINI_HUMAN_API_KEY found, using mock human debate")
      return {
        transcript: [
          {
            speaker: "AI Debater",
            message: `Hey, I'm glad you picked "${topic}". It's a genuinely interesting topic, and I'm curious how you see it — what's your take?`,
            phase: "opening",
            timestamp: "0:00",
          },
        ],
        moderator_summary: `A human-to-AI debate has been initiated on the topic: "${topic}". The AI debater has provided a casual, inviting opening statement to begin the conversation.`,
      }
    }



    // Try different model names
    const modelNames = ["gemini-2.5-flash"]

    let model = null
    let workingModel = null

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`)
        model = genAI.getGenerativeModel({ model: modelName })

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'")
        await testResult.response.text()

        console.log(`✅ Model ${modelName} works!`)
        workingModel = modelName
        break
      } catch (e) {
        console.log(`❌ Model ${modelName} failed:`, e.message)
        model = null
      }
    }

    if (!model) {
      console.warn("⚠️ All Gemini models failed, using mock human debate")
      return {
        transcript: [
          {
            speaker: "AI Debater",
            message: `Hey, I'm glad you picked "${topic}". It's a genuinely interesting topic, and I'm curious how you see it — what's your take?`,
            phase: "opening",
            timestamp: "0:00",
          },
        ],
        moderator_summary: `A human-to-AI debate has been initiated on the topic: "${topic}". The AI debater has provided a casual, inviting opening statement to begin the conversation.`,
      }
    }

    const prompt = `
You are an AI debater beginning a live debate with a human.

TOPIC: "${topic}"

Your job is to create a short, natural-sounding opening line that:
- Greets the human warmly (but not in a corporate way).
- Shows genuine interest in the topic.
- Briefly hints at your perspective OR frames the topic as interesting.
- Invites the human to share their view next.

STYLE:
- 1–2 sentences only.
- Casual, friendly, and human.
- No long explanations, no formal language, no robotic tone.
- It should sound good when spoken out loud.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "transcript": [
    {
      "speaker": "AI Debater",
      "message": "Your opening message here...",
      "phase": "opening",
      "timestamp": "0:00"
    }
  ],
  "moderator_summary": "A brief summary describing the initiation of this human-to-AI debate on the topic."
}
`

    console.log("📤 Sending prompt to Gemini for human debate...")
    const result = await model.generateContent(prompt)

    let text = result.response.text()
    console.log("📥 Received response from Gemini")

    // Clean up the response
    let cleanText = text.trim()
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/g, "")
    }
    cleanText = cleanText.trim()

    try {
      const parsed = JSON.parse(cleanText)
      console.log("✅ Successfully parsed JSON response for human debate")

      return {
        transcript:
          parsed.transcript ||
          [
            {
              speaker: "AI Debater",
              message: `Hey, I'm glad you picked "${topic}". It's a genuinely interesting topic, and I'm curious how you see it — what's your take?`,
              phase: "opening",
              timestamp: "0:00",
            },
          ],
        moderator_summary:
          parsed.moderator_summary ||
          `A human-to-AI debate has been initiated on the topic: "${topic}".`,
      }
    } catch (e) {
      console.error("❌ Failed to parse JSON, using default human debate")
      return {
        transcript: [
          {
            speaker: "AI Debater",
            message: `Hey, I'm glad you picked "${topic}". It's a genuinely interesting topic, and I'm curious how you see it — what's your take?`,
            phase: "opening",
            timestamp: "0:00",
          },
        ],
        moderator_summary: `A human-to-AI debate has been initiated on the topic: "${topic}". The AI debater has provided an opening statement to begin the conversation.`,
      }
    }
  } catch (error) {
    console.error("💥 Human debate creation error:", error.message)
    throw new Error(`Failed to start human debate: ${error.message}`)
  }
}

// 🔹 Analyze a debate (On-Demand)
export async function analyzeDebate(transcript) {
  try {
    console.log("📊 Starting debate analysis...")

    // 1. First, separate Human vs AI messages to check participation levels
    // We assume the AI is "AI Debater" (from startHumanDebate).
    // Any other speaker is treated as the Human.
    const humanMessages = transcript.filter(m => m.speaker !== "AI Debater");

    const humanTurnCount = humanMessages.length;
    const humanTotalWords = humanMessages.reduce((acc, msg) => {
      return acc + (msg.message || "").trim().split(/\s+/).length;
    }, 0);

    console.log(`🔍 Human Participation Check: ${humanTurnCount} turns, ~${humanTotalWords} words.`);

    // 2. IMMEDIATE FAIL CONDITION
    // If the human didn't speak (0 turns), return 0.
    // We ALLOW short inputs now (e.g. "ok") to go to Gemini for a fair (low) score and feedback.
    if (humanTurnCount === 0) {
      console.warn("⚠️ Human participation check: 0 turns. Returning 0 scores.");
      return {
        scores: {
          logic: 0,
          persuasion: 0,
          clarity: 0,
          emotional_intelligence: 0
        },
        feedback: {
          strengths: ["N/A"],
          improvements: ["It looks like you didn't say anything!", "Jump in and start the debate next time."],
          coach_note: "No participation detected. Don't be shy! Speak up to get a score."
        }
      };
    }

    // Use specific analysis key if available, otherwise fall back to main key
    const apiKey = process.env.GEMINI_ANALYSIS_API_KEY
    if (!apiKey) {
      throw new Error("No API key configured for analysis.")
    }

    const analysisGenAI = new GoogleGenerativeAI(apiKey)
    const model = analysisGenAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const transcriptText = transcript
      .map(m => `${m.speaker}: ${m.message}`)
      .join("\n")

    const prompt = `
You are an expert Debate Coach and Communication Analyst (PrismMinds Inference Engine).
Your job is to strictly evaluate the HUMAN user's performance in the following debate against an AI.

TRANSCRIPT:
${transcriptText}

🚨 SCORING GUIDELINES:
1. **Participation Context**:
   - The user spoke roughly ${humanTotalWords} words across ${humanTurnCount} turns.
   - **Low Effort**: If the user only said "ok", "cool", or "hello", they should receive a **LOW score (e.g., 5-15)** based on lack of substance, but **NOT necessarily 0** if it was a coherent response.
   - **Non-sequiturs**: If the response is total gibberish (e.g. "asdf"), score 0.

2. **Argument Depth**:
   - Count the number of distinct, substantive points made by the user.
   - 0 substantive points = Score 10-30
   - 1-2 points = Score 40-60
   - 3+ strong points = Score 70+

3. **Rubric**:
   - **Logic**: Did they provide evidence and reasoning?
   - **Persuasion**: Did they use rhetoric, analogies, or emotional appeals?
   - **Clarity**: Was their argument structured?
   - **Emotional Intelligence (EQ)**: Did they acknowledge the opponent's points?

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "scores": {
    "logic": 0-100,
    "persuasion": 0-100,
    "clarity": 0-100,
    "emotional_intelligence": 0-100
  },
  "feedback": {
    "strengths": ["Specific point user made...", "Good use of... (if applicable)"],
    "improvements": ["You only made X points...", "Expand on..."],
    "coach_note": "Constructive feedback from a debate coach. If they participated poorly, encourage them to say more next time rather than scolding them. Be helpful but honest about the low score."
  }
}
`
    const result = await model.generateContent(prompt)
    let text = result.response.text()

    // Clean JSON
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    return JSON.parse(text)

  } catch (error) {
    console.error("💥 Analysis failed:", error)
    throw new Error("Failed to analyze debate")
  }
}
