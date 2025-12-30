import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a reusable transporter object
// Moving this outside the function ensures we reuse the connection pool if configured (though for Gmail, simpler is often better)
// Added 'family: 4' to force IPv4 which resolves many "Connection Timeout" issues in production environments (like Vercel/Render)
// Added connectionTimeout to fail fast if blocked
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''), // Sanitize password
    },
    tls: {
        rejectUnauthorized: true, // Recommended for security
    },
    // Production fixes:
    family: 4, // Force IPv4. Many cloud providers have flaky IPv6 routing to Gmail
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 5000,
    socketTimeout: 10000,
});

/**
 * Verifies the transporter connection
 * @returns {Promise<boolean>}
 */
export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email service is ready and connected');
        return true;
    } catch (error) {
        console.error('❌ Email service connection failed:', error.message);
        return false;
    }
};

/**
 * Sends a welcome email to the user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Nodemailer info object
 */
export const sendWelcomeEmail = async (to, name) => {
    const userName = name || "Explorer";

    const mailOptions = {
        from: `"PrismMinds Team" <${process.env.EMAIL_USER}>`,
        to: to,
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

    return transporter.sendMail(mailOptions);
};

/**
 * Sends a password reset OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 * @returns {Promise<Object>} - Nodemailer info object
 */
export const sendOTPEmail = async (to, otp) => {
    const mailOptions = {
        from: `"PrismMinds Security" <${process.env.EMAIL_USER}>`,
        to: to,
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

    return transporter.sendMail(mailOptions);
};

export default {
    sendWelcomeEmail,
    sendOTPEmail,
    verifyEmailConnection
};
