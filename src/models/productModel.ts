import { Product } from '../types/product'; // Import your updated Product type
import db from './db'; // Correct path to your Knex instance

class ProductModel {
  private tableName = 'products';
  private categoryTableName = 'categories'; // Assuming your categories table name

  /**
   * Fetches all products, joining with categories to get the category name.
   * @returns A promise that resolves to an array of Product objects.
   */
  async findAll(): Promise<Product[]> {
    try {
      const products = await db<Product>(this.tableName)
        .select(
          'products.*', // Select all columns from the products table
          'categories.name as category_name' // Select category name and alias it
        )
        .leftJoin(this.categoryTableName, 'products.category_id', 'categories.id')
        .orderBy('products.created_at', 'desc'); // Order by creation date
      return products;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw new Error('Failed to retrieve products.');
    }
  }

  /**
   * Fetches a single product by its ID, joining with categories.
   * @param id The UUID of the product.
   * @returns A promise that resolves to a Product object or null if not found.
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const product = await db<Product>(this.tableName)
        .select(
          'products.*',
          'categories.name as category_name'
        )
        .leftJoin(this.categoryTableName, 'products.category_id', 'categories.id')
        .where('products.id', id) // Specify table for ID to avoid ambiguity
        .first(); // Get only the first matching record
      return product || null;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw new Error(`Failed to retrieve product with ID ${id}.`);
    }
  }

  /**
   * Creates a new product.
   * @param productData The data for the new product (excluding ID, created_at, updated_at).
   * @returns A promise that resolves to the created Product object.
   */
  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_name'>): Promise<Product> {
    try {
      // Knex automatically handles created_at/updated_at if timestamps(true, true) is used in migration
      // .returning('*') is PostgreSQL specific to return the inserted row
      const [newProduct] = await db<Product>(this.tableName).insert({
        name: productData.name,
        image_url: productData.image_url, // Use image_url
        description: productData.description,
        price: productData.price,
        category_id: productData.category_id || null, // Ensure null if undefined
      }).returning('*');

      // After creation, fetch the product again to include the category_name from the join
      return this.findById(newProduct.id) as Promise<Product>;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product.');
    }
  }

  /**
   * Updates an existing product.
   * @param id The UUID of the product to update.
   * @param productData The partial data to update.
   * @returns A promise that resolves to the updated Product object or null if not found.
   */
  async update(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_name'>>): Promise<Product | null> {
    try {
      // Knex automatically updates 'updated_at' if timestamps(true, true) is used and you modify a row.
      // We explicitly set it here for clarity or if your DB doesn't auto-update.
      const [updatedProduct] = await db<Product>(this.tableName)
        .where({ id })
        .update({
          ...productData,
          updated_at: db.fn.now(), // Explicitly set updated_at
          image_url: productData.image_url, // Ensure image_url is handled
        })
        .returning('*');

      if (!updatedProduct) return null;

      // Re-fetch the product to include the category_name if it was updated or needs to be displayed
      return this.findById(updatedProduct.id) as Promise<Product>;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw new Error(`Failed to update product with ID ${id}.`);
    }
  }

  /**
   * Deletes a product by its ID.
   * @param productId The UUID of the product to delete.
   * @returns A promise that resolves to an object indicating success and a message.
   */
  async delete(productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const deletedRows = await db(this.tableName).where({ id: productId }).del();

      if (deletedRows > 0) {
        return { success: true, message: '✅ Product deleted successfully' };
      } else {
        return { success: false, message: '⚠️ No product found with the given ID' };
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw new Error('❌ Internal server error during product deletion.'); // Re-throw a more specific error
    }
  }
}

export default new ProductModel(); // Export an instance of the model