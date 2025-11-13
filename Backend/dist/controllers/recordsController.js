"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadRecord = exports.getRecordsByPatientId = exports.upload = void 0;
exports.createRecord = createRecord;
exports.listRecords = listRecords;
exports.getRecordById = getRecordById;
exports.deleteRecord = deleteRecord;
exports.getReportCount = getReportCount;
const Record_1 = require("../models/Record");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fsSync = __importStar(require("fs"));
// 🗂️ Multer setup
const storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: (_, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
exports.upload = (0, multer_1.default)({ storage });
// 🧾 Create record (upload file)
async function createRecord(req, res, next) {
    try {
        const file = req.file;
        const { patientName, surgeryType, notes } = req.body;
        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const record = await Record_1.Record.create({
            userId: req.user.userId, // Patient who uploaded
            patientName,
            surgeryType,
            notes,
            file: {
                originalName: file.originalname,
                filePath: `uploads/${file.filename}`,
                uploadDate: new Date(),
            },
        });
        res.json({ success: true, data: record });
    }
    catch (err) {
        console.error("❌ Upload error:", err);
        return next(err);
    }
}
// 🧾 Get all records for logged-in user (patient)
async function listRecords(req, res, next) {
    try {
        const records = await Record_1.Record.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: records });
    }
    catch (err) {
        return next(err);
    }
}
// 🧾 Get records for specific patient (for doctor view)
const getRecordsByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;
        console.log("📥 Fetching records for patient:", patientId);
        const records = await Record_1.Record.find({ userId: patientId });
        console.log("📤 Found records:", records.length);
        res.json({ success: true, data: records });
    }
    catch (error) {
        console.error("❌ getRecordsByPatientId failed:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getRecordsByPatientId = getRecordsByPatientId;
// 🧾 Get single record by ID
async function getRecordById(req, res, next) {
    try {
        const { id } = req.params;
        const record = await Record_1.Record.findOne({ _id: id, userId: req.user.userId });
        if (!record)
            return res.status(404).json({ success: false, message: "Report not found" });
        return res.json({ success: true, data: record });
    }
    catch (err) {
        return next(err);
    }
}
// 🧾 Delete record
async function deleteRecord(req, res, next) {
    try {
        const { id } = req.params;
        const record = await Record_1.Record.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!record)
            return res.status(404).json({ success: false, message: "Report not found" });
        if (record.file?.filePath) {
            try {
                await promises_1.default.unlink(record.file.filePath);
            }
            catch (e) {
                if (e?.code !== "ENOENT")
                    throw e;
            }
        }
        return res.json({ success: true, message: "Report deleted" });
    }
    catch (err) {
        return next(err);
    }
}
const downloadRecord = async (req, res) => {
    try {
        const record = await Record_1.Record.findById(req.params.recordId);
        if (!record || !record.file?.filePath) {
            res.status(404).json({ success: false, message: "File not found" });
            return;
        }
        const filePath = path_1.default.resolve(record.file.filePath);
        // ✅ Use fsSync.existsSync because fs (promises) doesn’t have existsSync
        if (!fsSync.existsSync(filePath)) {
            res.status(404).json({ success: false, message: "File missing on server" });
            return;
        }
        const fileName = record.file.originalName || "report.pdf";
        // ✅ Provide callback to satisfy TypeScript and handle errors
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("❌ Error while sending file:", err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: "Failed to download file" });
                }
            }
        });
    }
    catch (err) {
        console.error("❌ Download error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
};
exports.downloadRecord = downloadRecord;
// 🧮 Get report count for logged-in user
async function getReportCount(req, res, next) {
    try {
        const count = await Record_1.Record.countDocuments({ userId: req.user.userId });
        return res.json({ success: true, data: { totalReports: count } });
    }
    catch (err) {
        console.error("❌ Error fetching report count:", err);
        return next(err);
    }
}
