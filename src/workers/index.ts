// Import all workers to initialize them
import "./processCommit.worker";
import "./generateDocs.worker";
import "./applyPatch.worker";
import "./sendEmail.worker";
import "./recomputeCoverage.worker";

import { logger } from "../lib/logger";

logger.info("All workers initialized");

