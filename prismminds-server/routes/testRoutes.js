// prismminds-server/routes/testRoutes.js
import express from "express";
import { db } from "../config/firebaseAdmin.js";

const router = express.Router();

router.get("/test-db", async (req, res) => {
  try {
    const testDoc = db.collection("test").doc("connection-check");
    await testDoc.set({
      status: "connected",
      timestamp: new Date().toISOString(),
    });

    const docSnap = await testDoc.get();
    res.json({
      message: "Firestore connection OK",
      data: docSnap.data(),
    });
  } catch (error) {
    console.error("Firestore test failed:", error);
    res.status(500).json({ error: "Firestore test failed" });
  }
});

export default router;
