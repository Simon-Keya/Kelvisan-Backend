import pool from './db';

export interface Product {
  id?: number;
  name: string;
  image: string;
  description: string;
  price: number;
  created_at?: Date;
}

export const getAllProducts = async (): Promise<Product[]> => {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows;
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createProduct = async (product: Product): Promise<Product> => {
  const { name, image, description, price } = product;
  const result = await pool.query(
    'INSERT INTO products (name, image, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, image, description, price]
  );
  return result.rows[0];
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product | null> => {
  const existing = await getProductById(id);
  if (!existing) return null;

  const updated = {
    name: product.name || existing.name,
    image: product.image || existing.image,
    description: product.description || existing.description,
    price: product.price ?? existing.price,
  };

  const result = await pool.query(
    'UPDATE products SET name = $1, image = $2, description = $3, price = $4 WHERE id = $5 RETURNING *',
    [updated.name, updated.image, updated.description, updated.price, id]
  );

  return result.rows[0];
};

export const deleteProductById = async (productId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [productId]);

    // Safely handle possibly null rowCount
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











