import { Request, Response, NextFunction } from "express";
import { Recovery } from "../models/Recovery";
import fs from "fs/promises";
import path from "path";
import { AuthRequest } from "../middlewares/auth";

export async function createRecovery(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { patientName, surgeryType, recoveryProgress, followUpDate, notes } = req.body;

    if (!patientName || !surgeryType) {
      return res.status(400).json({
        success: false,
        message: "patientName and surgeryType are required",
      });
    }

    const fileField = (req as any).file as Express.Multer.File | undefined;

    // ✅ Numeric progress entry only
    let parsedFollowUp: Date | undefined;
    if (followUpDate) {
      const d = new Date(followUpDate);
      if (!isNaN(d.getTime())) parsedFollowUp = d;
    }

    const file = fileField
      ? {
          originalName: fileField.originalname,
          filePath: path.normalize(fileField.path),
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

    const created = await Recovery.create({
      userId: req.user!.userId,
      patientName,
      surgeryType,
      recoveryProgress: numericProgress,
      followUpDate: parsedFollowUp,
      notes,
      file,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    return next(err);
  }
}

export async function listRecoveries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const records = await Recovery.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: records });
  } catch (err) {
    return next(err);
  }
}

export async function getRecoveryById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as any;
    const rec = await Recovery.findOne({ _id: id, userId: req.user!.userId });
    if (!rec) return res.status(404).json({ success: false, message: "Record not found" });
    return res.json({ success: true, data: rec });
  } catch (err) {
    return next(err);
  }
}

export async function deleteRecovery(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as any;
    const rec = await Recovery.findOneAndDelete({ _id: id, userId: req.user!.userId });
    if (!rec) return res.status(404).json({ success: false, message: "Record not found" });

    if (rec.file?.filePath) {
      try {
        await fs.unlink(rec.file.filePath);
      } catch (e: any) {
        if (e?.code !== "ENOENT") throw e;
      }
    }

    return res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    return next(err);
  }
}
