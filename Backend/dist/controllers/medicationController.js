"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedication = createMedication;
exports.listMedications = listMedications;
exports.updateMedication = updateMedication;
exports.deleteMedication = deleteMedication;
exports.markMedicationTaken = markMedicationTaken;
const Medication_1 = require("../models/Medication");
function computeNextDoseFromTimes(times, from) {
    if (!times || times.length === 0)
        return null;
    const now = from;
    const today = new Date(now);
    for (const t of times) {
        const [h, m] = t.split(":").map((x) => parseInt(x, 10));
        if (isNaN(h) || isNaN(m))
            continue;
        const candidate = new Date(today);
        candidate.setHours(h, m, 0, 0);
        if (candidate > now)
            return candidate;
    }
    // next day's first time
    const [h, m] = times[0].split(":").map((x) => parseInt(x, 10));
    if (isNaN(h) || isNaN(m))
        return null;
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    nextDay.setHours(h, m, 0, 0);
    return nextDay;
}
async function createMedication(req, res, next) {
    try {
        const { name, dosage, frequency, startDate, endDate, notes, times, enabled } = req.body;
        if (!name || !dosage || !frequency) {
            return res.status(400).json({ success: false, message: "name, dosage, frequency are required" });
        }
        const now = new Date();
        const nextDose = computeNextDoseFromTimes(times || [], now);
        const doc = await Medication_1.Medication.create({
            userId: req.user.userId,
            name,
            dosage,
            frequency,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            notes,
            times: Array.isArray(times) ? times : [],
            enabled: enabled !== undefined ? !!enabled : true,
            nextDose,
        });
        return res.status(201).json({ success: true, data: doc });
    }
    catch (err) {
        return next(err);
    }
}
async function listMedications(req, res, next) {
    try {
        const items = await Medication_1.Medication.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: items });
    }
    catch (err) {
        return next(err);
    }
}
async function updateMedication(req, res, next) {
    try {
        const { id } = req.params;
        const update = req.body || {};
        if (update.times) {
            update.nextDose = computeNextDoseFromTimes(update.times, new Date());
        }
        const doc = await Medication_1.Medication.findOneAndUpdate({ _id: id, userId: req.user.userId }, update, { new: true });
        if (!doc)
            return res.status(404).json({ success: false, message: "Not found" });
        return res.json({ success: true, data: doc });
    }
    catch (err) {
        return next(err);
    }
}
async function deleteMedication(req, res, next) {
    try {
        const { id } = req.params;
        const doc = await Medication_1.Medication.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!doc)
            return res.status(404).json({ success: false, message: "Not found" });
        return res.json({ success: true, message: "Deleted" });
    }
    catch (err) {
        return next(err);
    }
}
async function markMedicationTaken(req, res, next) {
    try {
        const { id } = req.params;
        const med = await Medication_1.Medication.findOne({ _id: id, userId: req.user.userId });
        if (!med)
            return res.status(404).json({ success: false, message: "Not found" });
        const now = new Date();
        med.lastTaken = now;
        med.nextDose = computeNextDoseFromTimes(med.times || [], now);
        await med.save();
        return res.json({ success: true, data: med });
    }
    catch (err) {
        return next(err);
    }
}
