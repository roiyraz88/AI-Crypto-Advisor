import { Router } from "express";
import {
  getPreferences,
  savePreferences,
} from "../controllers/preferencesController";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { preferencesSchema } from "../utils/validation";

const router = Router();

/**
 * GET /preferences
 * Get user preferences (protected)
 */
router.get("/preferences", requireAuth, getPreferences);

/**
 * POST /preferences
 * Save or update user preferences (protected)
 */
router.post(
  "/preferences",
  requireAuth,
  validate(preferencesSchema),
  savePreferences
);

export default router;

