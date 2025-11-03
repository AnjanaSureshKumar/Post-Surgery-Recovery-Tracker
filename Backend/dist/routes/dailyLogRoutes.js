"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const dailyLogController_1 = require("../controllers/dailyLogController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET: list all logs for the user
router.get("/", auth_1.requireAuth, dailyLogController_1.listDailyLogs);
// POST: add a new daily log entry
router.post("/", auth_1.requireAuth, (0, express_validator_1.body)("temperature").isNumeric(), (0, express_validator_1.body)("mobility").isNumeric(), (0, express_validator_1.body)("painLevel").isNumeric(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return (0, dailyLogController_1.createDailyLog)(req, res);
});
exports.default = router;
