import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface FileMetadata {
  originalName: string;
  filePath: string;
  uploadDate: Date;
}

export interface RecoveryAttrs {
  userId: Types.ObjectId;
  patientName: string;
  surgeryType: string;
  recoveryProgress: number; // ✅ strictly numeric now
  followUpDate?: Date;
  notes?: string;
  file?: FileMetadata; // optional attachment
  createdAt?: Date;
}

export interface RecoveryDoc extends Document, RecoveryAttrs {}

const FileSchema = new Schema<FileMetadata>({
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const RecoverySchema = new Schema<RecoveryDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    surgeryType: { type: String, required: true, trim: true },
    recoveryProgress: { type: Number, required: true }, // ✅ numeric only
    followUpDate: { type: Date },
    notes: { type: String, default: "" },
    file: { type: FileSchema },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Recovery: Model<RecoveryDoc> =
  mongoose.models.Recovery || mongoose.model<RecoveryDoc>("Recovery", RecoverySchema);
