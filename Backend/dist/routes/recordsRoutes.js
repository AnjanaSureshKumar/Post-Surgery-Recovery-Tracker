"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const recordsController_1 = require("../controllers/recordsController");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get("/count", auth_1.requireAuth, recordsController_1.getReportCount);
// 🧾 Upload new record
router.post("/", auth_1.requireAuth, recordsController_1.upload.single("fileUpload"), recordsController_1.createRecord);
// 🧾 Get all records for logged-in user
router.get("/", auth_1.requireAuth, recordsController_1.listRecords);
// 🧾 Get records by patientId (doctor view)
router.get("/patient/:patientId", auth_1.requireAuth, recordsController_1.getRecordsByPatientId);
// 🧾 Get specific record by ID
router.get("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, message: "Invalid id", errors: errors.array() });
    return (0, recordsController_1.getRecordById)(req, res, next);
});
// 🧾 Delete a record
router.delete("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, message: "Invalid id", errors: errors.array() });
    return (0, recordsController_1.deleteRecord)(req, res, next);
});
// ✅ Download route
router.get("/download/:recordId", auth_1.requireAuth, recordsController_1.downloadRecord);
exports.default = router;
