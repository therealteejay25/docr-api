import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Job } from "../models/Job";
import { logger } from "../lib/logger";

export const getJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { jobId } = req.params;
    const job = await Job.findOne({ jobId });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Verify user owns the repo
    if (job.repoId) {
      const { Repo } = await import("../models/Repo");
      const repo = await Repo.findById(job.repoId);
      if (repo && repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    res.json({ job });
  } catch (error: any) {
    logger.error("Failed to get job", { error: error.message });
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { repoId, status, limit = 50 } = req.query;
    const query: any = {};

    if (repoId) {
      query.repoId = repoId;
    }
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    res.json({ jobs });
  } catch (error: any) {
    logger.error("Failed to get jobs", { error: error.message });
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

