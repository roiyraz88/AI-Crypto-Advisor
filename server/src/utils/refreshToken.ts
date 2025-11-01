import { randomBytes, createHash } from "crypto";


const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes - short-lived for security
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };


export const generateRefreshToken = (): string => {
  // Generate 64 random bytes and convert to hex string (128 characters)
  const token = randomBytes(64).toString("hex");
  return token;
};


export const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};


export const verifyRefreshToken = (
  token: string,
  hashedToken: string
): boolean => {
  const tokenHash = hashRefreshToken(token);
  return tokenHash === hashedToken;
};


export const getRefreshTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setTime(expiry.getTime() + REFRESH_TOKEN_EXPIRY);
  return expiry;
};

export const isRefreshTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

