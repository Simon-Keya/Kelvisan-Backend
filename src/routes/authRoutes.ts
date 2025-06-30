import express from 'express';
import { loginAdmin, registerAdmin, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.post('/reset-password', resetPassword);

export default router;
