"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import all workers to initialize them
require("./processCommit.worker");
require("./generateDocs.worker");
require("./applyPatch.worker");
require("./sendEmail.worker");
require("./recomputeCoverage.worker");
const logger_1 = require("../lib/logger");
logger_1.logger.info("All workers initialized");
//# sourceMappingURL=index.js.map