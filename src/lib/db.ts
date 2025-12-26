import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "./logger";

const uri = env.MONGODB_URI!;

// logging for MongoDB connection events
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

let _mongoDisconnectedWarned = false;
mongoose.connection.on("disconnected", () => {
  if (_mongoDisconnectedWarned) return;
  _mongoDisconnectedWarned = true;
  logger.warn("MongoDB connection lost");
});

mongoose.connection.on("reconnected", () => {
  _mongoDisconnectedWarned = false;
  logger.info("MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error:", err);
});

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(uri);
    // The event listener above will log on successful connection
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
