import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary
import { Request, Response } from 'express';
import CategoryModel from '../models/categoryModel'; // Import the default exported instance of CategoryModel
import ProductModel from '../models/productModel'; // Import the default exported instance of ProductModel
import { Product } from '../types/product'; // Import the Product interface from its type definition file

// IMPORTANT: Extend the Express Request interface to include 'file' property from Multer
declare module 'express' {
  export interface Request {
    file?: Express.Multer.File;
    // If you have an admin property from authMiddleware, define it here too:
    // admin?: { id: string; email: string }; // Assuming admin ID is also UUID
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
    const products = await ProductModel.findAll(); // Call method on the imported instance
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

// GET /api/products/:id
export const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID is a string (UUID)
    // No parseInt needed for UUIDs

    const product = await ProductModel.findById(id); // Call method on the imported instance
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

    // 3. Validate and use category_id (now as string/UUID)
    let categoryIdToUse: string | null = null;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      // category_id is expected to be a string (UUID)
      categoryIdToUse = String(category_id); // Ensure it's treated as string
      // Validate if category exists (assuming getCategoryById expects string ID)
      const category = await CategoryModel.getCategoryById(categoryIdToUse); // Call method on the imported instance
      if (!category) {
        res.status(400).json({ message: `Category with ID ${categoryIdToUse} not found.` });
        return;
      }
    }

    // 4. Create product in database
    const productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_name'> = {
      name,
      image_url: imageUrl, // Use the Cloudinary URL and correct property name
      description,
      price: parsedPrice,
      category_id: categoryIdToUse,
    };
    const newProduct = await ProductModel.create(productData); // Call method on the imported instance
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
    const { id } = req.params; // ID is a string (UUID)
    // No parseInt needed for UUIDs

    const { name, description, price, category_id, image_url } = req.body; // image_url is for existing image
    const imageFile = req.file; // New uploaded image file

    let imageUrlToUpdate: string | undefined; // Can be undefined if no image update

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
      // If neither new file nor existing URL is provided, and it's an update,
      // we might want to keep the old image or allow it to be null.
      // For now, if no image data is sent, we don't update the image_url field.
      // If you want to explicitly allow setting image_url to null, you'd need a specific flag from the frontend.
      const existingProduct = await ProductModel.findById(id);
      if (existingProduct) {
        imageUrlToUpdate = existingProduct.image_url;
      } else {
         res.status(404).json({ message: 'Product not found for update.' });
         return;
      }
    }

    // Prepare update object
    const updateData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_name'>> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrlToUpdate !== undefined) updateData.image_url = imageUrlToUpdate; // Use image_url

    // Parse and validate price
    if (price !== undefined) {
      if (typeof price === 'string') {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
          res.status(400).json({ message: 'Invalid price format.' });
          return;
        }
        updateData.price = parsedPrice;
      } else if (typeof price === 'number') {
        updateData.price = price;
      } else {
        res.status(400).json({ message: 'Invalid price format.' });
        return;
      }
    }

    // Validate and assign category_id if provided
    if (category_id !== undefined) {
      if (category_id === null || category_id === '') { // Allow setting category_id to null
        updateData.category_id = null;
      } else {
        const categoryIdToUse = String(category_id); // Ensure it's treated as string (UUID)
        const category = await CategoryModel.getCategoryById(categoryIdToUse); // Call method on the imported instance
        if (!category) {
          res.status(400).json({ message: `Category with ID ${categoryIdToUse} not found.` });
          return;
        }
        updateData.category_id = categoryIdToUse;
      }
    }

    const updatedProduct = await ProductModel.update(id, updateData); // Call method on the imported instance
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
    const { id } = req.params; // ID is a string (UUID)
    // No parseInt needed for UUIDs

    const result = await ProductModel.delete(id); // Call method on the imported instance
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