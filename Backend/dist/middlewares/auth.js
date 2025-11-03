"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
exports.requireAuth = requireAuth;
exports.adminOnly = adminOnly;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ✅ Helper to get JWT secret safely
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
}
// ✅ Core authentication middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : undefined;
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Missing Authorization header" });
    }
    try {
        // Verify and decode JWT
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        req.user = {
            id: payload.id || payload.userId,
            userId: payload.id || payload.userId,
            role: payload.role,
        };
        // ✅ Allow admin even if no MongoDB ID
        if (req.user?.userId === "admin" && req.user?.role === "admin") {
            return next();
        }
        // ✅ Normal users must have valid ObjectId
        if (!req.user?.userId) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid token payload" });
        }
        next();
    }
    catch (err) {
        if (err.message === "JWT_SECRET is not configured") {
            return res.status(500).json({ success: false, message: err.message });
        }
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired token" });
    }
}
// ✅ Alias for readability
exports.protect = requireAuth;
// ✅ Admin-only route guard (no DB check)
function adminOnly(req, res, next) {
    if (req.user?.userId === "admin" && req.user?.role === "admin") {
        return next();
    }
    return res
        .status(403)
        .json({ success: false, message: "Admin access only" });
}
