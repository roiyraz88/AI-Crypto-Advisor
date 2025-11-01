import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();


router.get("/dashboard", requireAuth, getDashboard);

export default router;

