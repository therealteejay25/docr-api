"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("../controllers/webhooks.controller");
const router = (0, express_1.Router)();
router.post("/github", webhooks_controller_1.handleGitHubWebhook);
exports.default = router;
//# sourceMappingURL=webhooks.js.map