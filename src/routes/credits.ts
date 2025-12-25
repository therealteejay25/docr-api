import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getCredits, addCredits } from "../controllers/credits.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCredits);
router.post("/add", addCredits);

export default router;

