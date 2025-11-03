"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const patientController_1 = require("../controllers/patientController");
const router = express_1.default.Router();
router.get("/me", auth_1.requireAuth, patientController_1.getPatientProfile);
router.put("/me", auth_1.requireAuth, patientController_1.updatePatientProfile);
// Add these 👇
router.get("/stats", auth_1.requireAuth, patientController_1.getPatientStats);
exports.default = router;
