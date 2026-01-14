// prismminds-server/routes/debateRoutes.js
import express from "express";
import { db } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { startDebate, startHumanDebate, generateAIResponse, analyzeDebate } from "../services/geminiService.js";

const router = express.Router();

// 🔹 Get Daily Challenge Topic
router.get("/daily", async (req, res) => {
  try {
    // List of high-quality debate topics
    const topics = [
      "Is privacy more important than national security?",
      "Should AI replace human judges in courtrooms?",
      "Is social media net positive or negative for society?",
      "Should universal basic income be implemented globally?",
      "Is space exploration a waste of resources?",
      "Should gene editing be allowed on humans?",
      "Is a 4-day work week better for productivity?",
      "Should animal testing be banned completely?",
      "Is free speech absolute?",
      "Should cryptocurrencies be regulated globally?"
    ];

    // Pick a topic based on the day of the year to ensure it rotates daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const topic = topics[dayOfYear % topics.length];

    let participationData = { participated: false, score: null };

    // Check Authorization header manually since middleware isn't used globally here
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const idToken = authHeader.split("Bearer ")[1];
        // lazy import admin to avoid top-level await issues if any, though db is already imported
        const { getAuth } = await import("firebase-admin/auth");
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check for existing human-to-ai debate on this topic
        const snapshot = await db.collection("debates")
          .doc(uid)
          .collection("userDebates")
          .where("topic", "==", topic)
          .where("debateType", "==", "human-to-ai")
          .orderBy("createdAt", "desc") // Get latest attempt
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const debateDoc = snapshot.docs[0].data();
          participationData.participated = true;

          if (debateDoc.analysis && debateDoc.analysis.scores) {
            const { logic, persuasion, clarity, emotional_intelligence } = debateDoc.analysis.scores;
            // Calculate average score
            const avg = Math.round((logic + persuasion + clarity + emotional_intelligence) / 4);
            participationData.score = avg;
          }
        }
      } catch (authErr) {
        console.warn("Daily challenge auth check failed (ignoring):", authErr.message);
      }
    }

    res.json({ topic, date: new Date().toISOString(), ...participationData });
  } catch (err) {
    console.error("Daily challenge error:", err);
    res.status(500).json({ error: "Failed to fetch daily challenge" });
  }
});

// Create a new debate
router.post("/create", verifyFirebaseToken, async (req, res) => {
  try {
    const { topic, personaA, personaB, duration } = req.body;
    const uid = req.user.uid;
    console.log("Creating debate for user:", uid);

    const debateData = await startDebate(topic, personaA, personaB, duration);

    const debateRef = await db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .add({
        uid,
        topic,
        personaA,
        personaB,
        duration,
        transcript: debateData.transcript,
        summary: debateData.moderator_summary,
        createdAt: new Date().toISOString(),
      });

    res.json({ success: true, id: debateRef.id });
  } catch (err) {
    console.error("Debate creation error:", err);
    res.status(500).json({ error: "Failed to create debate" });
  }
});


// ... existing imports

// Helper: Check and update streak
async function updateUserStreak(uid) {
  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const lastActivity = userData.lastActivityDate ? new Date(userData.lastActivityDate) : null;
    const now = new Date();
    let streak = userData.streak || 0;

    // Normalize to midnight
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    if (lastActivity) {
      const lastMidnight = new Date(lastActivity);
      lastMidnight.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(todayMidnight - lastMidnight);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak += 1; // Consecutive day
      } else if (diffDays > 1) {
        streak = 1; // Broken streak
      }
      // If diffDays === 0, same day, do nothing (keep streak)
    } else {
      streak = 1; // First activity
    }

    // Basic Badges Logic (Example)
    let badges = userData.badges || [];
    if (streak >= 7 && !badges.includes("streak_master")) badges.push("streak_master");
    // Note: "first_blood" is hard to check here without debat count, assuming front-end handles or separate check

    await userRef.set({
      lastActivityDate: now.toISOString(),
      streak: streak,
      badges: badges
    }, { merge: true });

    return { streak, badges };
  } catch (e) {
    console.error("Error updating streak:", e);
    return null;
  }
}

// ...

// 🔹 Create a new human-to-AI debate
router.post("/create-human", verifyFirebaseToken, async (req, res) => {
  try {
    const { topic } = req.body;
    const uid = req.user.uid;
    console.log("Creating human-to-AI debate for user:", uid);
    console.log("Topic:", topic);

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const debateData = await startHumanDebate(topic.trim());

    const debateRef = await db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .add({
        uid,
        topic: topic.trim(),
        debateType: "human-to-ai",
        personaA: "You",
        personaB: "AI Debater",
        transcript: debateData.transcript || [],
        summary: debateData.moderator_summary || "",
        createdAt: new Date().toISOString(),
      });

    // UPDATE STREAK
    await updateUserStreak(uid);

    res.json({ success: true, id: debateRef.id });
  } catch (err) {
    console.error("Human debate creation error:", err);
    res.status(500).json({ error: "Failed to create human debate" });
  }
});

// ...


// 🔹 Get recent debates (supports optional ?limit=50)
router.get("/recent", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    // Allow client to request a custom limit; default to 50 to avoid huge responses
    const requested = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requested) && requested > 0 ? requested : 50;

    const snapshot = await db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const debates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(debates);
  } catch (err) {
    console.error("Fetch debates error:", err);
    res.status(500).json({ error: "Failed to fetch debates" });
  }
});

// 🔹 Delete a debate by id
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const debateId = req.params.id;

    if (!debateId) {
      return res.status(400).json({ error: "Debate id required" });
    }

    const debateRef = db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .doc(debateId);

    const docSnap = await debateRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Debate not found" });
    }

    await debateRef.delete();
    await db
      .collection("debates")
      .doc(uid)
      .collection("favorites")
      .doc(debateId)
      .delete();

    console.log(`Deleted debate ${debateId} for user ${uid}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete debate error:", err);
    res.status(500).json({ error: "Failed to delete debate" });
  }
});

// 🔹 Get a single debate by ID
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const debateId = req.params.id;

    if (!debateId) {
      return res.status(400).json({ error: "Debate ID required" });
    }

    // Reference to the specific debate under this user's collection
    const debateRef = db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .doc(debateId);

    const docSnap = await debateRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Debate not found" });
    }

    // Return debate data with ID
    const debateData = { id: docSnap.id, ...docSnap.data() };
    res.json(debateData);
  } catch (err) {
    console.error("Get debate by ID error:", err);
    res.status(500).json({ error: "Failed to fetch debate by ID" });
  }
});

// 🔹 Send a human message and get AI response (for human-to-AI debates)
router.post("/:id/message", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const debateId = req.params.id;
    const { message } = req.body;

    if (!debateId) {
      return res.status(400).json({ error: "Debate ID required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get the debate
    const debateRef = db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .doc(debateId);

    const docSnap = await debateRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const debateData = docSnap.data();
    const topic = debateData.topic;
    const currentTranscript = debateData.transcript || [];

    // Add human message to transcript
    const humanMessage = {
      speaker: "You",
      message: message.trim(),
      phase: "discussion",
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedTranscript = [...currentTranscript, humanMessage];

    // Generate AI response using Gemini
    const aiResponse = await generateAIResponse(topic, updatedTranscript);

    // Add AI message to transcript
    const aiMessage = {
      speaker: "AI Debater",
      message: aiResponse.message,
      phase: "discussion",
      timestamp: new Date().toLocaleTimeString(),
    };

    const finalTranscript = [...updatedTranscript, aiMessage];

    // Update debate in Firebase
    await debateRef.update({
      transcript: finalTranscript,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: aiResponse.message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message and get AI response" });
  }
});

// 🔹 End a human-to-AI debate and finalize transcript
router.post("/:id/end", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const debateId = req.params.id;

    if (!debateId) {
      return res.status(400).json({ error: "Debate ID required" });
    }

    // Get the debate
    const debateRef = db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .doc(debateId);

    const docSnap = await debateRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const debateData = docSnap.data();
    const transcript = debateData.transcript || [];

    // Generate a summary if we have messages
    let summary = debateData.summary || "";
    if (!summary && transcript.length > 0) {
      summary = `Human-to-AI debate on "${debateData.topic}" with ${transcript.length} exchanges. The debate has been completed.`;
    }

    // Mark debate as ended and update with final transcript
    await debateRef.update({
      transcript: transcript,
      summary: summary,
      endedAt: new Date().toISOString(),
      status: "completed",
      updatedAt: new Date().toISOString(),
    });

    console.log(`Debate ${debateId} ended and saved for user ${uid}`);
    res.json({ success: true, message: "Debate ended and transcript saved successfully" });
  } catch (err) {
    console.error("End debate error:", err);
    res.status(500).json({ error: "Failed to end debate" });
  }
});



//  Get user favorites
router.get("/favorites/all", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snapshot = await db
      .collection("debates")
      .doc(uid)
      .collection("favorites")
      .orderBy("createdAt", "desc")
      .get();

    const favorites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(favorites);
  } catch (err) {
    console.error("Fetch favorites error:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// 🔹 Add a debate to favorites
router.post("/favorite", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { debateId } = req.body;

    if (!debateId) {
      return res.status(400).json({ error: "Debate ID required" });
    }

    // 1. Fetch the debate from userDebates
    const debateRef = db
      .collection("debates")
      .doc(uid)
      .collection("userDebates")
      .doc(debateId);

    const docSnap = await debateRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const debateData = docSnap.data();

    // 2. Add to favorites collection
    await db
      .collection("debates")
      .doc(uid)
      .collection("favorites")
      .doc(debateId)
      .set({
        ...debateData,
        favoritedAt: new Date().toISOString()
      });

    res.json({ success: true });
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// 🔹 Remove a debate from favorites
router.delete("/favorite/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const debateId = req.params.id;

    if (!debateId) {
      return res.status(400).json({ error: "Debate ID required" });
    }

    await db
      .collection("debates")
      .doc(uid)
      .collection("favorites")
      .doc(debateId)
      .delete();

    res.json({ success: true });
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});


export default router;


// 🔹 Generate Analysis for a Debate
router.post("/:id/analyze", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const debateId = req.params.id;

    const debateRef = db.collection("debates").doc(uid).collection("userDebates").doc(debateId);
    const docSnap = await debateRef.get();

    if (!docSnap.exists) return res.status(404).json({ error: "Debate not found" });

    const debateData = docSnap.data();

    // Return existing analysis if present
    if (debateData.analysis) {
      return res.json({ success: true, analysis: debateData.analysis, cached: true });
    }

    // Generate new analysis
    const analysis = await analyzeDebate(debateData.transcript || []);

    // Save to Firestore
    await debateRef.update({ analysis });

    res.json({ success: true, analysis, cached: false });

  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});
