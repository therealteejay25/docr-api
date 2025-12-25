import { Router } from "express";
import {
  redirectToGitHub,
  gitHubCallback,
  refreshToken,
  logout,
} from "../controllers/auth";

const router = Router();

router.get("/github", redirectToGitHub);
router.get("/github/callback", gitHubCallback);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;

