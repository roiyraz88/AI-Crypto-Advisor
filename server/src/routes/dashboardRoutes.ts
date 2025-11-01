import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/**
 * GET /dashboard
 * Get personalized dashboard data (protected)
 */
router.get("/dashboard", requireAuth, getDashboard);

export default router;

