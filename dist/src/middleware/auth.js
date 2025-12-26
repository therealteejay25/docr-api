"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await User_1.User.findById(payload.userId);
        if (!user || !user.isActive) {
            res.status(401).json({ error: "User not found or inactive" });
            return;
        }
        req.user = {
            userId: payload.userId,
            email: payload.email,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}
//# sourceMappingURL=auth.js.map