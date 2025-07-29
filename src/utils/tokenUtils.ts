import crypto from 'crypto';

/**
 * Generates a cryptographically secure random string.
 * This function uses Node.js's built-in crypto module to create
 * a strong random token suitable for sensitive operations like
 * password resets.
 *
 * @param length The desired length of the token in characters.
 * Since `randomBytes` returns bytes and `toString('hex')` converts
 * each byte into two hex characters, we generate half the length
 * in bytes and then slice to the exact desired length.
 * @returns A secure random string.
 */
export const generateSecureToken = (length: number): string => {
  // Ensure the length is an even number for accurate byte conversion,
  // or handle odd lengths by generating one extra byte and slicing.
  // Math.ceil(length / 2) ensures enough bytes are generated.
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};