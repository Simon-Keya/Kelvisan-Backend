import { Request, Response } from 'express';
import CategoryModel from '../models/categoryModel'; // Import the default exported instance of CategoryModel
import { Category } from '../types/category'; // Import the Category interface from its type definition file

// GET /api/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.getAllCategories(); // Call method on the imported instance
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
};

// GET /api/categories/:id
export const getSingleCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID is now a string (UUID)
    // No parseInt needed for UUIDs

    const category = await CategoryModel.getCategoryById(id); // Call method on the imported instance
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Failed to retrieve category' });
  }
};

// POST /api/categories
export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const existingCategory = await CategoryModel.getCategoryByName(name); // Call method on the imported instance
    if (existingCategory) {
      res.status(409).json({ message: 'Category with this name already exists' });
      return;
    }

    const categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'> = { name, description };
    const newCategory = await CategoryModel.createCategory(categoryData); // Call method on the imported instance
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// PUT /api/categories/:id
export const editCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID is now a string (UUID)
    // No parseInt needed for UUIDs

    const { name, description } = req.body;
    if (!name && description === undefined) {
      res.status(400).json({ message: 'At least name or description is required for update' });
      return;
    }

    if (name) {
      const existingCategory = await CategoryModel.getCategoryByName(name); // Call method on the imported instance
      // Ensure that if a category with the same name exists, it's not the *current* category being edited.
      if (existingCategory && existingCategory.id !== id) {
        res.status(409).json({ message: 'Category with this name already exists' });
        return;
      }
    }

    const updatedCategory = await CategoryModel.updateCategory(id, { name, description }); // Call method on the imported instance
    if (!updatedCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};


// DELETE /api/categories/:id
export const removeCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID is now a string (UUID)
    // No parseInt needed for UUIDs

    const deletedRows = await CategoryModel.deleteCategory(id); // Call method on the imported instance
    if (deletedRows === 0) {
      res.status(404).json({ message: 'No category found with the given ID' });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error: any) { // Add any to error type for checking error.code
    // Check for PostgreSQL foreign key violation error code (23503)
    if (error.code === '23503') {
      res.status(409).json({ message: 'Cannot delete category because it is associated with existing products.' });
      return;
    }
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};