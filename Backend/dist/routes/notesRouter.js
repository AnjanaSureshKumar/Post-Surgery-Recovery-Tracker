"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notes_1 = require("../models/Notes");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// 🟢 Get notes by patient
router.get("/patient/:patientId", auth_1.requireAuth, async (req, res) => {
    try {
        const notes = await Notes_1.Note.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
        res.json({ success: true, data: notes });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Error fetching notes" });
    }
});
// 🟢 Add new note
router.post("/", auth_1.requireAuth, async (req, res) => {
    try {
        const { patientId, doctorId, content, pinned, priority } = req.body;
        const note = await Notes_1.Note.create({ patientId, doctorId, content, pinned, priority });
        res.json({ success: true, data: note });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Error adding note" });
    }
});
exports.default = router;
