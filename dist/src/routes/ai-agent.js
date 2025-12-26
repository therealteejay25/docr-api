"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_agent_controller_1 = require("../controllers/ai-agent.controller");
const ai_agent_confirm_controller_1 = require("../controllers/ai-agent-confirm.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post("/chat", ai_agent_controller_1.chatWithAgent);
router.post("/chat/stream", ai_agent_controller_1.chatWithAgentStream);
router.post("/confirm", ai_agent_confirm_controller_1.handleConfirmation);
router.get("/capabilities", ai_agent_controller_1.getAgentCapabilities);
exports.default = router;
//# sourceMappingURL=ai-agent.js.map