// src/models/categoryModel.ts
import pool from './db';

// NEW INTERFACE: Category - Defined here
export interface Category {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
}

export const getAllCategories = async (): Promise<Category[]> => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getCategoryByName = async (name: string): Promise<Category | null> => {
  const result = await pool.query('SELECT * FROM categories WHERE name ILIKE $1', [name]);
  return result.rows[0] || null;
};

export const createCategory = async (category: Category): Promise<Category> => {
  const { name, description } = category;
  const result = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null] // description can be null
  );
  return result.rows[0];
};

export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category | null> => {
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const updated = {
    name: category.name || existing.name,
    description: category.description ?? existing.description, // Use ?? to allow setting description to null
  };

  const result = await pool.query(
    'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [updated.name, updated.description, id]
  );

  return result.rows[0];
};

export const deleteCategoryById = async (categoryId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);

    if ((result.rowCount ?? 0) > 0) {
      return { success: true, message: '✅ Category deleted successfully' };
    } else {
      return { success: false, message: '⚠️ No category found with the given ID' };
    }
  } catch (error: any) {
    if (error.code === '23503') { // PostgreSQL foreign key violation error code
      return { success: false, message: '❌ Cannot delete category: products are assigned to it.' };
    }
    console.error('❌ Error deleting category:', error);
    return { success: false, message: '❌ Internal server error' };
  }
};