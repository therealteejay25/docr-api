"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = exports.ngrokUrl = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./src/routes"));
const health_1 = __importDefault(require("./src/routes/health"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./src/lib/db");
const logger_1 = require("./src/lib/logger");
const env_1 = require("./src/config/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logging_1 = require("./src/middleware/logging");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ngrok_1 = __importDefault(require("@ngrok/ngrok"));
require("./src/workers"); // Initialize all workers
dotenv_1.default.config();
(0, db_1.connectDB)();
const apiVersion = env_1.env.API_VERSION;
const app = (0, express_1.default)();
exports.app = app;
app.use(logging_1.requestLoggingMiddleware);
// Security: Parse JSON with size limits
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// CORS with strict origin validation in production
app.use((0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true,
}));
app.use(`/api/${apiVersion}/`, routes_1.default);
// Health checks (outside API limiter)
app.use("/health", health_1.default);
// 404 Handler
app.use((_req, res, _next) => {
    res.status(404).json({ error: "Endpoint Not Found" });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    logger_1.logger.error("Unhandled error", err);
    if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
const PORT = env_1.env.PORT || 9000;
const server = http_1.default.createServer(app);
exports.server = server;
// initialize realtime socket.io server
// initRealtime(server);
server.listen(PORT, () => {
    const env_label = env_1.env.IS_PROD ? "PRODUCTION" : "development";
    logger_1.logger.info(`[${env_label}] Express server listening on http://localhost:${PORT}`);
    logger_1.logger.info(`API v${apiVersion}: /api/${apiVersion}/`);
    logger_1.logger.info(`Health checks: http://localhost:${PORT}/health/live`);
});
exports.ngrokUrl = null;
// Initialize ngrok for webhook URL in development
if (!env_1.env.IS_PROD) {
    ngrok_1.default
        .connect({ addr: PORT, authtoken_from_env: true })
        .then((listener) => {
        exports.ngrokUrl = listener.url();
        logger_1.logger.info(`Ingress established at: ${exports.ngrokUrl}`);
    })
        .catch((err) => {
        logger_1.logger.warn("ngrok connection failed. Using localhost for webhooks.", {
            error: err.message,
        });
        exports.ngrokUrl = `http://localhost:${PORT}`;
    });
}
// Workers are initialized via ./src/workers/index.ts
logger_1.logger.info("All background workers started");
//# sourceMappingURL=index.js.map