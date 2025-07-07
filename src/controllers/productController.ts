// src/controllers/productController.ts
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary
import { Request, Response } from 'express';
import { getCategoryById } from '../models/categoryModel';
import {
  Product,
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../models/productModel';

// IMPORTANT: Extend the Express Request interface to include 'file' property from Multer
declare module 'express' {
  export interface Request {
    file?: Express.Multer.File;
    // If you have an admin property from authMiddleware, define it here too:
    // admin?: { id: number; email: string };
  }
}

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Use HTTPS
});


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
    const { name, description, price, category_id } = req.body; // Text fields from FormData
    const imageFile = req.file; // File from Multer

    let imageUrl: string;

    // 1. Handle image upload to Cloudinary
    if (imageFile) {
      // Convert buffer to data URI for Cloudinary upload
      const dataUri = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'kelvisan_products', // Optional: folder in Cloudinary
        resource_type: 'auto' // Automatically detect file type
      });
      imageUrl = uploadResult.secure_url; // Get the secure URL from Cloudinary
    } else {
      res.status(400).json({ message: 'Image file is required for new products.' });
      return;
    }

    // 2. Validate other required fields
    // Note: FormData sends all non-file fields as strings, so parse 'price'
    if (!name || !description || typeof price !== 'string' || isNaN(parseFloat(price))) {
      res.status(400).json({ message: 'Name, description, and a valid price are required' });
      return;
    }
    const parsedPrice = parseFloat(price);

    // 3. Validate and parse category_id
    let parsedCategoryId: number | null = null;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      parsedCategoryId = parseInt(category_id);
      if (isNaN(parsedCategoryId)) {
        res.status(400).json({ message: 'Invalid category_id format.' });
        return;
      }
      const category = await getCategoryById(parsedCategoryId);
      if (!category) {
        res.status(400).json({ message: `Category with ID ${parsedCategoryId} not found.` });
        return;
      }
    }

    // 4. Create product in database
    const product: Product = {
      name,
      image: imageUrl, // Use the Cloudinary URL
      description,
      price: parsedPrice,
      category_id: parsedCategoryId,
    };
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

    const { name, description, price, category_id, image_url } = req.body; // image_url is for existing image
    const imageFile = req.file; // New uploaded image file

    let imageUrlToUpdate: string;

    // Handle image update logic
    if (imageFile) {
      // New image uploaded, upload it to Cloudinary
      const dataUri = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'kelvisan_products',
        resource_type: 'auto'
      });
      imageUrlToUpdate = uploadResult.secure_url;
      console.log('Received new image file for update:', imageFile.originalname);
    } else if (image_url) {
      // No new image, but an existing image URL was passed (meaning user didn't change image)
      imageUrlToUpdate = image_url;
    } else {
      // No new image and no existing image URL means image is missing
      res.status(400).json({ message: 'Image is required. Please upload a new image or ensure an existing image URL is present.' });
      return;
    }

    // Prepare update object
    const updateData: Partial<Product> = {
      name,
      description,
      image: imageUrlToUpdate, // Use the determined image URL
    };

    // Parse and validate price
    if (price !== undefined && typeof price === 'string') {
        updateData.price = parseFloat(price);
        if (isNaN(updateData.price)) {
            res.status(400).json({ message: 'Invalid price format.' });
            return;
        }
    } else if (price !== undefined) { // If price is already a number
        updateData.price = price;
    }


    // Validate and assign category_id if provided
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      const parsedCategoryId = parseInt(category_id);
      if (isNaN(parsedCategoryId)) {
        res.status(400).json({ message: 'Invalid category_id format.' });
        return;
      }
      const category = await getCategoryById(parsedCategoryId);
      if (!category) {
        res.status(400).json({ message: `Category with ID ${parsedCategoryId} not found.` });
        return;
      }
      updateData.category_id = parsedCategoryId;
    } else if (category_id === '') { // Allow setting category_id to null if empty string is sent
        updateData.category_id = null;
    }


    const updatedProduct = await updateProduct(id, updateData);
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error.code === '23503') { // PostgreSQL foreign key violation error code
      res.status(400).json({ message: `Invalid category_id: Category does not exist.` });
      return;
    }
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product.' });
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