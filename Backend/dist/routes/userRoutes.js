"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middlewares/auth");
const requireAdmin_1 = require("../middlewares/requireAdmin");
const userController_1 = require("../controllers/userController");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
/* -------------------------------------------------------------------------- */
/* 🧩 Helper Function — unified validation error handler                       */
/* -------------------------------------------------------------------------- */
function validate(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}
/* -------------------------------------------------------------------------- */
/* 👑 Admin Routes — protected and validated                                   */
/* -------------------------------------------------------------------------- */
// ✅ GET all users (Admin only)
router.get("/", auth_1.requireAuth, requireAdmin_1.requireAdmin, userController_1.listUsers);
// ✅ Create a new user (Admin only)
router.post("/", auth_1.requireAuth, requireAdmin_1.requireAdmin, (0, express_validator_1.body)("name").isString().trim().notEmpty().withMessage("Name is required."), (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Invalid email format."), (0, express_validator_1.body)("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."), (0, express_validator_1.body)("role").isIn(["admin", "doctor", "patient"]).withMessage("Invalid role."), 
// Optional patient fields validation
(0, express_validator_1.body)("phone")
    .optional()
    .isString()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits."), (0, express_validator_1.body)("emergencyContact")
    .optional()
    .isString()
    .matches(/^\d{10}$/)
    .withMessage("Emergency contact must be exactly 10 digits."), validate, userController_1.createUser);
// ✅ Delete user (Admin only)
router.delete("/:id", auth_1.requireAuth, requireAdmin_1.requireAdmin, (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid user ID."), validate, userController_1.deleteUser);
/* -------------------------------------------------------------------------- */
/* 👤 Authenticated User Routes                                                */
/* -------------------------------------------------------------------------- */
// ✅ Get single user by ID (any authenticated user)
router.get("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId(), validate, userController_1.getUser);
// ✅ Update user (admin or self)
router.put("/:id", auth_1.requireAuth, (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid user ID."), validate, userController_1.updateUser);
// ✅ Update own profile (self)
router.put("/profile", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "User not authorized" });
        }
        const allowedFields = [
            "name",
            "phone",
            "address",
            "surgeryType",
            "surgeryDate",
            "surgeon",
            "hospital",
            "allergies",
            "medications",
            "emergencyContact",
        ];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        // ✅ Validation for digits in phone and emergencyContact
        if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
            return res
                .status(400)
                .json({ success: false, message: "Phone must be 10 digits." });
        }
        if (updates.emergencyContact &&
            !/^\d{10}$/.test(updates.emergencyContact)) {
            return res
                .status(400)
                .json({ success: false, message: "Emergency contact must be 10 digits." });
        }
        const user = await User_1.User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "Profile updated", user });
    }
    catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.default = router;
