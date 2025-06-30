import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import {
  countFailedAttempts,
  createAdmin,
  findAdminByEmail,
  logLoginAttempt,
  updateAdminPassword,
} from '../models/adminModel';
import { generateToken } from '../utils/jwt';

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

    const isMatch = await bcrypt.compare(password, admin.password);
    await logLoginAttempt(email, isMatch);

    if (!isMatch) {
      const failed = await countFailedAttempts(email);
      if (failed >= 5) {
        res.status(403).json({ message: 'Too many failed attempts. Try again later.' });
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ message: 'Email and new password are required.' });
      return;
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    await updateAdminPassword(email, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
