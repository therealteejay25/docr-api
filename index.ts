import express, { Request, Response, NextFunction } from "express";
import router from "./src/routes";
import healthRouter from "./src/routes/health";
import dotenv from "dotenv";
import { connectDB } from "./src/lib/db";
import { logger } from "./src/lib/logger";
import { env } from "./src/config/env";
import cookieParser from "cookie-parser";
import { requestLoggingMiddleware } from "./src/middleware/logging";
import cors from "cors";
import http from "http";
import ngrok from "@ngrok/ngrok";
import "./src/workers"; // Initialize all workers

dotenv.config();
connectDB();

const apiVersion = env.API_VERSION!;

const app = express();

app.use(requestLoggingMiddleware);

// Security: Parse JSON with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS with strict origin validation in production
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(`/api/${apiVersion}/`, router);

// Health checks (outside API limiter)
app.use("/health", healthRouter);

// 404 Handler
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: "Endpoint Not Found" });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = env.PORT || 9000;

const server = http.createServer(app);

// initialize realtime socket.io server
// initRealtime(server);

server.listen(PORT, () => {
  const env_label = env.IS_PROD ? "PRODUCTION" : "development";
  logger.info(
    `[${env_label}] Express server listening on http://localhost:${PORT}`
  );
  logger.info(`API v${apiVersion}: /api/${apiVersion}/`);
  logger.info(`Health checks: http://localhost:${PORT}/health/live`);
});

export let ngrokUrl: string | null = null;

// Initialize ngrok for webhook URL in development
if (!env.IS_PROD) {
  ngrok
    .connect({ addr: PORT, authtoken_from_env: true })
    .then((listener) => {
      ngrokUrl = listener.url();
      logger.info(`Ingress established at: ${ngrokUrl}`);
    })
    .catch((err) => {
      logger.warn("ngrok connection failed. Using localhost for webhooks.", {
        error: err.message,
      });
      ngrokUrl = `http://localhost:${PORT}`;
    });
}

// Workers are initialized via ./src/workers/index.ts
logger.info("All background workers started");

export { app, server };
