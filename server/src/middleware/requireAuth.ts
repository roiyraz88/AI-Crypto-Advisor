import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Authentication middleware
 * Verifies ACCESS token from cookie and attaches user to request
 * If access token is expired, client should call /auth/refresh to get a new one
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get access token from cookie
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: "Authentication required" },
      });
      return;
    }

    // Verify access token (will throw if expired or invalid)
    const decoded = verifyAccessToken(token);

    // Find user in database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "User not found" },
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired access token" },
    });
  }
};

