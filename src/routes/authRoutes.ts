import express from 'express';
import {
    forgotPassword,
    loginAdmin,
    registerAdmin, // Import the forgotPassword controller function
    resetPassword,
} from '../controllers/authController';

const router = express.Router();

// Authentication Routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Password Reset Routes
router.post('/forgot-password', forgotPassword); // NEW: Route for requesting password reset link
router.post('/reset-password', resetPassword);   // Route for submitting new password with token

export default router;