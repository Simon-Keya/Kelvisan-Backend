import { Request, Response } from 'express';
import {
  Product,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../models/productModel';

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
    const { name, image, description, price } = req.body;
    if (!name || !image || !description || typeof price !== 'number') {
      res.status(400).json({ message: 'Name, image, description, and price are required' });
      return;
    }

    const product: Product = { name, image, description, price };
    const newProduct = await createProduct(product);
    res.status(201).json(newProduct);
  } catch (error) {
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

    const updatedProduct = await updateProduct(id, req.body);
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
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

    const deleted = await deleteProduct(id);
    if (!deleted) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
