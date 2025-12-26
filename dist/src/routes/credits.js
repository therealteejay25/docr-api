"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const credits_controller_1 = require("../controllers/credits.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", credits_controller_1.getCredits);
router.post("/add", credits_controller_1.addCredits);
exports.default = router;
//# sourceMappingURL=credits.js.map