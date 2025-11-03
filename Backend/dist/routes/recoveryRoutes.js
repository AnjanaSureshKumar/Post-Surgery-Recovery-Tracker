"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const upload_1 = require("../middlewares/upload");
const recoveryController_1 = require("../controllers/recoveryController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, upload_1.upload.single("fileUpload"), (0, express_validator_1.body)("patientName").isString().trim().notEmpty(), (0, express_validator_1.body)("surgeryType").isString().trim().notEmpty(), (0, express_validator_1.body)("recoveryProgress").exists(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return (0, recoveryController_1.createRecovery)(req, res, next);
});
router.get("/", auth_1.requireAuth, recoveryController_1.listRecoveries);
router.get("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Invalid id", errors: errors.array() });
    }
    return (0, recoveryController_1.getRecoveryById)(req, res, next);
});
router.delete("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Invalid id", errors: errors.array() });
    }
    return (0, recoveryController_1.deleteRecovery)(req, res, next);
});
exports.default = router;
