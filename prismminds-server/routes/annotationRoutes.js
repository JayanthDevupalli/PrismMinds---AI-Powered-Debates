// prismminds-server/routes/annotationRoutes.js
import express from "express";
import { db } from "../config/firebaseAdmin.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Create a new annotation
router.post("/:debateId", verifyFirebaseToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { debateId } = req.params;
        const { messageIndex, selectedText, note, color, startOffset, endOffset } = req.body;

        // Validate required fields
        if (!debateId || messageIndex === undefined || !selectedText || !note) {
            return res.status(400).json({
                error: "Missing required fields: debateId, messageIndex, selectedText, note"
            });
        }

        // Verify the debate exists and belongs to this user
        const debateRef = db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId);

        const debateDoc = await debateRef.get();
        if (!debateDoc.exists) {
            return res.status(404).json({ error: "Debate not found" });
        }

        // Create the annotation
        const annotationRef = await db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId)
            .collection("annotations")
            .add({
                messageIndex,
                selectedText,
                note,
                color: color || "yellow",
                startOffset: startOffset || 0,
                endOffset: endOffset || selectedText.length,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

        console.log(`Created annotation ${annotationRef.id} for debate ${debateId}`);

        res.json({
            success: true,
            id: annotationRef.id,
            annotation: {
                id: annotationRef.id,
                messageIndex,
                selectedText,
                note,
                color: color || "yellow",
                startOffset: startOffset || 0,
                endOffset: endOffset || selectedText.length,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        });
    } catch (err) {
        console.error("Create annotation error:", err);
        res.status(500).json({ error: "Failed to create annotation" });
    }
});

// 🔹 Get all annotations for a debate
router.get("/:debateId", verifyFirebaseToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { debateId } = req.params;

        if (!debateId) {
            return res.status(400).json({ error: "Debate ID required" });
        }

        // Verify the debate exists and belongs to this user
        const debateRef = db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId);

        const debateDoc = await debateRef.get();
        if (!debateDoc.exists) {
            return res.status(404).json({ error: "Debate not found" });
        }

        // Get all annotations for this debate
        const snapshot = await db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId)
            .collection("annotations")
            .orderBy("createdAt", "asc")
            .get();

        const annotations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json({ success: true, annotations });
    } catch (err) {
        console.error("Get annotations error:", err);
        res.status(500).json({ error: "Failed to fetch annotations" });
    }
});

// 🔹 Update an annotation
router.put("/:debateId/:annotationId", verifyFirebaseToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { debateId, annotationId } = req.params;
        const { note, color } = req.body;

        if (!debateId || !annotationId) {
            return res.status(400).json({ error: "Debate ID and Annotation ID required" });
        }

        if (!note && !color) {
            return res.status(400).json({ error: "At least one field (note or color) must be provided" });
        }

        // Verify the debate exists and belongs to this user
        const debateRef = db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId);

        const debateDoc = await debateRef.get();
        if (!debateDoc.exists) {
            return res.status(404).json({ error: "Debate not found" });
        }

        // Update the annotation
        const annotationRef = db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId)
            .collection("annotations")
            .doc(annotationId);

        const annotationDoc = await annotationRef.get();
        if (!annotationDoc.exists) {
            return res.status(404).json({ error: "Annotation not found" });
        }

        const updateData = {
            updatedAt: new Date().toISOString(),
        };

        if (note) updateData.note = note;
        if (color) updateData.color = color;

        await annotationRef.update(updateData);

        console.log(`Updated annotation ${annotationId} for debate ${debateId}`);

        res.json({
            success: true,
            annotation: {
                id: annotationId,
                ...annotationDoc.data(),
                ...updateData,
            }
        });
    } catch (err) {
        console.error("Update annotation error:", err);
        res.status(500).json({ error: "Failed to update annotation" });
    }
});

// 🔹 Delete an annotation
router.delete("/:debateId/:annotationId", verifyFirebaseToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { debateId, annotationId } = req.params;

        if (!debateId || !annotationId) {
            return res.status(400).json({ error: "Debate ID and Annotation ID required" });
        }

        // Verify the debate exists and belongs to this user
        const debateRef = db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId);

        const debateDoc = await debateRef.get();
        if (!debateDoc.exists) {
            return res.status(404).json({ error: "Debate not found" });
        }

        // Delete the annotation
        const annotationRef = db
            .collection("debates")
            .doc(uid)
            .collection("userDebates")
            .doc(debateId)
            .collection("annotations")
            .doc(annotationId);

        const annotationDoc = await annotationRef.get();
        if (!annotationDoc.exists) {
            return res.status(404).json({ error: "Annotation not found" });
        }

        await annotationRef.delete();

        console.log(`Deleted annotation ${annotationId} for debate ${debateId}`);

        res.json({ success: true });
    } catch (err) {
        console.error("Delete annotation error:", err);
        res.status(500).json({ error: "Failed to delete annotation" });
    }
});

export default router;
