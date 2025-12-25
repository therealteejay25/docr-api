import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  chatWithAgent,
  chatWithAgentStream,
  getAgentCapabilities,
} from "../controllers/ai-agent.controller";
import { handleConfirmation } from "../controllers/ai-agent-confirm.controller";

const router = Router();

router.use(authenticate);

router.post("/chat", chatWithAgent);
router.post("/chat/stream", chatWithAgentStream);
router.post("/confirm", handleConfirmation);
router.get("/capabilities", getAgentCapabilities);

export default router;

