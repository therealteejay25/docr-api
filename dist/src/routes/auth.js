"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
router.get("/github", auth_1.redirectToGitHub);
router.get("/github/callback", auth_1.gitHubCallback);
router.post("/refresh", auth_1.refreshToken);
router.post("/logout", auth_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map