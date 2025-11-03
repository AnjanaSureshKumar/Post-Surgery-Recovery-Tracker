"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
/**
 * Safely get the JWT secret from environment variables
 */
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
}
/**
 * Generate a JWT for the given user ID
 */
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}
/**
 * Register a new user
 */
async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "name, email and password are required",
            });
        }
        const existing = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res
                .status(409)
                .json({ success: false, message: "User already exists" });
        }
        const user = await User_1.User.create({ name, email, password });
        const token = signToken(user.id);
        return res.status(201).json({
            success: true,
            data: { id: user.id, name: user.name, email: user.email },
            token,
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return next(err);
    }
}
/**
 * Login existing user
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required",
            });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        const ok = await user.comparePassword(password);
        if (!ok) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        const token = signToken(user.id);
        return res.json({
            success: true,
            data: { id: user.id, name: user.name, email: user.email },
            token,
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return next(err);
    }
}
