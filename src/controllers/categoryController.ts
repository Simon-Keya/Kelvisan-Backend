// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import {
  Category, // Directly imported from its model now
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategoryById,
  getCategoryByName,
} from '../models/categoryModel';

// GET /api/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
};

// GET /api/categories/:id
export const getSingleCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    const category = await getCategoryById(id);
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

    const existingCategory = await getCategoryByName(name);
    if (existingCategory) {
      res.status(409).json({ message: 'Category with this name already exists' });
      return;
    }

    const category: Category = { name, description };
    const newCategory = await createCategory(category);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// PUT /api/categories/:id
export const editCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    const { name, description } = req.body;
    if (!name && description === undefined) {
      res.status(400).json({ message: 'At least name or description is required for update' });
      return;
    }

    if (name) {
      const existingCategory = await getCategoryByName(name);
      if (existingCategory && existingCategory.id !== id) {
        res.status(409).json({ message: 'Category with this name already exists' });
        return;
      }
    }

    const updatedCategory = await updateCategory(id, { name, description });
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    const result = await deleteCategoryById(id);
    if (!result.success) {
      res.status(result.message.includes('No category found') ? 404 : 409).json({ message: result.message });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};