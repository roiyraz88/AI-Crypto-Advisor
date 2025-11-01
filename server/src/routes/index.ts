import { Router } from "express";
import authRoutes from "./authRoutes";
import { requireAuth } from "../middleware/requireAuth";
import { getDashboard } from "../controllers/dashboardController";
import { getPreferences, savePreferences } from "../controllers/preferencesController";

const router = Router();

// Auth
router.use("/auth", authRoutes);

// Health-check (אופציונלי)
router.get("/health", (_req, res) => res.json({ ok: true }));

// מחזיר יוזר אם יש טוקן
router.get("/me", requireAuth, async (req, res) => {
  const u = (req as any).user;
  res.json({ success: true, data: { user: u } });
});

// Preferences
router.get("/preferences", requireAuth, getPreferences);
router.post("/preferences", requireAuth, savePreferences);

// Dashboard
router.get("/dashboard", requireAuth, getDashboard);

export default router;
