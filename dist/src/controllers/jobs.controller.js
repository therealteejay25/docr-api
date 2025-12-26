"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = exports.getJob = void 0;
const Job_1 = require("../models/Job");
const logger_1 = require("../lib/logger");
const getJob = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { jobId } = req.params;
        const job = await Job_1.Job.findOne({ jobId });
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        // Verify user owns the repo
        if (job.repoId) {
            const { Repo } = await Promise.resolve().then(() => __importStar(require("../models/Repo")));
            const repo = await Repo.findById(job.repoId);
            if (repo && repo.userId.toString() !== req.user.userId) {
                return res.status(403).json({ error: "Access denied" });
            }
        }
        return res.json({ job });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get job", { error: errorMessage });
        return res.status(500).json({ error: "Failed to fetch job" });
    }
};
exports.getJob = getJob;
const getJobs = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { repoId, status, limit = 50 } = req.query;
        const query = {};
        if (repoId) {
            query.repoId = repoId;
        }
        if (status) {
            query.status = status;
        }
        const jobs = await Job_1.Job.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        return res.json({ jobs });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger_1.logger.error("Failed to get jobs", { error: errorMessage });
        return res.status(500).json({ error: "Failed to fetch jobs" });
    }
};
exports.getJobs = getJobs;
//# sourceMappingURL=jobs.controller.js.map