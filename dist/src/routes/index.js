"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const repos_1 = __importDefault(require("./repos"));
const webhooks_1 = __importDefault(require("./webhooks"));
const credits_1 = __importDefault(require("./credits"));
const analytics_1 = __importDefault(require("./analytics"));
const jobs_1 = __importDefault(require("./jobs"));
const ai_agent_1 = __importDefault(require("./ai-agent"));
const events_1 = __importDefault(require("./events"));
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({
        message: "Docr API - Personal AI Workflow Documentation Builder",
        version: "1.0",
    });
});
router.use("/auth", auth_1.default);
router.use("/users", users_1.default);
router.use("/repos", repos_1.default);
router.use("/webhooks", webhooks_1.default);
router.use("/credits", credits_1.default);
router.use("/analytics", analytics_1.default);
router.use("/jobs", jobs_1.default);
router.use("/ai", ai_agent_1.default);
router.use("/events", events_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map