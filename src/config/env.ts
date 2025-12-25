import dotenv from "dotenv";
dotenv.config();

// Some libraries expect the env var name `OPENAI_API_KEY`.
// Provide a fallback from our existing `OPENAI_KEY` to avoid missing-credentials errors.
if (process.env.OPENAI_KEY && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_KEY;
}

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

// Validate required env vars
const requiredVars = [
  "PORT",
  "MONGODB_URI",
  "API_VERSION",
  "JWT_SECRET",
  "REFRESH_SECRET",
  "OPENAI_KEY",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_REDIRECT_URI",
  "INTEGRATION_ENC_KEY",
];

if (IS_PROD) {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(
        ", "
      )}`
    );
  }
}

export const env = {
  NODE_ENV,
  IS_PROD,
  PORT: process.env.PORT!,
  MONGODB_URI: process.env.MONGODB_URI!,
  API_VERSION: process.env.API_VERSION || "v1",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  REFRESH_SECRET: process.env.REFRESH_SECRET!,
  OPENAI_KEY: process.env.OPENROUTER_KEY || process.env.OPENAI_KEY!,
  OPENAI_API_BASE: process.env.OPENAI_API_BASE || "https://openrouter.ai/api/v1",
  MODEL: process.env.MODEL!,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
  GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI!,
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  INTEGRATION_ENC_KEY: process.env.INTEGRATION_ENC_KEY!,
};
