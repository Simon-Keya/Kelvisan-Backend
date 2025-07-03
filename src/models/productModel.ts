// src/models/productModel.ts
import pool from './db';

// MODIFIED INTERFACE: Product - Defined here
export interface Product {
  id?: number;
  name: string;
  image: string;
  description: string;
  price: number;
  category_id?: number | null; // Nullable if not assigned to a category
  category_name?: string | null; // For joined queries
  created_at?: Date;
}

export const getAllProducts = async (): Promise<Product[]> => {
  // JOIN with categories table to get category name
  const result = await pool.query(`
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

export const getProductById = async (id: number): Promise<Product | null> => {
  // JOIN with categories table to get category name
  const result = await pool.query(`
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
  `, [id]);
  return result.rows[0] || null;
};

export const createProduct = async (product: Product): Promise<Product> => {
  const { name, image, description, price, category_id } = product;
  const result = await pool.query(
    'INSERT INTO products (name, image, description, price, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, image, description, price, category_id || null] // category_id can be null
  );
  // Re-fetch with category name to return a complete Product object
  return getProductById(result.rows[0].id) as Promise<Product>;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product | null> => {
  const existing = await getProductById(id);
  if (!existing) return null;

  const updated = {
    name: product.name || existing.name,
    image: product.image || existing.image,
    description: product.description || existing.description,
    price: product.price ?? existing.price,
    category_id: product.category_id ?? existing.category_id, // Allow setting to null explicitly
  };

  const result = await pool.query(
    'UPDATE products SET name = $1, image = $2, description = $3, price = $4, category_id = $5 WHERE id = $6 RETURNING *',
    [updated.name, updated.image, updated.description, updated.price, updated.category_id, id]
  );

  if (!result.rows[0]) return null;
  // Re-fetch with category name to return a complete Product object
  return getProductById(result.rows[0].id) as Promise<Product>;
};

export const deleteProductById = async (productId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [productId]);

    if ((result.rowCount ?? 0) > 0) {
      return { success: true, message: '✅ Product deleted successfully' };
    } else {
      return { success: false, message: '⚠️ No product found with the given ID' };
    }
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return { success: false, message: '❌ Internal server error' };
  }
};