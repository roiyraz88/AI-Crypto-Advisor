import { Response } from "express";
import { User } from "../models/User";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import {
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/refreshToken";

/**
 * Register new user
 */
export const register = async (
  req: { body: { email: string; password: string; name: string } },
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { message: "User with this email already exists" },
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate refresh token and its hash
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const refreshTokenExpiry = getRefreshTokenExpiry();

    // Create user with refresh token
    const user = new User({
      email,
      password: hashedPassword,
      name,
      refreshToken: hashedRefreshToken,
      refreshTokenExpiry,
    });
    await user.save();

    // Generate access token (short-lived) and refresh token (long-lived)
    const accessToken = generateAccessToken(user._id.toString());

    // Set access token in HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes - short-lived
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - long-lived
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to register user" },
    });
  }
};

/**
 * Login user
 */
export const login = async (
  req: { body: { email: string; password: string } },
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid email or password" },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid email or password" },
      });
      return;
    }

    // Generate refresh token and its hash
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const refreshTokenExpiry = getRefreshTokenExpiry();

    // Update user with new refresh token
    user.refreshToken = hashedRefreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();

    // Generate access token (short-lived)
    const accessToken = generateAccessToken(user._id.toString());

    // Set access token in HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to login" },
    });
  }
};

/**
 * Refresh access token using refresh token
 * This endpoint is called when the access token expires
 */
export const refresh = async (
  req: { cookies: { refreshToken: string } },
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    // Check if refresh token exists
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { message: "Refresh token not provided" },
      });
      return;
    }

    // Hash the provided refresh token to compare with stored hash
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    // Find user by hashed refresh token
    const user = await User.findOne({
      refreshToken: hashedRefreshToken,
    });

    // If user not found or token doesn't match, reject
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid refresh token" },
      });
      return;
    }

    // Check if refresh token is expired
    if (!user.refreshTokenExpiry || new Date() > user.refreshTokenExpiry) {
      // Clear the invalid token from database
      user.refreshToken = undefined;
      user.refreshTokenExpiry = undefined;
      await user.save();

      res.status(401).json({
        success: false,
        error: { message: "Refresh token expired" },
      });
      return;
    }

    // Generate a new access token
    const accessToken = generateAccessToken(user._id.toString());

    // Set new access token in HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to refresh token" },
    });
  }
};

/**
 * Logout user (clear cookies and invalidate refresh token)
 */
export const logout = async (
  req: { cookies: { refreshToken: string }; userId?: string },
  res: Response
): Promise<void> => {
  try {
    // If we have a refresh token, invalidate it in the database
    if (req.cookies.refreshToken) {
      const { refreshToken } = req.cookies;
      const hashedRefreshToken = hashRefreshToken(refreshToken);

      // Find and invalidate the refresh token
      const user = await User.findOne({
        refreshToken: hashedRefreshToken,
      });

      if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpiry = undefined;
        await user.save();
      }
    }

    // Clear both cookies
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to logout" },
    });
  }
};
