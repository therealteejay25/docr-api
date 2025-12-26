"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = require("../controllers/health");
const router = (0, express_1.Router)();
router.get("/live", health_1.livenessProbeController);
router.get("/ready", health_1.readinessProbeController);
exports.default = router;
//# sourceMappingURL=health.js.map