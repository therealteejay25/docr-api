import { Router } from "express";
import { handleGitHubWebhook } from "../controllers/webhooks.controller";

const router = Router();

router.post("/github", handleGitHubWebhook);

export default router;

