
import express from "express";
import { chatWithSupport } from "../services/geminiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { history, userContext } = req.body;

        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: "Invalid conversation history" });
        }

        const result = await chatWithSupport(history, userContext);
        res.json(result);
    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

export default router;
