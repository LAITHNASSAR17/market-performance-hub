
import crypto from 'crypto';

/**
 * Hash a password using a secure one-way hashing algorithm
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = (password: string): string => {
  // In a real production app, you would use a proper bcrypt or Argon2 implementation
  // This is a simple SHA-256 hash for demonstration purposes
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
};

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns Boolean indicating if the passwords match
 */
export const comparePassword = (plainPassword: string, hashedPassword: string): boolean => {
  const hashedInput = hashPassword(plainPassword);
  return hashedInput === hashedPassword;
};
