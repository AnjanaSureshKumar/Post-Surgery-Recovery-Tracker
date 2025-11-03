"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecovery = createRecovery;
exports.listRecoveries = listRecoveries;
exports.getRecoveryById = getRecoveryById;
exports.deleteRecovery = deleteRecovery;
const Recovery_1 = require("../models/Recovery");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function createRecovery(req, res, next) {
    try {
        const { patientName, surgeryType, recoveryProgress, followUpDate, notes } = req.body;
        if (!patientName || !surgeryType) {
            return res.status(400).json({
                success: false,
                message: "patientName and surgeryType are required",
            });
        }
        const fileField = req.file;
        // ✅ Numeric progress entry only
        let parsedFollowUp;
        if (followUpDate) {
            const d = new Date(followUpDate);
            if (!isNaN(d.getTime()))
                parsedFollowUp = d;
        }
        const file = fileField
            ? {
                originalName: fileField.originalname,
                filePath: path_1.default.normalize(fileField.path),
                uploadDate: new Date(),
            }
            : undefined;
        const numericProgress = isNaN(Number(recoveryProgress))
            ? undefined
            : Number(recoveryProgress);
        if (numericProgress === undefined) {
            return res.status(400).json({
                success: false,
                message: "Invalid recoveryProgress — must be a number",
            });
        }
        const created = await Recovery_1.Recovery.create({
            userId: req.user.userId,
            patientName,
            surgeryType,
            recoveryProgress: numericProgress,
            followUpDate: parsedFollowUp,
            notes,
            file,
        });
        return res.status(201).json({ success: true, data: created });
    }
    catch (err) {
        return next(err);
    }
}
async function listRecoveries(req, res, next) {
    try {
        const records = await Recovery_1.Recovery.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: records });
    }
    catch (err) {
        return next(err);
    }
}
async function getRecoveryById(req, res, next) {
    try {
        const { id } = req.params;
        const rec = await Recovery_1.Recovery.findOne({ _id: id, userId: req.user.userId });
        if (!rec)
            return res.status(404).json({ success: false, message: "Record not found" });
        return res.json({ success: true, data: rec });
    }
    catch (err) {
        return next(err);
    }
}
async function deleteRecovery(req, res, next) {
    try {
        const { id } = req.params;
        const rec = await Recovery_1.Recovery.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!rec)
            return res.status(404).json({ success: false, message: "Record not found" });
        if (rec.file?.filePath) {
            try {
                await promises_1.default.unlink(rec.file.filePath);
            }
            catch (e) {
                if (e?.code !== "ENOENT")
                    throw e;
            }
        }
        return res.json({ success: true, message: "Record deleted" });
    }
    catch (err) {
        return next(err);
    }
}
