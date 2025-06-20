import { Router } from 'express';
import {
    addProduct,
    editProduct,
    getProducts,
    getSingleProduct,
    removeProduct,
} from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getSingleProduct);

// Protected routes (require admin token)
router.post('/', authenticateToken, addProduct);
router.put('/:id', authenticateToken, editProduct);
router.delete('/:id', authenticateToken, removeProduct);

export default router;
