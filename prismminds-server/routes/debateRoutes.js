// prismminds-server/routes/debateRoutes.js
import express from "express";
import { db } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { startDebate, startHumanDebate, generateAIResponse } from "../services/geminiService.js";

const router = express.Router();

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

    res.json({ success: true, id: debateRef.id });
  } catch (err) {
    console.error("Human debate creation error:", err);
    res.status(500).json({ error: "Failed to create human debate" });
  }
});

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
