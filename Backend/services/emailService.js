const nodemailer = require('nodemailer');

/**
 * Sends an email with the verification OTP using nodemailer.
 * Requires EMAIL_USER and EMAIL_PASS environment variables.
 * @param {string} email - Recipient email address
 * @param {string} otp - The 6-digit OTP
 */
exports.sendOTPEmail = async (email, otp) => {
    // Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ WARNING: EMAIL_USER or EMAIL_PASS not defined in .env! Email will NOT be sent.');
        console.log(`Mock Email sent to ${email} -> OTP: ${otp}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // you can change this depending on the provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `NotesApp Security <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email for NotesApp',
        text: `Your OTP (One Time Password) is: ${otp}\n\nThis OTP will expire in 10 minutes. Please do not share this with anyone.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #6d28d9; text-align: center;">NotesApp Verification</h2>
                <p>Hello,</p>
                <p>Thank you for using NotesApp! Please use the following One-Time Password (OTP) to verify your email address. It is valid for 10 minutes.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #111827;">${otp}</h1>
                </div>
                <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="text-align: center; color: #9ca3af; font-size: 12px;">NotesApp Security Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send verification email. Please try again later.');
    }
};
