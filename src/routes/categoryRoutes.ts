// src/routes/categoryRoutes.ts
import { Router } from 'express';
import {
  addCategory,
  editCategory,
  getCategories,
  getSingleCategory,
  removeCategory,
} from '../controllers/categoryController';
import { authenticateToken } from '../middleware/authMiddleware'; // Assuming you have this for protected routes

const router = Router();

// Public routes for fetching categories
router.get('/', getCategories);
router.get('/:id', getSingleCategory);

// Admin-only routes for managing categories
router.post('/', authenticateToken, addCategory);
router.put('/:id', authenticateToken, editCategory);
router.delete('/:id', authenticateToken, removeCategory);

export default router;