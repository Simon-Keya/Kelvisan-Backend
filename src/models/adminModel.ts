import bcrypt from 'bcrypt';
import { Admin } from '../types/admin'; // Import Admin type
import { LoginAttempt } from '../types/loginAttempt'; // Import LoginAttempt type
import { PasswordResetToken } from '../types/passwordResetToken'; // Import PasswordResetToken type
import db from './db'; // Correct path to your Knex instance

// Define the maximum number of allowed admins
const MAX_ADMINS = 4; // You can change this number as needed

/**
 * Finds an admin by their email address.
 * @param email The email of the admin to find.
 * @returns The admin object or undefined if not found.
 */
export async function findAdminByEmail(email: string): Promise<Admin | undefined> {
  try {
    const admin = await db<Admin>('admins').where({ email }).first();
    return admin;
  } catch (error) {
    console.error(`Error finding admin by email (${email}):`, error);
    throw new Error('Could not retrieve admin information.');
  }
}

/**
 * Finds an admin by their ID.
 * @param id The UUID of the admin to find.
 * @returns The admin object or undefined if not found.
 */
export async function findAdminById(id: string): Promise<Admin | undefined> {
  try {
    const admin = await db<Admin>('admins').where({ id }).first();
    return admin;
  } catch (error) {
    console.error(`Error finding admin by ID (${id}):`, error);
    throw new Error('Could not retrieve admin information.');
  }
}

/**
 * Creates a new admin user.
 * This function now includes a check to ensure the number of admins
 * does not exceed MAX_ADMINS.
 * @param email The email for the new admin.
 * @param password The plain-text password to be hashed.
 * @returns The newly created admin object.
 */
export async function createAdmin(email: string, password: string): Promise<Admin> {
  try {
    // --- NEW LOGIC: Check current admin count ---
    const adminCountResult = await db('admins').count('id as count').first();
    const currentAdminCount = parseInt(adminCountResult?.count as string, 10) || 0;

    if (currentAdminCount >= MAX_ADMINS) {
      throw new Error(`Admin limit reached. Cannot create more than ${MAX_ADMINS} admins.`);
    }
    // --- END NEW LOGIC ---

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newAdmin] = await db<Admin>('admins').insert({
      email,
      password_hash: hashedPassword,
      // role: 'admin', // Uncomment if you want to explicitly set a default role here
    }).returning('*');
    return newAdmin;
  } catch (error: any) { // Add :any to error for checking custom messages
    // If the error is our custom limit error, re-throw it directly
    if (error.message.includes('Admin limit reached')) {
      throw error;
    }
    console.error('Error creating admin:', error);
    throw new Error('Could not create admin.');
  }
}

/**
 * Updates an admin's password.
 * @param adminId The ID (UUID) of the admin to update.
 * @param newPassword The new plain-text password.
 * @returns The updated admin object or null if not found.
 */
export async function updateAdminPassword(adminId: string, newPassword: string): Promise<Admin | null> {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [updatedAdmin] = await db<Admin>('admins')
      .where({ id: adminId }) // Use ID for update
      .update({ password_hash: hashedPassword, updated_at: db.fn.now() })
      .returning('*');
    return updatedAdmin || null;
  } catch (error) {
    console.error(`Error updating admin password for ID (${adminId}):`, error);
    throw new Error('Could not update admin password.');
  }
}

/**
 * Logs a login attempt.
 * @param email The email associated with the attempt.
 * @param success Whether the attempt was successful.
 * @returns The logged login attempt object.
 */
export async function logLoginAttempt(email: string, success: boolean): Promise<LoginAttempt> {
  try {
    const [newAttempt] = await db<LoginAttempt>('login_attempts').insert({
      email,
      success,
      attempted_at: db.fn.now(),
    }).returning('*');
    return newAttempt;
  } catch (error) {
    console.error(`Error logging login attempt for (${email}):`, error);
    throw new Error('Could not log login attempt.');
  }
}

/**
 * Counts failed login attempts for an email within a given time frame.
 * @param email The email to check.
 * @param minutes The time window in minutes.
 * @returns The number of failed attempts.
 */
export async function countFailedAttempts(email: string, minutes = 15): Promise<number> {
  try {
    const result = await db.raw(
      `SELECT COUNT(*) FROM login_attempts
       WHERE email = ? AND success = false AND attempted_at > NOW() - INTERVAL '? minutes'`,
      [email, minutes]
    );
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error(`Error counting failed attempts for (${email}):`, error);
    throw new Error('Could not count failed login attempts.');
  }
}

// --- Password Reset Token Functions ---

/**
 * Saves a new password reset token to the database.
 * @param adminId The UUID of the admin for whom the token is generated.
 * @param token The unique token string.
 * @param expiresAt The expiration date/time of the token.
 * @returns The created PasswordResetToken object.
 */
export async function saveResetToken(adminId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
  try {
    const [newResetToken] = await db<PasswordResetToken>('password_reset_tokens').insert({
      admin_id: adminId,
      token,
      expires_at: expiresAt,
      used: false, // Mark as not used initially
    }).returning('*');
    return newResetToken;
  } catch (error) {
    console.error(`Error saving reset token for admin ID (${adminId}):`, error);
    throw new Error('Could not save password reset token.');
  }
}

/**
 * Finds a password reset token by its string value.
 * Checks if the token is valid (not expired and not used).
 * @param token The token string to find.
 * @returns The PasswordResetToken object or null if not found/invalid.
 */
export async function findValidResetToken(token: string): Promise<PasswordResetToken | null> {
  try {
    const resetToken = await db<PasswordResetToken>('password_reset_tokens')
      .where({ token })
      .andWhere('expires_at', '>', db.fn.now()) // Not expired
      .andWhere({ used: false }) // Not used
      .first();
    return resetToken || null;
  } catch (error) {
    console.error(`Error finding valid reset token (${token}):`, error);
    throw new Error('Could not retrieve password reset token.');
  }
}

/**
 * Marks a password reset token as used.
 * @param token The token string to invalidate.
 * @returns The updated PasswordResetToken object or null if not found.
 */
export async function invalidateResetToken(token: string): Promise<PasswordResetToken | null> {
  try {
    const [updatedToken] = await db<PasswordResetToken>('password_reset_tokens')
      .where({ token })
      .update({ used: true, updated_at: db.fn.now() })
      .returning('*');
    return updatedToken || null;
  } catch (error) {
    console.error(`Error invalidating reset token (${token}):`, error);
    throw new Error('Could not invalidate password reset token.');
  }
}