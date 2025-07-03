// src/controllers/productController.ts
import { Request, Response } from 'express';
import {
  Product, // Directly imported from its model now
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../models/productModel';
import { getCategoryById } from '../models/categoryModel'; // Import to validate category_id

// Define Express Request interface extension if needed (Admin is likely used in auth middleware)
// If you have authMiddleware, you might have this already.
// If not, and you use req.admin, you'll need to define it where authenticateAdmin is used,
// or provide a minimal definition here. For now, assuming it's handled or not strictly needed here.
// declare namespace Express {
//   export interface Request {
//     admin?: { id: number; email: string };
//   }
// }


// GET /api/products
export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

// GET /api/products/:id
export const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to retrieve product' });
  }
};

// POST /api/products
export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image, description, price, category_id } = req.body;

    if (!name || !image || !description || typeof price !== 'number') {
      res.status(400).json({ message: 'Name, image, description, and price are required' });
      return;
    }

    // Validate category_id if provided
    if (category_id !== undefined && category_id !== null) {
      if (isNaN(parseInt(category_id))) {
        res.status(400).json({ message: 'Invalid category_id format' });
        return;
      }
      const category = await getCategoryById(category_id);
      if (!category) {
        res.status(400).json({ message: `Category with ID ${category_id} not found` });
        return;
      }
    }

    const product: Product = { name, image, description, price, category_id: category_id || null };
    const newProduct = await createProduct(product);
    res.status(201).json(newProduct);
  } catch (error: any) {
    if (error.code === '23503') { // PostgreSQL foreign key violation error code
        res.status(400).json({ message: `Invalid category_id: Category does not exist.` });
        return;
    }
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// PUT /api/products/:id
export const editProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const { category_id } = req.body;

    // Validate category_id if provided for update
    if (category_id !== undefined && category_id !== null) {
      if (isNaN(parseInt(category_id))) {
        res.status(400).json({ message: 'Invalid category_id format' });
        return;
      }
      const category = await getCategoryById(category_id);
      if (!category) {
        res.status(400).json({ message: `Category with ID ${category_id} not found` });
        return;
      }
    }

    const updatedProduct = await updateProduct(id, req.body);
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error.code === '23503') {
        res.status(400).json({ message: `Invalid category_id: Category does not exist.` });
        return;
    }
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
export const removeProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const result = await deleteProductById(id);
    if (!result.success) {
      res.status(result.message.includes('No product found') ? 404 : 500).json({ message: result.message });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};