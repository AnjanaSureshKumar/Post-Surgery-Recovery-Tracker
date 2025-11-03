"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = void 0;
exports.listUsers = listUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const Assignment_1 = require("../models/Assignment");
const Medication_1 = require("../models/Medication");
const Notification_1 = __importDefault(require("../models/Notification")); // ✅ default export
const Record_1 = require("../models/Record");
const Recovery_1 = require("../models/Recovery");
// ✅ GET: List all users (excluding passwords)
async function listUsers(req, res, next) {
    try {
        const users = await User_1.User.find().select("-password");
        return res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        next(err);
    }
}
// ✅ GET: Fetch a single user by ID
async function getUser(req, res, next) {
    try {
        const user = await User_1.User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
// ✅ POST: Create a new user (includes dateOfBirth)
async function createUser(req, res, next) {
    try {
        const { name, email, password, role, phone, address, surgeryType, surgeryDate, surgeon, hospital, allergies, medications, emergencyContact, dateOfBirth, // ✅ Added this line
         } = req.body;
        // Check for existing email
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }
        // Prevent clients from creating admin accounts directly
        const safeRole = role === "admin" ? "patient" : role;
        // ✅ Optional: Validate dateOfBirth format if provided
        if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid date format for dateOfBirth" });
        }
        // Create new user
        const user = await User_1.User.create({
            name,
            email,
            password,
            role: safeRole,
            phone,
            address,
            surgeryType,
            surgeryDate,
            surgeon,
            hospital,
            allergies,
            medications,
            emergencyContact,
            dateOfBirth, // ✅ Save DOB
        });
        return res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
// ✅ PUT/PATCH: Update user details safely (includes DOB)
async function updateUser(req, res, next) {
    try {
        const { password, ...updates } = req.body; // prevent overwriting password directly
        // ✅ Validate DOB if present
        if (updates.dateOfBirth && isNaN(Date.parse(updates.dateOfBirth))) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid date format for dateOfBirth" });
        }
        const user = await User_1.User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true, // ✅ ensure Mongoose validation still applies
        }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
// ✅ DELETE: Remove user by ID
// ✅ DELETE: Remove user by ID
// ✅ DELETE: Remove user by ID
const deleteUser = async (req, res) => {
    try {
        const userIdStr = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(userIdStr)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const userIdObj = new mongoose_1.default.Types.ObjectId(userIdStr);
        // Check if user exists first
        const user = await User_1.User.findById(userIdStr);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log(`🧹 Deleting all data for user: ${userIdStr} (${user.name})`);
        // 🩺 Delete all dependent data
        const deletedAppointments = await Appointment_1.Appointment.deleteMany({
            $or: [{ userId: userIdStr }, { userId: userIdObj }],
        });
        const deletedAssignments = await Assignment_1.Assignment.deleteMany({
            $or: [{ patientIds: userIdStr }, { patientIds: userIdObj }],
        });
        const deletedMedications = await Medication_1.Medication.deleteMany({
            $or: [{ userId: userIdStr }, { userId: userIdObj }],
        });
        const deletedNotifications = await Notification_1.default.deleteMany({
            $or: [{ userId: userIdStr }, { userId: userIdObj }],
        });
        const deletedRecords = await Record_1.Record.deleteMany({
            $or: [{ userId: userIdStr }, { userId: userIdObj }],
        });
        const deletedRecoveries = await Recovery_1.Recovery.deleteMany({
            $or: [{ userId: userIdStr }, { userId: userIdObj }],
        });
        // 🧍 Finally delete the user itself
        await User_1.User.findByIdAndDelete(userIdStr);
        console.log(`✅ User ${userIdStr} and all related data deleted successfully`);
        return res.status(200).json({
            success: true,
            message: "User and all related data deleted successfully.",
            deletedCounts: {
                appointments: deletedAppointments.deletedCount,
                assignments: deletedAssignments.deletedCount,
                medications: deletedMedications.deletedCount,
                notifications: deletedNotifications.deletedCount,
                records: deletedRecords.deletedCount,
                recoveries: deletedRecoveries.deletedCount,
            },
        });
    }
    catch (err) {
        console.error("❌ Error deleting user and related data:", err);
        return res.status(500).json({
            success: false,
            message: "Error deleting user and related data",
        });
    }
};
exports.deleteUser = deleteUser;
