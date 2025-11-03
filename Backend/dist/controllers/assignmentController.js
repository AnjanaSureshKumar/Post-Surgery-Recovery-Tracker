"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAssignments = exports.getDoctorAssignments = exports.getAvailablePatients = exports.unassignPatient = exports.assignPatients = void 0;
const Assignment_1 = require("../models/Assignment");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const Recovery_1 = require("../models/Recovery");
const assignPatients = async (req, res) => {
    try {
        const { doctorId, patientIds } = req.body;
        console.log("📥 doctorId:", doctorId, "patients:", patientIds);
        if (!doctorId || !Array.isArray(patientIds)) {
            return res
                .status(400)
                .json({ success: false, message: "Doctor ID and patients required" });
        }
        // ✅ Skip ObjectId conversion if admin
        let doctorObjectId = null;
        if (doctorId !== "admin") {
            doctorObjectId = new mongoose_1.default.Types.ObjectId(doctorId);
        }
        const patientObjectIds = patientIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
        // ✅ Skip DB doctor lookup if admin
        if (doctorId !== "admin") {
            const doctor = await User_1.User.findById(doctorObjectId);
            if (!doctor || doctor.role !== "doctor") {
                return res
                    .status(404)
                    .json({ success: false, message: "Doctor not found" });
            }
        }
        // ✅ For admin, store null doctorId (optional)
        const assignment = await Assignment_1.Assignment.findOneAndUpdate({ doctorId: doctorObjectId || null }, { $addToSet: { patientIds: { $each: patientObjectIds } } }, { upsert: true, new: true }).populate("patientIds", "name email");
        res.status(200).json({
            success: true,
            message: "Patients assigned successfully",
            assignment,
        });
    }
    catch (err) {
        console.error("🔥 AssignPatients error:", err);
        res
            .status(500)
            .json({ success: false, message: err.message || "Server error" });
    }
};
exports.assignPatients = assignPatients;
// 🔴 Unassign patient
const unassignPatient = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;
        if (!doctorId || !patientId) {
            return res
                .status(400)
                .json({ success: false, message: "doctorId and patientId required" });
        }
        let doctorObjectId = null;
        if (doctorId !== "admin") {
            doctorObjectId = new mongoose_1.default.Types.ObjectId(doctorId);
        }
        const assignment = await Assignment_1.Assignment.findOneAndUpdate({ doctorId: doctorObjectId || null }, { $pull: { patientIds: new mongoose_1.default.Types.ObjectId(patientId) } }, { new: true }).populate("patientIds", "name email");
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "No assignments found for this doctor",
            });
        }
        res.status(200).json({
            success: true,
            message: "Patient unassigned successfully",
            assignment,
        });
    }
    catch (err) {
        console.error("🔥 Unassign error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};
exports.unassignPatient = unassignPatient;
// 🧩 Fetch available patients (not assigned anywhere)
const getAvailablePatients = async (req, res) => {
    try {
        const allAssignments = await Assignment_1.Assignment.find();
        const assignedIds = allAssignments
            .flatMap((a) => a.patientIds || [])
            .filter((id) => mongoose_1.default.Types.ObjectId.isValid(id));
        console.log("🩺 Assigned patient IDs:", assignedIds);
        const available = await User_1.User.find({
            role: "patient",
            _id: { $nin: assignedIds.length ? assignedIds : [] },
        }).select("name email");
        res.status(200).json({
            success: true,
            data: available,
        });
    }
    catch (err) {
        console.error("🔥 getAvailablePatients error:", err.message);
        res.status(500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};
exports.getAvailablePatients = getAvailablePatients;
// 🔍 Get assigned patients for a doctor
const getDoctorAssignments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const query = doctorId && mongoose_1.default.Types.ObjectId.isValid(doctorId)
            ? { doctorId: new mongoose_1.default.Types.ObjectId(doctorId) }
            : { doctorId: null };
        const record = await Assignment_1.Assignment.findOne(query).populate("patientIds", "name email surgeryType surgeryDate createdAt dateOfBirth");
        if (!record) {
            return res.json({ success: true, data: { patientIds: [] } });
        }
        const activityWeights = {
            dress: 15,
            bath: 15,
            walk: 20,
            stairs: 25,
            exercise: 25,
        };
        const patientsWithRecovery = await Promise.all(record.patientIds.map(async (patient) => {
            const recoveries = await Recovery_1.Recovery.find({
                $or: [
                    { userId: patient._id },
                    { patientId: patient._id },
                    { userId: patient._id.toString() },
                    { patientId: patient._id.toString() },
                ],
            })
                .sort({ createdAt: -1 })
                .lean();
            console.log(`🧩 ${patient.name} recoveries found:`, recoveries.length);
            let age = "N/A";
            if (patient.dateOfBirth) {
                const dob = new Date(patient.dateOfBirth);
                age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toString();
            }
            if (!recoveries.length) {
                return {
                    ...patient.toObject(),
                    painLevel: 0,
                    temperature: 98.6,
                    mobility: 0,
                    status: "stable",
                    unreadNotes: 0,
                    logEntries: 0,
                    age,
                    lastUpdated: patient.createdAt,
                    recoveryHistory: [],
                };
            }
            const temps = [];
            const painLevels = [];
            const mobilityLevels = [];
            recoveries.forEach((r) => {
                if (typeof r.recoveryProgress === "number")
                    painLevels.push(r.recoveryProgress);
                const tempMatch = r.notes?.match(/Temp:\s*([\d.]+)/i);
                if (tempMatch)
                    temps.push(parseFloat(tempMatch[1]));
                const notes = r.notes?.toLowerCase() || "";
                let total = 0;
                for (const [activity, weight] of Object.entries(activityWeights)) {
                    if (notes.includes(activity))
                        total += weight;
                }
                mobilityLevels.push(Math.min(total, 100));
            });
            const avgTemp = temps.length > 0
                ? temps.reduce((a, b) => a + b, 0) / temps.length
                : 98.6;
            const avgPain = painLevels.length > 0
                ? painLevels.reduce((a, b) => a + b, 0) / painLevels.length
                : 0;
            const avgMobility = mobilityLevels.length > 0
                ? mobilityLevels.reduce((a, b) => a + b, 0) /
                    mobilityLevels.length
                : 0;
            let status = "stable";
            if (avgPain > 7 || avgTemp > 101)
                status = "critical";
            else if (avgPain > 3 || avgTemp > 99.5)
                status = "moderate";
            const validLogs = recoveries.filter((r) => {
                const hasProgress = typeof r.recoveryProgress === "number";
                const hasNote = r.notes && r.notes.trim() !== "";
                const hasTemp = /temp[:=]\s*\d+/i.test(r.notes || "");
                return hasProgress || hasNote || hasTemp;
            });
            const recoveryHistory = recoveries.map((r) => ({
                date: r.createdAt,
                pain: r.recoveryProgress ?? 0,
                temp: parseFloat(r.notes?.match(/Temp:\s*([\d.]+)/i)?.[1] || "98.6"),
                mobility: (() => {
                    const notes = r.notes?.toLowerCase() || "";
                    let total = 0;
                    for (const [activity, weight] of Object.entries(activityWeights)) {
                        if (notes.includes(activity))
                            total += weight;
                    }
                    return Math.min(total, 100);
                })(),
            }));
            console.log(`📈 ${patient.name} recoveryHistory entries:`, recoveryHistory.length);
            return {
                ...patient.toObject(),
                painLevel: Number(avgPain.toFixed(1)),
                temperature: Number(avgTemp.toFixed(1)),
                mobility: Number(avgMobility.toFixed(1)),
                status,
                unreadNotes: recoveries.filter((r) => r.notes?.trim()).length,
                logEntries: validLogs.length,
                age,
                lastUpdated: recoveries[0]?.createdAt ?? patient.createdAt,
                recoveryHistory,
            };
        }));
        res.status(200).json({
            success: true,
            data: { ...record.toObject(), patientIds: patientsWithRecovery },
        });
    }
    catch (err) {
        console.error("🔥 getDoctorAssignments error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getDoctorAssignments = getDoctorAssignments;
// 👩‍⚕️ Doctor's own view (with auth)
const getMyAssignments = async (req, res) => {
    try {
        const doctorId = req.user?.userId;
        if (!doctorId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }
        const record = await Assignment_1.Assignment.findOne({
            doctorId: new mongoose_1.default.Types.ObjectId(doctorId),
        }).populate("patientIds", "name email surgeryType surgeryDate createdAt dateOfBirth");
        if (!record) {
            return res.json({ success: true, data: { patientIds: [] } });
        }
        const activityWeights = {
            dress: 15,
            bath: 15,
            walk: 20,
            stairs: 25,
            exercise: 25,
        };
        const patientsWithRecovery = await Promise.all(record.patientIds.map(async (patient) => {
            const recoveries = await Recovery_1.Recovery.find({
                $or: [
                    { userId: patient._id },
                    { patientId: patient._id },
                    { userId: patient._id.toString() },
                    { patientId: patient._id.toString() },
                ],
            })
                .sort({ createdAt: -1 })
                .lean();
            console.log(`🧠 Doctor view - ${patient.name}:`, recoveries.length);
            let age = "N/A";
            if (patient.dateOfBirth) {
                const dob = new Date(patient.dateOfBirth);
                age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toString();
            }
            if (!recoveries.length) {
                return {
                    ...patient.toObject(),
                    painLevel: 0,
                    temperature: 98.6,
                    mobility: 0,
                    status: "stable",
                    unreadNotes: 0,
                    logEntries: 0,
                    age,
                    lastUpdated: patient.createdAt,
                    recoveryHistory: [],
                };
            }
            const temps = [];
            const painLevels = [];
            const mobilityLevels = [];
            recoveries.forEach((r) => {
                if (typeof r.recoveryProgress === "number")
                    painLevels.push(r.recoveryProgress);
                const tempMatch = r.notes?.match(/Temp:\s*([\d.]+)/i);
                if (tempMatch)
                    temps.push(parseFloat(tempMatch[1]));
                const notes = r.notes?.toLowerCase() || "";
                let total = 0;
                for (const [activity, weight] of Object.entries(activityWeights)) {
                    if (notes.includes(activity))
                        total += weight;
                }
                mobilityLevels.push(Math.min(total, 100));
            });
            const avgTemp = temps.length > 0
                ? temps.reduce((a, b) => a + b, 0) / temps.length
                : 98.6;
            const avgPain = painLevels.length > 0
                ? painLevels.reduce((a, b) => a + b, 0) / painLevels.length
                : 0;
            const avgMobility = mobilityLevels.length > 0
                ? mobilityLevels.reduce((a, b) => a + b, 0) /
                    mobilityLevels.length
                : 0;
            let status = "stable";
            if (avgPain > 7 || avgTemp > 101)
                status = "critical";
            else if (avgPain > 3 || avgTemp > 99.5)
                status = "moderate";
            const validLogs = recoveries.filter((r) => {
                const hasProgress = typeof r.recoveryProgress === "number";
                const hasNote = r.notes && r.notes.trim() !== "";
                const hasTemp = /temp[:=]\s*\d+/i.test(r.notes || "");
                return hasProgress || hasNote || hasTemp;
            });
            const recoveryHistory = recoveries.map((r) => ({
                date: r.createdAt,
                pain: r.recoveryProgress ?? 0,
                temp: parseFloat(r.notes?.match(/Temp:\s*([\d.]+)/i)?.[1] || "98.6"),
                mobility: (() => {
                    const notes = r.notes?.toLowerCase() || "";
                    let total = 0;
                    for (const [activity, weight] of Object.entries(activityWeights)) {
                        if (notes.includes(activity))
                            total += weight;
                    }
                    return Math.min(total, 100);
                })(),
            }));
            console.log(`🧠 ${patient.name} recoveryHistory entries:`, recoveryHistory.length);
            return {
                ...patient.toObject(),
                painLevel: Number(avgPain.toFixed(1)),
                temperature: Number(avgTemp.toFixed(1)),
                mobility: Number(avgMobility.toFixed(1)),
                status,
                unreadNotes: recoveries.filter((r) => r.notes?.trim()).length,
                logEntries: validLogs.length,
                age,
                lastUpdated: recoveries[0]?.createdAt ?? patient.createdAt,
                recoveryHistory,
            };
        }));
        res.status(200).json({
            success: true,
            data: { ...record.toObject(), patientIds: patientsWithRecovery },
        });
    }
    catch (err) {
        console.error("🔥 getMyAssignments error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMyAssignments = getMyAssignments;
