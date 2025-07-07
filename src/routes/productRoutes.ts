// src/routes/productRoutes.ts
import { Router } from 'express';
import multer from 'multer'; // Import multer here
import {
    addProduct,
    editProduct,
    getProducts,
    getSingleProduct,
    removeProduct,
} from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Configure multer storage: We'll use memory storage as Cloudinary will directly take a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public routes
router.get('/', getProducts);
router.get('/:id', getSingleProduct);

// Protected routes (require admin token)
// Apply 'upload.single('image')' middleware before your controller function for POST and PUT
// 'image' must match the 'name' attribute of your file input in the frontend's FormData.append('image', ...)
router.post('/', authenticateToken, upload.single('image'), addProduct);
router.put('/:id', authenticateToken, upload.single('image'), editProduct);
router.delete('/:id', authenticateToken, removeProduct);

export default router;