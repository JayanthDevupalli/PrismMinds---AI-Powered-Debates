import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { admin, db } from "../config/firebaseAdmin.js"; // Import Firebase Admin for user management


dotenv.config();

const router = express.Router();

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
    // Check if email config is present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ EMAIL_USER or EMAIL_PASS not found in environment variables. Email sending may fail.");
    }

    return nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        tls: {
            rejectUnauthorized: true,
        },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''), // Automatically remove spaces from App Password
        },
    });
};

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
        const transporter = createTransporter();

        const mailOptions = {
            from: `"PrismMinds Team" <${process.env.EMAIL_USER}>`, // sender address
            to: email,
            subject: "Welcome to PrismMinds! 🚀",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4F46E5; margin: 0;">Welcome to PrismMinds!</h1>
                        <p style="font-size: 18px; color: #666;">Unlock the power of critical thinking.</p>
                    </div>

                    <p>Hi ${userName},</p>

                    <p>We are thrilled to have you join our community! You've just taken the first step towards mastering the art of debate and enhancing your critical thinking skills with AI.</p>

                    <h3 style="color: #4F46E5; margin-top: 25px;">Here are some powerful features you can explore right now:</h3>

                    <ul style="line-height: 1.6;">
                        <li><strong>🤖 AI-Powered Debates:</strong> Challenge our advanced AI avatars to debates on any topic imaginable.</li>
                        <li><strong>🧠 Real-time Analysis:</strong> Get instant feedback on your arguments, logical fallacies, and persuasion techniques.</li>
                        <li><strong>🔥 Explore Popular Topics:</strong> Dive into trending debates and see how others are constructing their arguments.</li>
                    </ul>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://prismminds.vercel.app/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Your First Debate</a>
                    </div>

                    <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
                        If you have any questions, feel free to reply to this email. We're here to help!
                    </p>

                    <div style="text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #aaa;">
                        &copy; ${new Date().getFullYear()} PrismMinds. All rights reserved.
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
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

        const transporter = createTransporter();
        const mailOptions = {
            from: `"PrismMinds Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP - PrismMinds",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Your OTP for resetting your password is:</p>
                    <h1 style="color: #4F46E5; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
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
