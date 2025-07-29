import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { generateToken } from '../config/jwt';
import {
  countFailedAttempts,
  createAdmin,
  findAdminByEmail,
  findAdminById,
  findValidResetToken,
  invalidateResetToken,
  logLoginAttempt,
  saveResetToken,
  updateAdminPassword,
} from '../models/adminModel';
import { sendPasswordResetEmail } from '../utils/emailService';
import { generateSecureToken } from '../utils/tokenUtils';

// ✅ POST /api/auth/login
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      await logLoginAttempt(email, false);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    await logLoginAttempt(email, isMatch);

    if (!isMatch) {
      const failed = await countFailedAttempts(email);
      if (failed >= 5) { // Example: Lockout after 5 failed attempts
        res.status(403).json({ message: 'Too many failed attempts. Account locked temporarily.' });
        return;
      }
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: admin.id, email: admin.email });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ POST /api/auth/register
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const existing = await findAdminByEmail(email);
    if (existing) {
      res.status(409).json({ message: 'Admin with that email already exists.' });
      return;
    }

    await createAdmin(email, password);
    res.status(201).json({ message: 'Admin created successfully.' });
  } catch (error: any) { // Type 'error' as 'any' to access 'message' property
    console.error('Registration error:', error);
    // --- NEW LOGIC: Handle admin limit error ---
    if (error.message && error.message.includes('Admin limit reached')) {
      res.status(403).json({ message: error.message }); // 403 Forbidden or 409 Conflict could work
    } else if (error.code === '23505') { // PostgreSQL unique violation error code (for email/username)
      res.status(409).json({ message: 'An admin with that email already exists.' });
    }
    // --- END NEW LOGIC ---
    else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

// --- Password Reset Functionality ---

// ✅ POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const admin = await findAdminByEmail(email);
    // IMPORTANT: Always send a generic success message to prevent email enumeration attacks.
    // Do not reveal if the email exists or not.
    if (!admin) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      return;
    }

    // Generate a unique, secure token
    const resetToken = generateSecureToken(32); // 32 characters long token
    const expiresAt = new Date(Date.now() + 3600000); // Token valid for 1 hour (3600000 ms)

    // Save the token to the database
    await saveResetToken(admin.id, resetToken, expiresAt);

    // Construct the reset link for the frontend
    // Make sure FRONTEND_RESET_PASSWORD_URL is set in your .env
    const resetLink = `${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}&email=${email}`;

    // Send the email
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error during password reset request.' });
  }
};

// ✅ POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, email, newPassword } = req.body; // Expect token, email, newPassword from frontend

    if (!token || !email || !newPassword) {
      res.status(400).json({ message: 'Token, email, and new password are required.' });
      return;
    }

    // 1. Find and validate the token in the database
    const resetTokenRecord = await findValidResetToken(token);

    if (!resetTokenRecord) {
      res.status(400).json({ message: 'Invalid or expired password reset token.' });
      return;
    }

    // 2. Find the admin associated with the token
    const admin = await findAdminById(resetTokenRecord.admin_id);
    if (!admin) {
      // This case indicates a data inconsistency (token exists but admin doesn't),
      // or the admin was deleted after the token was issued.
      res.status(404).json({ message: 'Admin not found for this token.' });
      return;
    }

    // Compare the email from the request body with the email from the found admin
    if (admin.email !== email) {
      res.status(400).json({ message: 'Invalid token for the provided email.' });
      return;
    }

    // 3. Update the admin's password
    await updateAdminPassword(admin.id, newPassword); // Use admin.id for update

    // 4. Invalidate the token to prevent reuse
    await invalidateResetToken(token);

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error during password reset.' });
  }
};