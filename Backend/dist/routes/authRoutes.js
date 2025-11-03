"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// ✅ Register new user
router.post("/register", authController_1.register);
// ✅ Login user
router.post("/login", authController_1.login);
exports.default = router;
