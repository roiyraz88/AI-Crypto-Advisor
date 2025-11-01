import { Router } from "express";
import { register, login, logout, refresh } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../utils/validation";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);

// Provide /auth/me for clients that call the auth namespace for current user
router.get("/me", requireAuth, (req, res) => {
	const u = (req as any).user;
	res.json({ success: true, data: { user: u } });
});

export default router;

