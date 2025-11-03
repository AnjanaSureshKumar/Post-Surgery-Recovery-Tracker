"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middlewares/auth");
const appointmentController_1 = require("../controllers/appointmentController");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, (0, express_validator_1.body)("title").isString().trim().notEmpty(), (0, express_validator_1.body)("doctor").isString().trim().notEmpty(), (0, express_validator_1.body)("dateTime").isISO8601(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, appointmentController_1.createAppointment)(req, res, next);
});
router.get("/", auth_1.requireAuth, appointmentController_1.listAppointments);
router.put("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, appointmentController_1.updateAppointment)(req, res, next);
});
router.delete("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });
    return (0, appointmentController_1.deleteAppointment)(req, res, next);
});
exports.default = router;
