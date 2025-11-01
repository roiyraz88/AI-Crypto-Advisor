import { Router } from "express";
import { healthCheck } from "../controllers/healthController";

const router = Router();

/**
 * Health check route
 * GET /health
 */
router.get("/health", healthCheck);

export default router;
