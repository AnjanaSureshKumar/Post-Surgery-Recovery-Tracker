"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
// 📩 Get all notifications for a specific user
const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification_1.default.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    }
    catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getNotifications = getNotifications;
// ✅ Mark a specific notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification_1.default.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json(notification);
    }
    catch (err) {
        console.error("Error marking as read:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.markAsRead = markAsRead;
// 🔔 Create new notification (for testing)
const createNotification = async (req, res) => {
    try {
        const { userId, title, message, type, priority } = req.body;
        const notification = await Notification_1.default.create({
            userId,
            title,
            message,
            type,
            priority,
        });
        res.status(201).json(notification);
    }
    catch (err) {
        console.error("Error creating notification:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createNotification = createNotification;
