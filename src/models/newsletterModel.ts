import pool from './db';

export interface Subscriber {
  id?: number;
  email: string;
  subscribed_at?: Date;
}

export const getAllSubscribers = async (): Promise<Subscriber[]> => {
  const result = await pool.query('SELECT * FROM newsletter ORDER BY subscribed_at DESC');
  return result.rows;
};

// Alias to match controller usage
export { getAllSubscribers as getSubscribers };

export const getSubscriberByEmail = async (email: string): Promise<Subscriber | null> => {
  const result = await pool.query('SELECT * FROM newsletter WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const addSubscriber = async (email: string): Promise<Subscriber> => {
  const result = await pool.query(
    'INSERT INTO newsletter (email) VALUES ($1) RETURNING *',
    [email]
  );
  return result.rows[0];
};

