"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Notification_js_1 = __importDefault(require("../models/Notification.js"));
const Appointment_js_1 = require("../models/Appointment.js");
const User_js_1 = require("../models/User.js");
const Medication_js_1 = require("../models/Medication.js");
// =====================================================
// 1️⃣ Appointment Reminder (Every 15 minutes)
// =====================================================
node_cron_1.default.schedule("*/1 * * * *", // every minute
async () => {
    console.log("⏰ Checking for upcoming appointments...");
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        // 🔍 Debugging
        console.log("Checking between:", now.toISOString(), "and", oneHourLater.toISOString());
        const upcomingAppointments = await Appointment_js_1.Appointment.find({
            dateTime: {
                $gte: new Date(now.toISOString()),
                $lte: new Date(oneHourLater.toISOString()),
            },
        });
        console.log(`🗓 Found ${upcomingAppointments.length} upcoming appointments.`);
        for (const appt of upcomingAppointments) {
            const exists = await Notification_js_1.default.findOne({
                userId: appt.userId,
                type: "appointment",
                time: { $gte: new Date(now.getTime() - 60 * 60 * 1000) },
            });
            if (!exists) {
                await Notification_js_1.default.create({
                    userId: appt.userId.toString(),
                    title: "Appointment Reminder",
                    message: `You have an appointment "${appt.title}" with Dr. ${appt.doctor} at ${new Date(appt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
                    type: "appointment",
                    priority: "important",
                    time: new Date(),
                });
                console.log(`🔔 Reminder created for user: ${appt.userId}`);
            }
            else {
                console.log(`⏭️ Skipping duplicate reminder for ${appt.title}`);
            }
        }
    }
    catch (err) {
        console.error("❌ Scheduler error:", err);
    }
}, { timezone: "Asia/Kolkata" } // ensure correct local time
);
// =====================================================
// 2️⃣ Medication Reminder (Every minute check)
// =====================================================
// =====================================================
// 2️⃣ Medication Reminder (Every minute check)
// =====================================================
node_cron_1.default.schedule("*/1 * * * *", async () => {
    console.log("💊 Checking for due medications...");
    const now = new Date();
    const upcomingTime = new Date(now.getTime() + 10 * 60 * 1000);
    try {
        const dueMeds = await Medication_js_1.Medication.find({
            nextDose: { $lte: upcomingTime },
            enabled: true,
        });
        console.log(`🧾 Found ${dueMeds.length} due medications.`);
        for (const med of dueMeds) {
            const userId = med.userId?.toString();
            console.log(`➡️ Processing ${med.name} for user ${userId}`);
            const exists = await Notification_js_1.default.findOne({
                userId,
                type: "medication",
                message: { $regex: med.name, $options: "i" },
                time: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }, // prevent duplicate within 1 hr
            });
            if (!exists) {
                try {
                    const notification = await Notification_js_1.default.create({
                        userId,
                        title: "Medication Reminder",
                        message: `💊 Time to take your medication: ${med.name} (${med.dosage}).`,
                        type: "medication",
                        priority: "important",
                        time: new Date(),
                    });
                    console.log(`✅ Notification saved for ${userId}: ${notification._id}`);
                    // Update nextDose based on frequency   
                    const freq = med.frequency.toLowerCase();
                    if (freq.includes("twice") && freq.includes("daily")) {
                        // Every 12 hours
                        med.nextDose = new Date(now.getTime() + 12 * 60 * 60 * 1000);
                    }
                    else if (freq.includes("thrice") && freq.includes("daily")) {
                        // Every 8 hours
                        med.nextDose = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                    }
                    else if (freq.includes("every 4")) {
                        med.nextDose = new Date(now.getTime() + 4 * 60 * 60 * 1000);
                    }
                    else if (freq.includes("every 6")) {
                        med.nextDose = new Date(now.getTime() + 6 * 60 * 60 * 1000);
                    }
                    else if (freq.includes("every 8")) {
                        med.nextDose = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                    }
                    else if (freq.includes("once") && freq.includes("daily")) {
                        // Explicit once daily
                        med.nextDose = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    }
                    else if (freq.includes("daily")) {
                        // Default daily if unspecified
                        med.nextDose = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    }
                    else {
                        // Default to 24 hours if no recognizable pattern
                        med.nextDose = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    }
                    await med.save();
                }
                catch (error) {
                    console.error(`❌ Failed to create notification for ${userId}:`);
                }
            }
            else {
                console.log(`⏭️ Skipping duplicate reminder for ${med.name}`);
            }
        }
    }
    catch (err) {
        console.error("🚨 Error in medication scheduler:", err);
    }
});
// =====================================================
// 3️⃣ Daily Log Reminder (9 AM)
// =====================================================
node_cron_1.default.schedule("5 18 * * *", async () => {
    console.log("📘 Sending daily log reminders...");
    const users = await User_js_1.User.find();
    for (const user of users) {
        await Notification_js_1.default.create({
            userId: user._id,
            title: "Daily Log Entry",
            message: "Don't forget to log your recovery progress for today.",
            type: "reminder",
            priority: "normal",
            time: new Date(),
        });
    }
});
// =====================================================
// 4️⃣ Weekly Photo Reminder (Monday 10 AM)
// =====================================================
node_cron_1.default.schedule("5 18 * * *", async () => {
    console.log("📸 Sending weekly photo reminder...");
    const users = await User_js_1.User.find();
    for (const user of users) {
        await Notification_js_1.default.create({
            userId: user._id,
            title: "Upload Weekly Progress Photo",
            message: "Please upload a photo of your wound for this week's assessment.",
            type: "upload",
            priority: "normal",
            time: new Date(),
        });
    }
});
// =====================================================
// 5️⃣ Pain Alert Check (Daily 8 AM placeholder)
// =====================================================
node_cron_1.default.schedule("5 18 * * *", async () => {
    console.log("⚠️ Checking for pain level alerts...");
});
console.log("✅ Scheduler initialized successfully");
