import { Router } from "express";
import { getMe } from "../controllers/userController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/**
 * GET /me
 * Get current user info (protected)
 */
router.get("/me", requireAuth, getMe);

export default router;

