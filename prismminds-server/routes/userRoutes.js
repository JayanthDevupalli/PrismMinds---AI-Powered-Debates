import express from "express";
import { sendWelcomeEmail, sendOTPEmail } from "../services/emailService.js";
import dotenv from "dotenv";
import { admin, db } from "../config/firebaseAdmin.js";


import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

// 🔹 Delete User Account & All Data
router.delete("/profile", verifyFirebaseToken, async (req, res) => {
    const uid = req.user.uid;
    console.log(`⚠️ Request to delete account for user: ${uid}`);

    try {
        // 1. Delete all user debates
        const debatesRef = db.collection("debates").doc(uid).collection("userDebates");
        const snapshot = await debatesRef.get();

        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`🗑️ Deleted ${snapshot.size} debates for user ${uid}`);
        }

        // 2. Delete the parent debate doc
        await db.collection("debates").doc(uid).delete();

        // 3. Delete user profile doc
        await db.collection("users").doc(uid).delete();

        // 4. Delete Auth User (Optional: Client might do it, but good to ensure)
        try {
            await admin.auth().deleteUser(uid);
            console.log(`✅ Deleted Firebase Auth user ${uid}`);
        } catch (authError) {
            console.warn("⚠️ Could not delete auth user (might already be deleted):", authError.message);
        }

        res.status(200).json({ message: "Account and all data deleted successfully" });

    } catch (error) {
        console.error("❌ Delete account error:", error);
        res.status(500).json({ error: "Failed to delete account data" });
    }
});

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


router.post("/welcome", async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const userName = name || "Explorer";

    try {
        const info = await sendWelcomeEmail(email, userName);
        console.log("✅ Welcome email sent: %s", info.messageId);

        res.status(200).json({ message: "Welcome email sent successfully", messageId: info.messageId });

    } catch (error) {
        console.error("Error sending welcome email:", error);
        res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Check if user exists first
        try {
            await admin.auth().getUserByEmail(email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return res.status(404).json({ error: "User not found with this email" });
            }
            throw error;
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        await db.collection("otps").doc(email).set({
            email,
            otp,
            expiresAt,
            createdAt: new Date()
        });

        await sendOTPEmail(email, otp);
        console.log(`OTP sent to ${email}`);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: error.message || "Failed to process request" });
    }
});

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
        const docRef = db.collection("otps").doc(email);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const data = doc.data();

        if (data.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (new Date() > data.expiresAt.toDate()) {
            return res.status(400).json({ error: "OTP has expired" });
        }

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});

//Reset Password
router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const docRef = db.collection("otps").doc(email);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const data = doc.data();

        if (data.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (new Date() > data.expiresAt.toDate()) {
            return res.status(400).json({ error: "OTP has expired" });
        }

        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, {
            password: newPassword
        });

        await docRef.delete();

        console.log(`✅ Password reset successfully for ${email}`);
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("❌ Reset password error:", error);
        res.status(500).json({ error: error.message || "Failed to reset password" });
    }
});

// 🔹 Leaderboard Endpoint
// 🔹 Recalculate Stats for Leaderboard
router.post("/recalc-stats", verifyFirebaseToken, async (req, res) => {
    try {
        console.log("🔄 Recalculating global stats...");
        const usersSnapshot = await db.collection("users").get();

        const updates = [];

        for (const userDoc of usersSnapshot.docs) {
            const uid = userDoc.id;
            // Get all debates for this user
            const debatesSnapshot = await db.collection("debates").doc(uid).collection("userDebates").get();

            let totalScore = 0;
            let debateCount = debatesSnapshot.size;

            debatesSnapshot.forEach(doc => {
                const data = doc.data();
                // ONLY count Human-to-AI debates for the leaderboard!
                if (data.debateType === 'human-to-ai' && data.analysis && data.analysis.scores) {
                    const s = data.analysis.scores;
                    const avg = (s.logic + s.persuasion + s.clarity + s.emotional_intelligence) / 4;
                    totalScore += avg;
                    // Count only valid human debates with scores towards the total? 
                    // Or count all human debates? Use debateCount logic below.
                }
            });

            // Recount debateCount to only be human debates
            debateCount = debatesSnapshot.docs.filter(d => d.data().debateType === 'human-to-ai').length;

            // Update user doc w/ aggregated stats
            updates.push(userDoc.ref.update({
                debateCount: debateCount,
                totalScore: Math.round(totalScore)
            }));
        }

        await Promise.all(updates);
        console.log("✅ Stats recalculated for all users");
        res.json({ success: true, message: "Leaderboard stats updated" });

    } catch (error) {
        console.error("Recalc stats error:", error);
        res.status(500).json({ error: "Failed to recalculate stats" });
    }
});

// 🔹 Leaderboard Endpoint
router.get("/leaderboard", async (req, res) => {
    try {
        console.log("🏆 Fetching leaderboard...");
        // Fetch top 20 by score
        // Fetch top 50 by score to include buffer for inactive users
        let usersSnapshot = await db.collection("users").orderBy("totalScore", "desc").limit(50).get();

        let leaderboard = [];

        // Helper to process doc
        const processDoc = (doc) => {
            const data = doc.data();
            // ONLY include users who have at least 1 debate
            if ((data.debateCount || 0) > 0) {
                return {
                    uid: doc.id,
                    name: data.displayName || data.name || "Anonymous",
                    photoURL: data.photoURL || null,
                    score: data.totalScore || 0,
                    debates: data.debateCount || 0
                };
            }
            return null;
        };

        if (usersSnapshot.empty) {
            // Fallback: Fetch all if index unavailable or empty result
            const allUsers = await db.collection("users").get();
            allUsers.forEach(doc => {
                const item = processDoc(doc);
                if (item) leaderboard.push(item);
            });
            leaderboard.sort((a, b) => b.score - a.score);
        } else {
            usersSnapshot.forEach(doc => {
                const item = processDoc(doc);
                if (item) leaderboard.push(item);
            });
        }

        // Return top 20
        res.status(200).json(leaderboard.slice(0, 20));

    } catch (error) {
        console.error("❌ Leaderboard fetch error:", error);
        // Fallback: Return empty or simple list
        res.json([]);
    }
});

export default router;