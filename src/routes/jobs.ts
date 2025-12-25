import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getJob, getJobs } from "../controllers/jobs.controller";

const router = Router();

router.use(authenticate);

router.get("/:jobId", getJob);
router.get("/", getJobs);

export default router;

