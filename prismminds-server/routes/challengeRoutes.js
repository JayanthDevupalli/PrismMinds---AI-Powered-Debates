import express from "express";
import { db } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Create a new challenge
router.post("/create", verifyFirebaseToken, async (req, res) => {
    try {
        const { topic, score, challengerName, challengerId } = req.body;

        if (!topic || !score) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create challenge document
        const challengeRef = await db.collection("challenges").add({
            topic,
            score: Number(score),
            challengerName: challengerName || "A Challenger",
            challengerId: challengerId || req.user.uid,
            status: "active", // active, accepted, expired
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
        });

        res.json({ success: true, id: challengeRef.id });
    } catch {
        res.status(500).json({ error: "Failed to create challenge" });
    }
});

// 🔹 Get challenge details (Public endpoint - no auth required to view)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("challenges").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        const data = doc.data();

        // Check expiration
        if (new Date(data.expiresAt) < new Date() && data.status === 'active') {
            // Auto-expire if time passed
            await db.collection("challenges").doc(id).update({ status: 'expired' });
            data.status = 'expired';
        }

        res.json({ id: doc.id, ...data });
    } catch {
        res.status(500).json({ error: "Failed to load challenge" });
    }
});

// 🔹 Accept challenge
router.post("/:id/accept", verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;
        const challengeRef = db.collection("challenges").doc(id);

        // Transaction to ensure atomic status update
        await db.runTransaction(async (t) => {
            const doc = await t.get(challengeRef);
            if (!doc.exists) {
                throw new Error("Challenge not found");
            }

            const data = doc.data();

            if (data.status !== "active") {
                throw new Error(`Challenge is ${data.status}`);
            }

            if (new Date(data.expiresAt) < new Date()) {
                t.update(challengeRef, { status: "expired" });
                throw new Error("Challenge expired");
            }

            // Mark as accepted by this user
            t.update(challengeRef, {
                status: "accepted",
                acceptedBy: uid,
                acceptedAt: new Date().toISOString()
            });
        });

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
