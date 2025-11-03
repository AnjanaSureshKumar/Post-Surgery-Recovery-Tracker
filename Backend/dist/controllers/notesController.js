"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleNotePin = exports.getNotesByPatient = exports.addNote = void 0;
const Notes_1 = require("../models/Notes");
const addNote = async (req, res) => {
    try {
        const { patientId, content, pinned, priority } = req.body;
        const doctorId = req.user?.userId;
        const note = await Notes_1.Note.create({
            doctorId,
            patientId,
            content,
            pinned,
            priority,
        });
        res.status(201).json({ success: true, data: note });
    }
    catch (err) {
        console.error("❌ Error adding note:", err);
        res.status(500).json({ success: false, message: "Failed to add note" });
    }
};
exports.addNote = addNote;
const getNotesByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const notes = await Notes_1.Note.find({ patientId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: notes });
    }
    catch (err) {
        console.error("Error fetching notes:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getNotesByPatient = getNotesByPatient;
// ✅ toggle pinning
const toggleNotePin = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Notes_1.Note.findById(id);
        if (!note)
            return res.status(404).json({ success: false, message: "Note not found" });
        note.pinned = !note.pinned;
        await note.save();
        res.json({ success: true, data: note });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to toggle pin" });
    }
};
exports.toggleNotePin = toggleNotePin;
