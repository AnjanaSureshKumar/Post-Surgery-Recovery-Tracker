"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
// ✅ Load .env from project root (works for both src & dist)
const envPath = path_1.default.resolve(__dirname, "../.env");
dotenv_1.default.config({ path: envPath });
// ✅ Log to verify
console.log("✅ Loaded .env from:", envPath);
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET || "❌ Missing!");
// Environment variables
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const MONGO_URI = process.env.MONGO_URI || "";
async function start() {
    try {
        await (0, db_1.connectToDatabase)(MONGO_URI);
        const server = http_1.default.createServer(app_1.default);
        server.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌿 Connected to MongoDB at: ${MONGO_URI}`);
            console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? "Loaded" : "Missing!"}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
start();
