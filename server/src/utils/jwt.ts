import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY } from "./refreshToken";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error(
    "REFRESH_TOKEN_SECRET is not defined in environment variables"
  );
}

export interface JWTPayload {
  userId: string;
}

/**
 * Generate ACCESS token with user ID
 * Access tokens are short-lived (15 minutes) for security
 * They are used for API requests
 */
export const generateAccessToken = (userId: string): string => {
  const payload: JWTPayload = { userId };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY, // 15 minutes
  });
};

/**
 * Generate REFRESH token with user ID
 * Refresh tokens are long-lived and used only to get new access tokens
 * They are stored in DB and sent via HTTP-only cookies
 */
export const generateRefreshTokenJWT = (userId: string): string => {
  const payload: JWTPayload = { userId };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

/**
 * Verify ACCESS token and return payload
 * Throws error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

/**
 * Verify REFRESH token and return payload
 * Uses separate secret for refresh tokens
 */
export const verifyRefreshTokenJWT = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

/**
 * @deprecated Use generateAccessToken instead
 * Kept for backward compatibility
 */
export const generateToken = generateAccessToken;

/**
 * @deprecated Use verifyAccessToken instead
 * Kept for backward compatibility
 */
export const verifyToken = verifyAccessToken;

