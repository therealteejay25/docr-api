"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const repos_controller_1 = require("../controllers/repos.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/list", repos_controller_1.listRepos);
router.post("/connect", repos_controller_1.connectRepo);
router.delete("/:repoId", repos_controller_1.disconnectRepo);
router.get("/", repos_controller_1.getRepos);
router.patch("/:repoId/setting", repos_controller_1.updateRepoSettings);
exports.default = router;
//# sourceMappingURL=repos.js.map