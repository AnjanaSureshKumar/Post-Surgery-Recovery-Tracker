"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.listAppointments = listAppointments;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
const Appointment_1 = require("../models/Appointment");
// =====================================================
//  CREATE APPOINTMENT — converts IST → UTC before saving
// =====================================================
async function createAppointment(req, res, next) {
    try {
        const { title, doctor, location, dateTime, notes } = req.body;
        if (!title || !doctor || !dateTime) {
            return res
                .status(400)
                .json({ success: false, message: "title, doctor, and dateTime are required" });
        }
        // Convert IST (frontend local) to UTC before saving
        const istDate = new Date(dateTime);
        const utcDate = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000); // subtract 5h30m
        const doc = await Appointment_1.Appointment.create({
            userId: req.user.userId,
            title,
            doctor,
            location,
            dateTime: utcDate, // stored as UTC
            notes,
        });
        return res.status(201).json({ success: true, data: doc });
    }
    catch (err) {
        return next(err);
    }
}
// =====================================================
//  LIST APPOINTMENTS — sorted by nearest upcoming
// =====================================================
async function listAppointments(req, res, next) {
    try {
        const items = await Appointment_1.Appointment.find({ userId: req.user.userId }).sort({ dateTime: 1 });
        return res.json({ success: true, data: items });
    }
    catch (err) {
        return next(err);
    }
}
// =====================================================
//  UPDATE APPOINTMENT
// =====================================================
async function updateAppointment(req, res, next) {
    try {
        const { id } = req.params;
        const update = req.body || {};
        // If dateTime is updated, convert it too
        if (update.dateTime) {
            const istDate = new Date(update.dateTime);
            update.dateTime = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);
        }
        const doc = await Appointment_1.Appointment.findOneAndUpdate({ _id: id, userId: req.user.userId }, update, { new: true });
        if (!doc)
            return res.status(404).json({ success: false, message: "Not found" });
        return res.json({ success: true, data: doc });
    }
    catch (err) {
        return next(err);
    }
}
// =====================================================
//  DELETE APPOINTMENT
// =====================================================
async function deleteAppointment(req, res, next) {
    try {
        const { id } = req.params;
        const doc = await Appointment_1.Appointment.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!doc)
            return res.status(404).json({ success: false, message: "Not found" });
        return res.json({ success: true, message: "Deleted" });
    }
    catch (err) {
        return next(err);
    }
}
