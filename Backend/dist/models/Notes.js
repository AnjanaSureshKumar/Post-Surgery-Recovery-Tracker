"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const noteSchema = new mongoose_1.default.Schema({
    patientId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    priority: { type: String, enum: ["normal", "high", "important"], default: "normal" }, // ✅ add "high"
    createdAt: { type: Date, default: Date.now }
});
exports.Note = mongoose_1.default.model("Note", noteSchema);
