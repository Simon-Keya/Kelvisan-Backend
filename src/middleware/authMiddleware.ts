import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import AdminModel from '../models/adminModel'; // Assuming you have an AdminModel

dotenv.config(); // Load environment variables

// Extend the Request interface to include a 'user' property for TypeScript
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string }; // Adjust based on your JWT payload and Admin type
    }
  }
}

// --- JWT Utility Functions (from your provided code) ---
const JWT_SECRET = process.env.JWT_SECRET || 'your secret key'; // Ensure this matches your .env and Render env vars
const EXPIRES_IN = '60min'; // Token expiration time

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Return null if verification fails (e.g., token expired, invalid signature)
    return null;
  }
};
// --- End JWT Utility Functions ---


// --- Express Authentication Middleware ---
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: 'Authentication token missing' });
    return;
  }

  try {
    // Use the verifyToken utility function
    const decoded = verifyToken(token);

    if (!decoded) {
      // If verifyToken returns null, it means the token is invalid or expired
      res.status(403).json({ message: 'Invalid or expired authentication token' });
      return;
    }

    // Ensure decoded has the expected properties (id, email, role)
    if (typeof decoded !== 'object' || !('id' in decoded) || !('email' in decoded) || !('role' in decoded)) {
      res.status(403).json({ message: 'Invalid token payload' });
      return;
    }

    // Optionally, fetch the user from the database to ensure they still exist and are active
    // This adds an extra layer of security but also a database lookup on every authenticated request.
    const admin = await AdminModel.getAdminById(decoded.id); // Assuming AdminModel has getAdminById
    if (!admin) {
      res.status(403).json({ message: 'Invalid token: User not found.' });
      return;
    }

    // Attach the decoded user payload to the request object
    req.user = { id: admin.id, email: admin.email, role: admin.role }; // Ensure consistency with your Admin type

    next(); // Proceed to the next middleware/route handler
  } catch (error: any) {
    // This catch block will primarily handle unexpected errors during the process,
    // as jwt.verify errors are already handled by `verifyToken` returning null.
    console.error('Error in authentication middleware:', error);
    res.status(500).json({ message: 'Failed to authenticate token' });
  }
};

// Middleware for role-based authorization
export const authorizeRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // This should ideally be caught by authenticateToken first, but as a safeguard
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({ message: `Access denied: Requires ${requiredRole} role.` });
      return;
    }
    next();
  };
};
