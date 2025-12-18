import { GoogleGenerativeAI } from "@google/generative-ai"

// IMPORTANT: no hardcoded API key here.
// Ensure GEMINI_API_KEY is set in your environment.
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDutn1OFENfYdgwFwIbtwNV2wOsYMXxIMw")
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
// Mock debate generator for when API fails
function generateMockDebate(topic, personaA, personaB, duration) {
  console.log("⚠️ Using mock debate generator (Gemini API unavailable)")
  const transcript = debates.default
  const moderator_summary = `This ${duration}-minute debate on "${topic}" featured compelling arguments from both ${personaA} and ${personaB}. ${personaA} advocated for decisive action, emphasizing opportunities and historical precedents, while ${personaB} urged caution, highlighting potential risks and the need for careful implementation. The discussion concluded with both parties finding common ground on a pilot program approach, demonstrating the value of constructive dialogue in addressing complex issues.`

  return { transcript, moderator_summary }
}

export async function startDebate(topic, personaA, personaB, duration) {
  try {
    console.log("🔍 Starting debate generation...")
    console.log("Topic:", topic)
    console.log("Personas:", personaA, "vs", personaB)
    console.log("Duration:", duration, "minutes")

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ No GEMINI_API_KEY found, using mock debate")
      return generateMockDebate(topic, personaA, personaB, duration)
    }

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
      console.warn("⚠️ All Gemini models failed, using mock debate")
      console.warn("💡 Get a valid API key from: https://makersuite.google.com/app/apikey")
      return generateMockDebate(topic, personaA, personaB, duration)
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
      console.error("❌ Failed to parse JSON, using mock debate")
      return generateMockDebate(topic, personaA, personaB, duration)
    }
  } catch (error) {
    console.error("💥 Debate creation error:", error.message)
    console.warn("⚠️ Falling back to mock debate")
    return generateMockDebate(topic, personaA, personaB, duration)
  }
}

export async function generateAIResponse(topic, conversationHistory) {
  try {
    console.log("🤖 Generating AI response for human-to-AI debate...")
    console.log("Topic:", topic)
    console.log("Conversation history length:", conversationHistory.length)

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ No GEMINI_API_KEY found, using mock response")
      return {
        message:
          "I get where you're coming from, and it's an interesting angle. Can you say a bit more about why you see it that way?",
      }
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
    console.warn("⚠️ Falling back to default response")
    return {
      message:
        "I get where you're coming from, and it's an interesting angle. Can you say a bit more about why you see it that way?",
    }
  }
}

// Human-to-AI Debate: Generate initial AI response to start the debate
export async function startHumanDebate(topic) {
  try {
    console.log("🔍 Starting human-to-AI debate generation...")
    console.log("Topic:", topic)

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ No GEMINI_API_KEY found, using mock human debate")
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
    console.warn("⚠️ Falling back to default human debate")
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
}
