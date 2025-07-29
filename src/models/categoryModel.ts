import { Category } from '../types/category'; // Import the Category type
import db from './db'; // Import the Knex instance

class CategoryModel {
  private tableName = 'categories';

  /**
   * Fetches a category by its ID.
   * @param id The UUID (string) of the category.
   * @returns A promise that resolves to a Category object or null if not found.
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const category = await db<Category>(this.tableName).where({ id }).first();
      return category || null;
    } catch (error) {
      console.error(`Error fetching category by ID (${id}):`, error);
      throw new Error(`Failed to retrieve category with ID ${id}.`);
    }
  }

  /**
   * Fetches a category by its name.
   * @param name The name (string) of the category.
   * @returns A promise that resolves to a Category object or null if not found.
   */
  async getCategoryByName(name: string): Promise<Category | null> {
    try {
      const category = await db<Category>(this.tableName).where({ name }).first();
      return category || null;
    } catch (error) {
      console.error(`Error fetching category by name (${name}):`, error);
      throw new Error(`Failed to retrieve category with name ${name}.`);
    }
  }

  /**
   * Fetches all categories.
   * @returns A promise that resolves to an array of Category objects.
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await db<Category>(this.tableName).select('*').orderBy('name', 'asc');
      return categories;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw new Error('Failed to retrieve categories.');
    }
  }

  /**
   * Creates a new category.
   * @param categoryData The data for the new category (excluding ID, timestamps).
   * @returns A promise that resolves to the newly created Category object.
   */
  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      const [newCategory] = await db<Category>(this.tableName).insert(categoryData).returning('*');
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category.');
    }
  }

  /**
   * Updates an existing category.
   * @param id The UUID of the category to update.
   * @param categoryData The partial data to update.
   * @returns A promise that resolves to the updated Category object or null if not found.
   */
  async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> {
    try {
      const [updatedCategory] = await db<Category>(this.tableName)
        .where({ id })
        .update({ ...categoryData, updated_at: db.fn.now() })
        .returning('*');
      return updatedCategory || null;
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw new Error(`Failed to update category with ID ${id}.`);
    }
  }

  /**
   * Deletes a category by its ID.
   * @param id The UUID of the category to delete.
   * @returns A promise that resolves to the number of deleted rows.
   */
  async deleteCategory(id: string): Promise<number> {
    try {
      const deletedRows = await db(this.tableName).where({ id }).del();
      return deletedRows;
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw new Error(`Failed to delete category with ID ${id}.`);
    }
  }
}

export default new CategoryModel(); // Export an instance of the model