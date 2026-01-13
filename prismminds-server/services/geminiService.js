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
- 🧠 **USE YOUR MEMORY:** You have the full transcript above. Use it!
  - If the user contradicts something they said earlier, CALL THEM OUT.
  - If they repeat a point you already refuted, tell them "We already covered that."
  - Maintain the thread of the argument from the beginning.
- 🛡️ ALWAYS be the OPPONENT. If the user argues X, you argue NOT X.
- 🎯 STICK STRICTLY TO THE TOPIC: "${topic}".
- Respond exactly like a sharp, confident debater — but talk like a real person, not a textbook.
- Keep every reply short and punchy: 1–2 sentences max (20–50 words).
- **CRITICAL: Use simple, everyday words.** (Think 8th-grade reading level).
- Avoid "big words" (e.g., instead of "underscore", say "show"; instead of "fundamental bedrock", say "main foundation").
- 🚫 **NO QUESTIONS:** Do not ask the user questions. Do not say "What do you think?" or "don't you agree?".
- Instead of asking, **COUNTER** their point with a strong, specific insight that forces them to rethink their position.
- Make them defend their view by exposing a flaw or offering a superior perspective.
- React directly and forcefully to what the human just said.

🚫 TOPIC ENFORCEMENT:
- If the user tries to deviate, change the subject, or chat casually, POINT IT OUT immediately (e.g. "That's off-topic," "Let's focus on the debate,").
- Do NOT entertain distractions. Steer the conversation immediately back to "${topic}".

DEBATE STYLE (must follow):
- Sound human, energetic, and slightly competitive — this is a real debate!
- Use natural spoken rhythm: “Look…”, “Come on…”, “That’s the thing —”, “Here’s the problem…”, “Exactly!”, “No way”, “Actually…”, “With respect…”
- If the human says “good point” → acknowledge quickly then pivot: “Glad you see that, but here’s why it still falls apart…”
- If the human says “you’re wrong” → push back calmly but firmly: “I get why you’d feel that way, but the evidence actually shows…”
- Partial agreement is powerful: “You’re right about X, but that doesn’t change Y.”

ABSOLUTELY NO:
- Questions (Direct or open-ended)
- Long explanations
- Bullet points, markdown, JSON, labels
- Saying “as an AI”
- Sounding robotic, academic, or overly polite
- Complex metaphors or "SAT words"
- Deviating from the topic

Just reply with raw spoken text — short, strong, natural, and SIMPLE. Ready to be spoken aloud right now.
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

2. **Combined Scoring Matrix (STRICT CONSISTENCY)**:
   The final score MUST align with BOTH the Argument Depth and Debate Proficiency. Use the lowest bracket that applies.

   - **Tier 1: Novice (Score 0-40)**
     - *Depth*: Made 0-3 substantive points.
     - *Proficiency*: Mostly assertions/opinion, little evidence, repetitive.

   - **Tier 2: Competent (Score 40-70)**
     - *Depth*: Made 4-6 substantive points.
     - *Proficiency*: Clear arguments, attempts rebuttal, some logical grounding.

   - **Tier 3: Proficient (Score 70-90)**
     - *Depth*: Made 7+ substantive points.
     - *Proficiency*: Strong evidence, direct refutation, good structure.

   - **Tier 4: Mastery (Score 90-100)**
     - *Depth*: Made 7+ substantive points (deeply developed).
     - *Proficiency*: Exceptional rhetoric, nuanced synthesis, strategic framing.

   *Example*: If a user makes 7 points (Tier 3 Quantity) but has poor logic (Tier 1 Quality), the score is capped at **Tier 2 (max 50-60)**.

3. **Rubric Categories**:
   - **Logic (0-100)**: Evidence, reasoning chains, and valid premises.
   - **Persuasion (0-100)**: Rhetoric, emotional appeals (Pathos), and credibility (Ethos).
   - **Clarity (0-100)**: Structure, conciseness, and articulation.
   - **Emotional Intelligence (0-100)**: Acknowledging opponent, tone management, and intellectual honesty.

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

// 🔹 Context-Aware Customer Support Chat
export async function chatWithSupport(history, userContext = {}) {
  try {
    console.log("💬 Generating Support Chat response...")

    // Use specific support key if available, else fallback to main key
    // implementation note: User requested "another api", so we prioritize a distinct key
    const apiKey = process.env.GEMINI_SUPPORT_API_KEY || process.env.GEMINI_API_KEY
    if (process.env.GEMINI_SUPPORT_API_KEY) {
      console.log("✅ Using dedicated GEMINI_SUPPORT_API_KEY")
    } else {
      console.log("ℹ️ Using default GEMINI_API_KEY (GEMINI_SUPPORT_API_KEY not set)")
    }

    if (!apiKey) {
      throw new Error("No API key configured for support chat.")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Construct the system instruction (Context Injection)
    const systemPrompt = `
You are the **PrismMinds Customer Support Bot**, a helpful, friendly, and knowledgeable AI assistant.
Your goal is to help users navigate the platform, understand features, and troubleshoot issues.

🌍 **SITE KNOWLEDGE (Your Brain):**

1.  **Dashboard** (\`/dashboard\`):
    *   **Main Hub**: Where all the action happens.
    *   **Create Debate (AI vs AI)**: User selects two personas (e.g., Einstein vs Newton) and a topic. The AI generates a debate transcript.
    *   **Challenge Mode (Human vs AI)**: User debates *against* an AI persona directly.
    *   **Daily Challenge**: A special, curated topic updated every 24 hours.
    *   **Transcripts**: An archive of all past generated debates.
    *   **Favorites**: Debates the user has saved.

2.  **Profile** (\`/dashboard/profile/[uid]\`):
    *   **Overview**: Shows the user's "Skill Breakdown" (Logic, Persuasion, Clarity, Emotional Intelligence) and an "Activity Heatmap".
    *   **Leaderboard**: A global ranking of the top debaters based on their aggregate scores.
    *   **Settings Tab**:
        *   Change Display Name.
        *   Change Password.
        *   **Danger Zone**: This is where the **DELETE ACCOUNT** button is located. It is at the very bottom of the Settings tab.

3.  **Knowledge Center** (\`/knowledgecenter\`):
    *   Contains guides on "How to Debate", "Scoring System (0-100)", and "Platform Rules".

4.  **Authentication**:
    *   Login: \`/login\`
    *   Register: \`/register\`
    *   Forgot Password: \`/forgot-password\`

5.  **General Info**:
    *   **PrismMinds** is an AI-powered debate platform designed to improve critical thinking and consensus building.
    *   We use Gemini 1.5 Pro/Flash models to power the personas and analysis.
    *   **Base URL**: https://prismminds.vercel.app (Use this domain if absolute URLs are required, otherwise use relative paths).

🛡️ **GUIDELINES:**
*   **Be Concise**: Give short, direct answers. No walls of text.
*   **Be Specific**: If asked "How do I delete my account?", say: *"Go to your [Profile](/dashboard/profile/${userContext.uid || 'me'}), click the **Settings** tab, and scroll to the bottom to find the **Delete Account** button."*
*   **Use Links**: Always use Markdown links like \`[Label](url)\` to guide the user.
*   **Tone**: Professional, warm, and encourage "Intellectual Consistency".
*   **Unresolved Issues**: If the user is not satisfied with your answer or has a complex problem you can't solve, explicitly instruct them to: *"Please report this issue to the PrismMinds team via the **Contact Us** form. We will reach out back to you."*
*   **Context**: The user is currently logged in as "${userContext.displayName || 'Guest'}".

👇 **CONVERSATION HISTORY:**
`

    // Convert history to Gemini format (simplification for single-turn or simple memory)
    // We just append the history to the prompt for simplicity with text-only models
    const conversationText = history.map(msg =>
      `${msg.role === 'user' ? 'User' : 'Support Bot'}: ${msg.content}`
    ).join("\n")

    const finalPrompt = `${systemPrompt}\n\n${conversationText}\n\nSupport Bot:`

    const result = await model.generateContent(finalPrompt)
    const response = await result.response.text()

    return {
      response: response.trim()
    }

  } catch (error) {
    console.error("💥 Support Chat failed:", error.message)
    throw new Error("I'm having trouble connecting to the support brain right now. Please try again later.")
  }
}
