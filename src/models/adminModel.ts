import bcrypt from 'bcrypt';
import db from './db';

export async function findAdminByEmail(email: string) {
  const result = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createAdmin(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO admins (email, password) VALUES ($1, $2)', [email, hashedPassword]);
}

export async function updateAdminPassword(email: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE admins SET password = $1 WHERE email = $2', [hashed, email]);
}

export async function logLoginAttempt(email: string, success: boolean) {
  await db.query(
    'INSERT INTO login_attempts (email, success, attempted_at) VALUES ($1, $2, NOW())',
    [email, success]
  );
}

export async function countFailedAttempts(email: string, minutes = 15): Promise<number> {
  const result = await db.query(
    `SELECT COUNT(*) FROM login_attempts 
     WHERE email = $1 AND success = false AND attempted_at > NOW() - INTERVAL '${minutes} minutes'`,
    [email]
  );
  return parseInt(result.rows[0].count, 10);
}
