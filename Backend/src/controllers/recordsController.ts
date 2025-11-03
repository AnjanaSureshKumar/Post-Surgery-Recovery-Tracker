import { Request, Response, NextFunction } from "express";
import { Record } from "../models/Record";
import { AuthRequest } from "../middlewares/auth";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import * as fsSync from "fs"; 

// 🗂️ Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
export const upload = multer({ storage });

// 🧾 Create record (upload file)
export async function createRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const { patientName, surgeryType, notes } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const record = await Record.create({
      userId: req.user!.userId, // Patient who uploaded
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
  } catch (err) {
    console.error("❌ Upload error:", err);
    return next(err);
  }
}

// 🧾 Get all records for logged-in user (patient)
export async function listRecords(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const records = await Record.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: records });
  } catch (err) {
    return next(err);
  }
}

// 🧾 Get records for specific patient (for doctor view)
export const getRecordsByPatientId = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    console.log("📥 Fetching records for patient:", patientId);
    const records = await Record.find({ userId: patientId });
    console.log("📤 Found records:", records.length);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("❌ getRecordsByPatientId failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🧾 Get single record by ID
export async function getRecordById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const record = await Record.findOne({ _id: id, userId: req.user!.userId });
    if (!record)
      return res.status(404).json({ success: false, message: "Report not found" });
    return res.json({ success: true, data: record });
  } catch (err) {
    return next(err);
  }
}

// 🧾 Delete record
export async function deleteRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const record = await Record.findOneAndDelete({ _id: id, userId: req.user!.userId });
    if (!record)
      return res.status(404).json({ success: false, message: "Report not found" });

    if (record.file?.filePath) {
      try {
        await fs.unlink(record.file.filePath);
      } catch (e: any) {
        if (e?.code !== "ENOENT") throw e;
      }
    }

    return res.json({ success: true, message: "Report deleted" });
  } catch (err) {
    return next(err);
  }
}
export const downloadRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const record = await Record.findById(req.params.recordId);
    if (!record || !record.file?.filePath) {
      res.status(404).json({ success: false, message: "File not found" });
      return;
    }

    const filePath = path.resolve(record.file.filePath);

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
  } catch (err) {
    console.error("❌ Download error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};
