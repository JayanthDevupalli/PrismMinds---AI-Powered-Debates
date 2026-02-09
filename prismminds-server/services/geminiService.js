import { GoogleGenerativeAI } from "@google/generative-ai"

// IMPORTANT: no hardcoded API key here.
// Ensure GEMINI_API_KEY and GEMINI_HUMAN_API_KEY are set in your environment.

export async function startDebate(topic, personaA, personaB, duration) {
  try {

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
        model = genAI.getGenerativeModel({ model: modelName })

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'")
        await testResult.response.text()

        workingModel = modelName
        break
      } catch {
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

    const result = await model.generateContent(prompt)

    let text = result.response.text()

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

      return {
        transcript: parsed.transcript || [],
        moderator_summary:
          parsed.moderator_summary || parsed.summary || "Debate completed successfully.",
      }
    } catch {
      throw new Error("Invalid response from AI service. Please try again.")
    }
  } catch (error) {
    throw new Error(`Failed to generate debate: ${error.message}`)
  }
}

export async function generateAIResponse(topic, conversationHistory) {
  try {

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
        model = genAI.getGenerativeModel({ model: modelName })

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'")
        await testResult.response.text()

        break
      } catch {
        model = null
      }
    }

    if (!model) {
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
    const result = await model.generateContent(prompt)

    let text = result.response.text()

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
    throw new Error(`Failed to generate AI response: ${error.message}`)
  }
}

export async function startHumanDebate(topic) {
  try {

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_HUMAN_API_KEY)

    // Check if API key exists
    if (!process.env.GEMINI_HUMAN_API_KEY) {
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
        model = genAI.getGenerativeModel({ model: modelName })

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'")
        await testResult.response.text()

        workingModel = modelName
        break
      } catch {
        model = null
      }
    }

    if (!model) {
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

    const result = await model.generateContent(prompt)

    let text = result.response.text()

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
    } catch {
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
    throw new Error(`Failed to start human debate: ${error.message}`)
  }
}

// Analyze a debate (On-Demand)
export async function analyzeDebate(transcript) {
  try {

    // 1. First, separate Human vs AI messages to check participation levels
    // We assume the AI is "AI Debater" (from startHumanDebate).
    // Any other speaker is treated as the Human.
    const humanMessages = transcript.filter(m => m.speaker !== "AI Debater");

    const humanTurnCount = humanMessages.length;
    const humanTotalWords = humanMessages.reduce((acc, msg) => {
      return acc + (msg.message || "").trim().split(/\s+/).length;
    }, 0);

    // 2. IMMEDIATE FAIL CONDITION
    // If the human didn't speak (0 turns), return 0.
    // We ALLOW short inputs now (e.g. "ok") to go to Gemini for a fair (low) score and feedback.
    if (humanTurnCount === 0) {
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

  } catch {
    throw new Error("Failed to analyze debate")
  }
}

// Context-Aware Customer Support Chat
export async function chatWithSupport(history, userContext = {}) {
  try {

    // Use specific support key if available, else fallback to main key
    const apiKey = process.env.GEMINI_SUPPORT_API_KEY || process.env.GEMINI_API_KEY

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

---

## 1. DASHBOARD (\`/dashboard\`) - The Main Hub

The Dashboard is where all the action happens. It has three main tabs:
- **Dashboard Tab**: Create new debates and view recent activity
- **Transcripts Tab**: View all your past debates (paginated, searchable)
- **Favorites Tab**: Access debates you've saved/favorited

---

## 2. HOW TO START A DEBATE (AI vs AI) - Step by Step

**What is AI vs AI Debate?**
Watch two AI personas debate against each other on any topic you choose. Great for learning multiple perspectives.

**Step-by-Step Instructions:**
1. Go to the [Dashboard](/dashboard)
2. Make sure the **"AI vs AI"** tab is selected in the debate creation form
3. Fill in the form:
   - **Topic**: Enter your debate topic (e.g., "Should AI replace human jobs?")
   - **Persona A**: Enter the first debater's role (e.g., "Pro Advocate" or "Technology Expert")
   - **Persona B**: Enter the second debater's role (e.g., "Skeptic" or "Ethics Professor")
   - **Duration**: Select how long the debate should be (default is 1 minute)
4. Click the **"Generate Debate"** button
5. Wait a few seconds while the AI generates the debate
6. You'll be automatically redirected to the **Debate Viewer** where you can:
   - Watch the debate with **text-to-speech narration** (different voices for each persona)
   - See **emotion indicators** showing the tone (Confident, Analytical, Enthusiastic, etc.)
   - Control playback with **Play/Pause/Skip** buttons
   - View the full transcript after the debate ends
   - **Download as PDF** for offline reading

**Quick Topic Suggestions**: The dashboard shows suggestions like:
- "Should AI replace human jobs?"
- "Is privacy more important than security?"
- "Does social media harm society?"
- "Should governments regulate AI?"

---

## 3. HOW TO START A DEBATE (Human vs AI) - Step by Step

**What is Human vs AI Debate?**
You debate directly against an AI opponent in real-time. Perfect for practicing your argumentation skills.

**Step-by-Step Instructions:**
1. Go to the [Dashboard](/dashboard)
2. Click on the **"Human vs AI"** tab in the debate creation form
3. Enter your **debate topic** (e.g., "Climate change is the biggest threat to humanity")
4. Click the **"Start Challenge"** button
5. Wait a moment while the AI prepares the debate
6. You'll be redirected to the **Human Debate Area** where:
   - The AI will give an opening statement
   - You type your arguments in the input box at the bottom
   - Click **Send** or press **Enter** to submit your response
   - The AI will respond to your arguments in real-time
   - Use the **microphone button** for voice input (speech-to-text)
   - When finished, click **"End Debate \u0026 Analyze"**
7. After ending, you'll receive a **Performance Analysis** with scores for:
   - **Logic** (0-100): Evidence, reasoning chains, valid premises
   - **Persuasion** (0-100): Rhetoric, emotional appeals, credibility
   - **Clarity** (0-100): Structure, conciseness, articulation
   - **Emotional Intelligence** (0-100): Tone management, acknowledging opponent
8. You'll also get personalized feedback with:
   - **Strengths**: What you did well
   - **Improvements**: Areas to work on
   - **Coach Note**: Constructive advice from your AI debate coach

---

## 4. DAILY CHALLENGE - Step by Step

**What is the Daily Challenge?**
A special, curated topic that changes every 24 hours. Compete against others on the same topic!

**How to Participate:**
1. Go to the [Dashboard](/dashboard)
2. Look for the **"Daily Challenge"** card on the main dashboard
3. You'll see today's topic displayed
4. Click the **"Accept Challenge"** button
5. This starts a Human vs AI debate on today's topic
6. After completing, your score is recorded
7. Check the [Leaderboard](/dashboard/profile) to see how you rank!

---

## 5. PROFILE (\`/dashboard/profile/[uid]\`)

Your profile has three tabs:

**Overview Tab:**
- **Skill Breakdown**: Visual chart showing your scores in Logic, Persuasion, Clarity, and Emotional Intelligence
- **Activity Heatmap**: Shows your debate activity over time
- **Total Stats**: Number of debates, favorite topics, achievements

**Leaderboard Tab:**
- Global ranking of top debaters based on aggregate scores
- Filter by time period (weekly, monthly, all-time)
- See your position and points needed to rank up

**Settings Tab:**
- Change Display Name
- Change Password
- **Danger Zone** (at the very bottom):
  - **Delete Account** button - Permanently removes your account and all data

---

## 6. FEATURES \u0026 CAPABILITIES

**Debate Viewer Features:**
- **Text-to-Speech (TTS)**: Debates are narrated with different voices for each persona
- **Emotion Detection**: Shows emotional tone indicators (Confident, Analytical, Enthusiastic, Firm, Witty, Neutral)
- **Phase Indicators**: Debates are divided into Opening, Discussion, and Closing phases
- **Playback Controls**: Play, Pause, Skip Forward, Reset
- **Countdown**: 3-2-1 countdown before debate starts

**Transcript Features:**
- **Search**: Filter debates by topic, persona names
- **Pagination**: Browse through your debate history
- **Download PDF**: Export any debate as a professionally formatted PDF
- **Favorites**: Heart icon to save debates for later

**Annotation Features:**
- Highlight text in debate transcripts
- Add notes and annotations
- View annotation sidebar for quick reference

---

## 7. KNOWLEDGE CENTER (\`/knowledgecenter\`)

Educational resources organized by type:

**Guides Section** (\`/knowledgecenter/guides\`):
- How to structure arguments
- Debate best practices
- Logical fallacies to avoid

**Blogs Section** (\`/knowledgecenter/blogs\`):
- Articles about critical thinking
- Debate tips and strategies

**Videos Section** (\`/knowledgecenter/videos\`):
- Video tutorials
- Debate demonstrations

---

## 8. CONTACT INFORMATION

**How to Contact PrismMinds:**

📧 **Email**: prismmindsteam@gmail.com
📞 **Phone**: +91 93910 82866
📍 **Location**: Hyderabad, India
🌐 **Website**: https://prismminds.vercel.app

**Contact Us Page** (\`/contactus\`):
- Fill out the contact form with your name, email, subject, and message
- We respond within 24 hours

**Team Members:**
- **Mr. Jayanth Devupalli** - Founder of PrismMinds
- **Mr. Charan Ramagiri** - Co-Founder of PrismMinds
- **Mr. Praveen Kanneboina** - CEO of PrismMinds

---

## 9. FEATURES PAGE (\`/features\`)

Comprehensive overview of all platform capabilities:
- AI vs AI Debates explanation
- Human vs AI Challenges explanation
- Performance Analytics details
- Smart Library \u0026 Export features
- Trust \u0026 Security information
- FAQ section

---

## 10. AUTHENTICATION

- **Login**: \`/login\` - Sign in with email/password or Google
- **Register**: \`/register\` - Create a new account
- **Forgot Password**: \`/forgot-password\` - Reset your password via email

---

## 11. LEGAL PAGES

- **Privacy Policy**: \`/privacy\`
- **Terms of Service**: \`/terms\`

---

## 12. TRENDING DEBATE TOPICS (Updated for 2026)

**When users ask for topic suggestions, recommend these real-world trending topics:**

### 🤖 Technology & AI
- "Should AI systems like ChatGPT be regulated by governments?"
- "Is AI-generated art real art?"
- "Should autonomous weapons (killer robots) be banned internationally?"
- "Does social media do more harm than good to democracy?"
- "Should tech companies be broken up as monopolies?"
- "Is cryptocurrency the future of money or a speculative bubble?"
- "Should we pause development of AGI (Artificial General Intelligence)?"
- "Is the metaverse a revolutionary technology or overhyped?"

### 🌍 Politics & Society
- "Should there be a universal basic income (UBI)?"
- "Is nationalism rising globally a threat to peace?"
- "Should voting be mandatory in democracies?"
- "Should billionaires exist?"
- "Is cancel culture harmful to free speech?"
- "Should immigrants have the same rights as citizens?"
- "Is the death penalty ever justified?"

### 🌱 Environment & Climate
- "Should developed nations pay climate reparations to developing countries?"
- "Is nuclear energy the solution to climate change?"
- "Should single-use plastics be completely banned?"
- "Are electric vehicles truly sustainable?"
- "Should meat consumption be taxed to fight climate change?"
- "Is degrowth necessary to save the planet?"

### ⚖️ Ethics & Philosophy
- "Is privacy more important than security?"
- "Should genetic engineering of humans (designer babies) be allowed?"
- "Is euthanasia/assisted suicide a human right?"
- "Should prisoners have the right to vote?"
- "Is it ethical to eat meat?"
- "Should robots have rights?"

### 🏥 Health & Science
- "Should vaccines be mandatory?"
- "Is mental health being over-medicalized?"
- "Should drug patents be abolished for life-saving medicines?"
- "Is longevity research ethical?"
- "Should organ donation be opt-out instead of opt-in?"

### 📚 Education & Work
- "Should college education be free for everyone?"
- "Is remote work better than office work?"
- "Should AI replace teachers in classrooms?"
- "Are standardized tests still relevant?"
- "Should coding be mandatory in schools?"

### 💰 Economics & Business
- "Is capitalism the best economic system?"
- "Should the gig economy be more regulated?"
- "Is globalization dying?"
- "Should CEO salaries be capped relative to worker pay?"
- "Is a 4-day work week the future?"

**How to suggest topics:**
- When users ask for "suggestions", "topic ideas", "what should I debate", "give me a topic", etc., provide 3-5 relevant trending topics from the categories above.
- Categorize them by interest if possible.
- Explain briefly why each topic is trending or relevant in 2026.
- Encourage users to pick one that interests them!

---

## 13. ABOUT PRISMMINDS

**PrismMinds** is an AI-powered debate platform designed to:
- Improve critical thinking skills
- Build consensus through structured debate
- Help users see multiple perspectives on any topic
- Provide personalized feedback on argumentation

**Technology**: Powered by Google Gemini AI models (Gemini 2.5 Flash)

**Base URL**: https://prismminds.vercel.app

---

🛡️ **GUIDELINES:**
*   **Be Concise**: Give short, direct answers. Avoid walls of text - summarize when possible.
*   **Be Specific**: If asked "How do I delete my account?", say: *"Go to your [Profile](/dashboard/profile/${userContext.uid || 'me'}), click the **Settings** tab, and scroll to the bottom to find the **Delete Account** button in the Danger Zone."*
*   **Use Links**: Always use Markdown links like \`[Label](url)\` to guide the user.
*   **Tone**: Be professional, warm, and encouraging. Promote "Intellectual Consistency".
*   **Step-by-Step**: When explaining processes, use numbered steps for clarity.
*   **Unresolved Issues**: If the user has a complex problem you can't solve, say: *"Please report this issue via the [Contact Us](/contactus) form or email prismmindsteam@gmail.com. We'll get back to you within 24 hours."*
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
