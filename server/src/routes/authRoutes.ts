import { Router } from "express";
import { register, login, logout, refresh } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../utils/validation";

const router = Router();

/**
 * POST /auth/register
 * Register new user
 */
router.post("/register", validate(registerSchema), register);

/**
 * POST /auth/login
 * Login user, set JWT cookies
 */
router.post("/login", validate(loginSchema), login);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", refresh);

/**
 * POST /auth/logout
 * Clear JWT cookies and invalidate refresh token
 */
router.post("/logout", logout);

export default router;

