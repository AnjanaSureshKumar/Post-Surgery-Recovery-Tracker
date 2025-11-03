"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const User_1 = require("../models/User");
async function requireAdmin(req, res, next) {
    try {
        // ✅ Allow .env admin (no DB check needed)
        if (req.user?.userId === "admin" && req.user?.role === "admin") {
            return next();
        }
        // ✅ For DB-based admins (if you ever create admin in DB)
        if (req.user?.userId) {
            const user = await User_1.User.findById(req.user.userId);
            if (user && user.role === "admin") {
                return next();
            }
        }
        return res.status(403).json({
            success: false,
            message: "Access denied. Admins only.",
        });
    }
    catch (error) {
        console.error("Admin verification failed:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to verify admin role" });
    }
}
