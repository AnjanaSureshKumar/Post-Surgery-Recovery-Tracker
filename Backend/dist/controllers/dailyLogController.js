"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDailyLog = exports.listDailyLogs = void 0;
const DailyLog_1 = require("../models/DailyLog");
// 📅 Get all daily logs for the authenticated user
const listDailyLogs = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const logs = await DailyLog_1.DailyLog.find({ userId }).sort({ date: -1 });
        res.json({ success: true, data: logs });
    }
    catch (err) {
        console.error("❌ Error fetching daily logs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.listDailyLogs = listDailyLogs;
// ➕ Create a new daily log
const createDailyLog = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { temperature, mobility, painLevel } = req.body;
        if (!userId || temperature == null || mobility == null || painLevel == null) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const newLog = await DailyLog_1.DailyLog.create({
            userId,
            temperature,
            mobility,
            painLevel,
            date: new Date(),
        });
        res.status(201).json({ success: true, data: newLog });
    }
    catch (err) {
        console.error("❌ Error creating daily log:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createDailyLog = createDailyLog;
