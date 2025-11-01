import { Router } from "express";
import {
  getPreferences,
  savePreferences,
} from "../controllers/preferencesController";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { preferencesSchema } from "../utils/validation";

const router = Router();


router.get("/preferences", requireAuth, getPreferences);


router.post(
  "/preferences",
  requireAuth,
  validate(preferencesSchema),
  savePreferences
);

export default router;

