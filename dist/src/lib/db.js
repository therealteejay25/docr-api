"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
const uri = env_1.env.MONGODB_URI;
// logging for MongoDB connection events
mongoose_1.default.connection.on("connected", () => {
    logger_1.logger.info("MongoDB connection established");
});
// Suppress repeated disconnect warnings by only logging the first until we reconnect
let _mongoDisconnectedWarned = false;
mongoose_1.default.connection.on("disconnected", () => {
    if (_mongoDisconnectedWarned)
        return;
    _mongoDisconnectedWarned = true;
    logger_1.logger.warn("MongoDB connection lost");
});
mongoose_1.default.connection.on("reconnected", () => {
    // Clear the warning flag so future disconnects will be reported again
    _mongoDisconnectedWarned = false;
    logger_1.logger.info("MongoDB reconnected");
});
mongoose_1.default.connection.on("error", (err) => {
    logger_1.logger.error("MongoDB connection error:", err);
});
async function connectDB() {
    try {
        await mongoose_1.default.connect(uri);
        // The event listener above will log on successful connection
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map