"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middlewares/auth");
const medicationController_1 = require("../controllers/medicationController");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, (0, express_validator_1.body)("name").isString().trim().notEmpty(), (0, express_validator_1.body)("dosage").isString().trim().notEmpty(), (0, express_validator_1.body)("frequency").isString().trim().notEmpty(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, medicationController_1.createMedication)(req, res, next);
});
router.get("/", auth_1.requireAuth, medicationController_1.listMedications);
router.put("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, medicationController_1.updateMedication)(req, res, next);
});
router.patch("/:id/mark-taken", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, medicationController_1.markMedicationTaken)(req, res, next);
});
router.delete("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, medicationController_1.deleteMedication)(req, res, next);
});
exports.default = router;
