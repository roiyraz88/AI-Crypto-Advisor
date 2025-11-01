import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ success: false, error: { message: "Authentication required" } });
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password -refreshToken");
    if (!user) {
      res.status(401).json({ success: false, error: { message: "User not found" } });
      return;
    }

    req.user = { id: user._id.toString(), email: user.email, name: user.name };
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: "Invalid or expired access token" } });
  }
};
