import express from "express";
import { sendWelcomeEmail, sendOTPEmail } from "../services/emailService.js";
import dotenv from "dotenv";
import { admin, db } from "../config/firebaseAdmin.js"; // Import Firebase Admin for user management


dotenv.config();

const router = express.Router();

// Email service logic moved to services/emailService.js

// Helper function to generate 6-digit OTP
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
        console.error("❌ Error sending welcome email:", error);
        res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});

// --- FORGOT PASSWORD ENDPOINTS ---

// 1. Request OTP
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

        // Store OTP in Firestore
        // Using `otps` collection, doc ID can be email (easier to overwrite old ones) or auto-id
        // Using email as doc ID ensures only one active OTP per user at a time
        await db.collection("otps").doc(email).set({
            email,
            otp,
            expiresAt,
            createdAt: new Date()
        });

        await sendOTPEmail(email, otp);
        console.log(`✅ OTP sent to ${email}`);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("❌ Forgot password error:", error);
        res.status(500).json({ error: error.message || "Failed to process request" });
    }
});

// 2. Verify OTP (Optional, but good for UI flow)
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
        console.error("❌ Verify OTP error:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});

// 3. Reset Password
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

        // Re-verify OTP to be safe
        if (data.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (new Date() > data.expiresAt.toDate()) {
            return res.status(400).json({ error: "OTP has expired" });
        }

        // Update password using Firebase Admin
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, {
            password: newPassword
        });

        // Delete the used OTP
        await docRef.delete();

        console.log(`✅ Password reset successfully for ${email}`);
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("❌ Reset password error:", error);
        res.status(500).json({ error: error.message || "Failed to reset password" });
    }
});

export default router;