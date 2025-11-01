import { Response } from "express";
import { User } from "../models/User";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import {
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/refreshToken";

const getCookieOptions = (maxAge: number) => {
  const isProd = process.env.NODE_ENV === "production";
  const forceSecure = process.env.FORCE_SECURE_COOKIES === "true";

  return {
    httpOnly: true,
    secure: isProd || forceSecure,         // בפרודקשן חייב Secure כשSameSite=None
    sameSite: (isProd ? "none" : "lax") as "none" | "lax" | "strict",
    maxAge,
    path: "/",
    // אל תקבע domain בלוקאל — זה שובר שליחה של קוקיז
    domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
  };
};

/** REGISTER */
export const register = async (
  req: { body: { email: string; password: string; name: string } },
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, error: { message: "User with this email already exists" } });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const refreshTokenExpiry = getRefreshTokenExpiry();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      refreshToken: hashedRefreshToken,
      refreshTokenExpiry,
    });
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    res.cookie("token", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(201).json({
      success: true,
      data: { user: { id: user._id.toString(), email: user.email, name: user.name } },
    });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ success: false, error: { message: "Failed to register user" } });
  }
};

/** LOGIN */
export const login = async (
  req: { body: { email: string; password: string } },
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ success: false, error: { message: "Invalid email or password" } });
      return;
    }

    const refreshToken = generateRefreshToken();
    user.refreshToken = hashRefreshToken(refreshToken);
    user.refreshTokenExpiry = getRefreshTokenExpiry();
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    res.cookie("token", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      success: true,
      data: { user: { id: user._id.toString(), email: user.email, name: user.name } },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ success: false, error: { message: "Failed to login" } });
  }
};

/** REFRESH */
export const refresh = async (
  req: { cookies: { refreshToken?: string } },
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: { message: "Refresh token not provided" } });
      return;
    }

    const hashed = hashRefreshToken(refreshToken);
    const user = await User.findOne({ refreshToken: hashed });

    if (!user) {
      // נקה קוקיז אם לא תקין
      res.clearCookie("token", getCookieOptions(0));
      res.clearCookie("refreshToken", getCookieOptions(0));
      res.status(401).json({ success: false, error: { message: "Invalid refresh token" } });
      return;
    }

    if (!user.refreshTokenExpiry || new Date() > user.refreshTokenExpiry) {
      user.refreshToken = undefined;
      user.refreshTokenExpiry = undefined;
      await user.save();
      res.clearCookie("token", getCookieOptions(0));
      res.clearCookie("refreshToken", getCookieOptions(0));
      res.status(401).json({ success: false, error: { message: "Refresh token expired" } });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    res.cookie("token", accessToken, getCookieOptions(15 * 60 * 1000));

    res.status(200).json({
      success: true,
      data: { user: { id: user._id.toString(), email: user.email, name: user.name } },
    });
  } catch (e) {
    console.error("Refresh token error:", e);
    res.status(500).json({ success: false, error: { message: "Failed to refresh token" } });
  }
};

/** LOGOUT */
export const logout = async (
  req: { cookies: { refreshToken?: string } },
  res: Response
): Promise<void> => {
  try {
    const rt = req.cookies.refreshToken;
    if (rt) {
      const hashed = hashRefreshToken(rt);
      const user = await User.findOne({ refreshToken: hashed });
      if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpiry = undefined;
        await user.save();
      }
    }

    res.clearCookie("token", getCookieOptions(0));
    res.clearCookie("refreshToken", getCookieOptions(0));
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    console.error("Logout error:", e);
    res.status(500).json({ success: false, error: { message: "Failed to logout" } });
  }
};
