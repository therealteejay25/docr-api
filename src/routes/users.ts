import { Router } from "express";
import {
  getUser,
  getSettings,
  updateSettings,
} from "../controllers/users.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Protect all user routes with authentication
router.use(authenticate);

// Get current user
router.get("/me", getUser);

// Get user settings
router.get("/settings", getSettings);

// Update user settings
router.put("/settings", updateSettings);

export default router;
