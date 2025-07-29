import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load environment variables for email service.
// This ensures process.env variables are available when this file is imported.
// Adjust the path if your .env file is not directly in the project root.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create a Nodemailer transporter.
// This object is responsible for sending emails.
// Configuration details are pulled from environment variables for security and flexibility.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // SMTP server host (e.g., 'smtp.gmail.com', 'smtp.sendgrid.net')
  port: parseInt(process.env.EMAIL_PORT || '587', 10), // SMTP port (e.g., 587 for TLS, 465 for SSL)
  secure: process.env.EMAIL_SECURE === 'true', // Use 'true' if port is 465 (SSL), 'false' if port is 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER, // Your email address for sending
    pass: process.env.EMAIL_PASS, // Your email password or API key
  },
  // Optional: Add a logger for debugging transporter issues
  // logger: true,
  // debug: true,
});

/**
 * Sends a password reset email to the specified recipient.
 * This function constructs the email content and sends it using the configured Nodemailer transporter.
 * It includes a link that the user can click to reset their password on the frontend.
 *
 * @param toEmail The recipient's email address.
 * @param resetLink The full URL for the password reset page on your frontend,
 * including the token and email as query parameters.
 */
export const sendPasswordResetEmail = async (toEmail: string, resetLink: string): Promise<void> => {
  // Basic validation for critical email configurations
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email service environment variables are not fully configured. Cannot send email.');
    throw new Error('Email service not configured.');
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address (e.g., "Kelvisan Admin <no-reply@kelvisan.com>")
      to: toEmail, // List of recipients
      subject: 'Password Reset Request for Kelvisan Admin Account', // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0056b3;">Password Reset Request</h2>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following link to complete the process:</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
          </p>
          <p>Or copy and paste this into your browser:</p>
          <p><code style="background-color: #f4f4f4; padding: 5px; border-radius: 3px; display: inline-block; word-break: break-all;">${resetLink}</code></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>Thank you,</p>
          <p><strong>The Kelvisan Team</strong></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #666;">This is an automated email, please do not reply.</p>
        </div>
      `, // HTML body content
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent: ${info.messageId}`);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // For Ethereal.email testing

  } catch (error) {
    console.error(`Error sending password reset email to ${toEmail}:`, error);
    // Re-throw the error to be caught by the calling controller
    throw new Error('Failed to send password reset email.');
  }
};