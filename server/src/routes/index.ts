import { Router } from "express";
import authRoutes from "./authRoutes";
import votingRoutes from "./votingRoutes";
import { requireAuth } from "../middleware/requireAuth";
import { getDashboard } from "../controllers/dashboardController";
import {
  getPreferences,
  savePreferences,
} from "../controllers/preferencesController";

const router = Router();

router.use("/auth", authRoutes);

router.get("/health", (_req, res) => res.json({ ok: true }));

router.get("/me", requireAuth, async (req, res) => {
  const u = (req as any).user;
  res.json({ success: true, data: { user: u } });
});


router.get("/preferences", requireAuth, getPreferences);
router.get("/preferences/me", requireAuth, getPreferences);
router.post("/preferences", requireAuth, savePreferences);

router.get("/dashboard", requireAuth, getDashboard);

router.use("", votingRoutes);

export default router;
