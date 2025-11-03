"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const requireAdmin_1 = require("../middlewares/requireAdmin");
const assignmentController_1 = require("../controllers/assignmentController");
const router = (0, express_1.Router)();
router.get("/my", auth_1.requireAuth, assignmentController_1.getMyAssignments);
// ✅ Assign multiple patients to a doctor
router.post("/", auth_1.requireAuth, requireAdmin_1.requireAdmin, assignmentController_1.assignPatients);
// ✅ Unassign one patient
router.put("/unassign", auth_1.requireAuth, requireAdmin_1.requireAdmin, assignmentController_1.unassignPatient);
// ✅ Get all available (unassigned) patients
router.get("/available", auth_1.requireAuth, requireAdmin_1.requireAdmin, assignmentController_1.getAvailablePatients);
// ✅ Get all assigned patients for a specific doctor
router.get("/:doctorId", auth_1.requireAuth, requireAdmin_1.requireAdmin, assignmentController_1.getDoctorAssignments);
exports.default = router;
