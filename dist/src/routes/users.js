"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all user routes with authentication
router.use(auth_1.authenticate);
// Get current user
router.get("/me", users_controller_1.getUser);
// Get user settings
router.get("/settings", users_controller_1.getSettings);
// Update user settings
router.put("/settings", users_controller_1.updateSettings);
exports.default = router;
//# sourceMappingURL=users.js.map