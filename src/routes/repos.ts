import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  listRepos,
  connectRepo,
  disconnectRepo,
  getRepos,
  updateRepoSettings,
} from "../controllers/repos.controller";

const router = Router();

router.use(authenticate);

router.get("/list", listRepos);
router.post("/connect", connectRepo);
router.delete("/:repoId", disconnectRepo);
router.get("/", getRepos);
router.patch("/:repoId/setting", updateRepoSettings);

export default router;

