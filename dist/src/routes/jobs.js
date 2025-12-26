"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const jobs_controller_1 = require("../controllers/jobs.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/:jobId", jobs_controller_1.getJob);
router.get("/", jobs_controller_1.getJobs);
exports.default = router;
//# sourceMappingURL=jobs.js.map