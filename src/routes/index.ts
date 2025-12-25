import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import reposRouter from "./repos";
import webhooksRouter from "./webhooks";
import creditsRouter from "./credits";
import analyticsRouter from "./analytics";
import jobsRouter from "./jobs";
import aiAgentRouter from "./ai-agent";
import eventsRouter from "./events";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    message: "Docr API - Personal AI Workflow Documentation Builder",
    version: "1.0",
  });
});

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/repos", reposRouter);
router.use("/webhooks", webhooksRouter);
router.use("/credits", creditsRouter);
router.use("/analytics", analyticsRouter);
router.use("/jobs", jobsRouter);
router.use("/ai", aiAgentRouter);
router.use("/events", eventsRouter);

export default router;
