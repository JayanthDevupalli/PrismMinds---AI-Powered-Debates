import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyA2Pa0AGCC_VKIK88cv4pi2aLQRSzoXAtM");

// Mock debate generator for when API fails
function generateMockDebate(topic, personaA, personaB, duration) {
  console.log("⚠️ Using mock debate generator (Gemini API unavailable)");
  const transcript = debates.default;
  const moderator_summary = `This ${duration}-minute debate on "${topic}" featured compelling arguments from both ${personaA} and ${personaB}. ${personaA} advocated for decisive action, emphasizing opportunities and historical precedents, while ${personaB} urged caution, highlighting potential risks and the need for careful implementation. The discussion concluded with both parties finding common ground on a pilot program approach, demonstrating the value of constructive dialogue in addressing complex issues.`;

  return { transcript, moderator_summary };
}

export async function startDebate(topic, personaA, personaB, duration) {
  try {
    console.log("🔍 Starting debate generation...");
    console.log("Topic:", topic);
    console.log("Personas:", personaA, "vs", personaB);
    console.log("Duration:", duration, "minutes");

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ No GEMINI_API_KEY found, using mock debate");
      return generateMockDebate(topic, personaA, personaB, duration);
    }

    // Try different model names
    const modelNames = [
      "gemini-2.5-flash",
    ];

    let model = null;
    let workingModel = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`);
        model = genAI.getGenerativeModel({ model: modelName });

        // Test with a simple prompt
        const testResult = await model.generateContent("Say 'OK'");
        await testResult.response.text();

        console.log(`✅ Model ${modelName} works!`);
        workingModel = modelName;
        break;
      } catch (e) {
        console.log(`❌ Model ${modelName} failed:`, e.message);
        model = null;
      }
    }

    if (!model) {
      console.warn("⚠️ All Gemini models failed, using mock debate");
      console.warn("💡 Get a valid API key from: https://makersuite.google.com/app/apikey");
      return generateMockDebate(topic, personaA, personaB, duration);
    }

    // Calculate number of exchanges based on duration
    const exchangesPerMinute = 1.2; // Reduced from 1.5 to 1.2 for more focused content
    const totalExchanges = Math.max(4, Math.min(12, Math.round(duration * exchangesPerMinute))); // min 4, max 12

    //     const prompt = `You are moderating a ${duration}-minute debate between two AI personas.

    // Topic: ${topic}
    // Persona A (${personaA}): Expert representing the perspective in favor/support
    // Persona B (${personaB}): Expert representing the questioning/critical perspective

    // Structure this ${duration}-minute debate with ${totalExchanges} total exchanges, divided into three phases.

    // IMPORTANT GUIDELINES:
    // 1. Use clear, everyday language that's easy to understand
    // 2. Avoid jargon or complex terms - if needed, explain them simply
    // 3. Keep responses concise and focused (max 3-4 sentences per exchange)
    // 4. Use real-world examples to illustrate points
    // 5. Break down complex ideas into simple concepts

    // Phase 1 - Opening Statements (${Math.round(totalExchanges * 0.2)} exchanges):
    // - Brief introduction of main points in simple terms
    // - Clear explanation of why this matters to everyday people
    // - Focus on 1-2 key arguments only

    // Phase 2 - Main Discussion (${Math.round(totalExchanges * 0.6)} exchanges):
    // - Build on points using clear examples
    // - Respond directly to the other person's last point
    // - Use "For example..." and "This means..." to explain ideas
    // - Keep technical terms to a minimum

    // Phase 3 - Closing Arguments (${Math.round(totalExchanges * 0.2)} exchanges):
    // - Summarize main points in simple terms
    // - Highlight practical implications
    // - End with a clear takeaway

    // Content Length Guide:
    // - Opening statements: 2-3 sentences
    // - Main discussion: 3-4 sentences
    // - Closing statements: 2-3 sentences

    // Each persona should:
    // - Speak as if explaining to a friend
    // - Use everyday examples when possible
    // - Build on previous points naturally
    // - Show respect while disagreeing
    // - Focus on practical implications

    // IMPORTANT: Return ONLY valid JSON in this exact format (no markdown, no code blocks):
    // {
    //   "transcript": [
    //     {
    //       "speaker": "${personaA}",
    //       "message": "Opening statement...",
    //       "phase": "opening",
    //       "timestamp": "0:00"
    //     },
    //     {
    //       "speaker": "${personaB}",
    //       "message": "Response...",
    //       "phase": "opening",
    //       "timestamp": "1:00"
    //     }
    //   ],
    //   "moderator_summary": "Summary of debate flow, key arguments, and outcome",
    //   "debate_metrics": {
    //     "total_duration": "${duration} minutes",
    //     "exchanges_per_phase": {
    //       "opening": ${Math.round(totalExchanges * 0.2)},
    //       "discussion": ${Math.round(totalExchanges * 0.6)},
    //       "closing": ${Math.round(totalExchanges * 0.2)}
    //     },
    //     "key_themes": ["theme1", "theme2", "theme3"]
    //   }
    // }`;
    const prompt = `
You are generating a natural, human-like debate between two personas who are discussing a topic in a realistic, conversational way. 
The conversation should flow for approximately ${duration} minutes of spoken dialogue.

TOPIC: ${topic}
PERSONA A (${personaA}): Represents the supportive or optimistic viewpoint
PERSONA B (${personaB}): Represents the cautious or critical viewpoint

🎯 OBJECTIVE:
Create a lively, back-and-forth discussion that sounds like two real people having a thoughtful debate. 
It should feel spontaneous — each persona reacts to what the other just said. 
The debate continues naturally until about ${duration} minutes have passed (≈ ${Math.round(duration * 4)} total exchanges, assuming ~4 turns per minute).

🗣️ STRUCTURE:

**Opening (first minute)**  
- Both personas greet each other casually.  
- They acknowledge the topic and express enthusiasm or curiosity.  
- Each shares a short opening thought.  
(Use "phase": "opening" for these turns.)

**Main Discussion (middle section)**  
- Personas take turns responding naturally.  
- Use conversational pacing — some short replies, some more detailed.  
- Include natural interjections (“Yeah, but…”, “That’s interesting…”, “I see your point…”, “Exactly!”).  
- Keep tone polite but energetic, with light disagreement or humor where appropriate.  
- Use simple, everyday language that sounds good spoken aloud.  
- Avoid robotic repetition or formal transitions.  
(Use "phase": "discussion" for these turns.)

**Closing (last minute)**  
- Each persona wraps up their position in a friendly way.  
- End naturally, as two people concluding a conversation (e.g., “Good chat”, “Thanks for sharing your view”).  
(Use "phase": "closing" for these turns.)

🧠 STYLE RULES:
- NO lists, bullet points, or structured sections — only conversational dialogue.  
- Vary length: some responses short (1 sentence), some longer (3–4 sentences).  
- Each line should sound like spoken language, not writing.  
- Avoid repeating phrasing — keep it natural and flowing.  
- No “Moderator” or narrator messages in transcript.  
- Make sure it could realistically fill ${duration} minutes if read aloud.

📦 OUTPUT FORMAT (strict JSON only):
{
  "transcript": [
    {
      "speaker": "${personaA}",
      "message": "Hey ${personaB}, good to see you! I’m really looking forward to this discussion on ${topic}.",
      "phase": "opening",
      "timestamp": "0:00"
    },
    {
      "speaker": "${personaB}",
      "message": "Same here! It’s such an interesting topic — I’ve been thinking a lot about it lately.",
      "phase": "opening",
      "timestamp": "0:30"
    },
    {
      "speaker": "${personaA}",
      "message": "Exactly — it’s something that affects all of us.",
      "phase": "discussion",
      "timestamp": "1:00"
    }
  ],
  "moderator_summary": "A neutral summary describing how ${personaA} and ${personaB} discussed ${topic}, key arguments made, tone, and any resolution.",
  "debate_metrics": {
    "total_duration": "${duration} minutes",
    "approx_exchanges": ${Math.round(duration * 4)},
    "key_themes": ["theme1", "theme2", "theme3"]
  }
}
`;


    console.log("📤 Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);

    let text = result.response.text();
    console.log("📥 Received response from Gemini");

    // Clean up the response
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/g, "");
    }
    cleanText = cleanText.trim();

    try {
      const parsed = JSON.parse(cleanText);
      console.log("✅ Successfully parsed JSON response");
      console.log("Transcript entries:", parsed.transcript?.length || 0);

      return {
        transcript: parsed.transcript || [],
        moderator_summary: parsed.moderator_summary || parsed.summary || "Debate completed successfully.",
      };
    } catch (e) {
      console.error("❌ Failed to parse JSON, using mock debate");
      return generateMockDebate(topic, personaA, personaB, duration);
    }
  } catch (error) {
    console.error("💥 Debate creation error:", error.message);
    console.warn("⚠️ Falling back to mock debate");
    return generateMockDebate(topic, personaA, personaB, duration);
  }
}