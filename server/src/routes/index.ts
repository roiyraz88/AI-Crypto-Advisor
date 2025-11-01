import { Router } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import preferencesRoutes from "./preferencesRoutes";
import dashboardRoutes from "./dashboardRoutes";
import votingRoutes from "./votingRoutes";

const router = Router();

// Health check route
router.use("/", healthRoutes);

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("", userRoutes);

// Preferences routes
router.use("", preferencesRoutes);

// Dashboard routes
router.use("", dashboardRoutes);

// Voting routes
router.use("", votingRoutes);

export default router;
