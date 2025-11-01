import { Router } from "express";
import { saveVote } from "../controllers/votingController";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { voteSchema } from "../utils/validation";

const router = Router();


router.post("/vote", requireAuth, validate(voteSchema), saveVote);

export default router;

