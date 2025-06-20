import { Router } from 'express';
import { loginAdmin, resetPassword } from '../controllers/authController';

const router = Router();

router.post('/login', loginAdmin);
router.post('/reset-password', resetPassword);

export default router;
