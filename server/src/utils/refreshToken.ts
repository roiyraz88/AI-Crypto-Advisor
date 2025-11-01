import { randomBytes, createHash } from "crypto";

/**
 * Token Configuration
 * ACCESS_TOKEN: Short-lived, used for API requests (15 minutes)
 * REFRESH_TOKEN: Long-lived, used to get new access tokens (7 days)
 */
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes - short-lived for security
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };

/**
 * Generate a cryptographically secure random refresh token
 * Uses crypto.randomBytes() for security
 */
export const generateRefreshToken = (): string => {
  // Generate 64 random bytes and convert to hex string (128 characters)
  const token = randomBytes(64).toString("hex");
  return token;
};

/**
 * Hash a refresh token for secure storage in the database
 * Using SHA-256 to store only the hash, never the plain token
 */
export const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

/**
 * Verify a refresh token against its stored hash
 */
export const verifyRefreshToken = (
  token: string,
  hashedToken: string
): boolean => {
  const tokenHash = hashRefreshToken(token);
  return tokenHash === hashedToken;
};

/**
 * Calculate refresh token expiry date
 */
export const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setTime(expiry.getTime() + REFRESH_TOKEN_EXPIRY);
  return expiry;
};

/**
 * Check if a refresh token is expired
 */
export const isRefreshTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

