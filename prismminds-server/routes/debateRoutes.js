// prismminds-server/routes/debateRoutes.js
import express from "express";
import { db } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { startDebate } from "../services/geminiService.js";

const router = express.Router();

// 🔹 Create a new debate
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

export default router;
