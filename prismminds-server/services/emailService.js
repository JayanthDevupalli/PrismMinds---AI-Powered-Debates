import dotenv from "dotenv";

dotenv.config();

/**
 * Sends an email using EmailJS REST API
 * @param {Object} templateParams - Key-value pairs matching your EmailJS template variables
 * @returns {Promise<Object>}
 */
export const sendEmail = async (templateParams) => {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
        console.error("❌ EmailJS Environment variables missing.");
        throw new Error("EmailJS configuration is incomplete in .env");
    }

    const data = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const text = await response.text();
            console.log("✅ Email sent successfully via EmailJS:", text);
            return text;
        } else {
            const errorText = await response.text();
            console.error("❌ EmailJS Error:", errorText);
            throw new Error(`EmailJS failed: ${errorText}`);
        }
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
};

/**
 * Verifies if the required EmailJS environment variables are set
 * @returns {Promise<boolean>}
 */
export const verifyEmailConnection = async () => {
    if (process.env.EMAILJS_SERVICE_ID &&
        process.env.EMAILJS_TEMPLATE_ID &&
        process.env.EMAILJS_PUBLIC_KEY &&
        process.env.EMAILJS_PRIVATE_KEY) {
        console.log('✅ Email service configured (EmailJS)');
        return true;
    } else {
        console.error('❌ Email service missing configuration in .env');
        return false;
    }
};

/**
 * Sends a welcome email to the user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @returns {Promise<Object>}
 */
export const sendWelcomeEmail = async (to, name) => {
    const userName = name || "Explorer";

    // We send the full HTML so you can use {{{message_html}}} in your EmailJS template
    // Or you can use {{to_name}} and {{to_email}} if you designed the template in the dashboard
    const htmlContent = `
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
    `;

    const templateParams = {
        email: to,
        to_name: userName,
        subject: "Welcome to PrismMinds! 🚀",
        message_html: htmlContent, // Make sure your EmailJS template has {{{message_html}}}
    };

    return sendEmail(templateParams);
};

/**
 * Sends a password reset OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 * @returns {Promise<Object>}
 */
export const sendOTPEmail = async (to, otp) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Password Reset Request</h2>
            <p>Your OTP for resetting your password is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    `;

    const templateParams = {
        email: to,
        otp: otp,
        subject: "Password Reset OTP - PrismMinds",
        message_html: htmlContent, // Make sure your EmailJS template has {{{message_html}}}
    };

    return sendEmail(templateParams);
};

export default {
    sendWelcomeEmail,
    sendOTPEmail,
    sendEmail,
    verifyEmailConnection
};

