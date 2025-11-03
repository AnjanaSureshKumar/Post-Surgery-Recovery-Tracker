"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.post("/login", adminController_1.adminLogin);
router.post("/create", auth_1.requireAuth, adminController_1.createAccount);
router.get("/users", auth_1.requireAuth, adminController_1.getAllUsers);
router.put("/users/:id", auth_1.requireAuth, adminController_1.updateUser);
router.delete("/users/:id", auth_1.requireAuth, adminController_1.deleteUser);
router.post("/users/:id/details", auth_1.requireAuth, adminController_1.addPatientDetails);
router.get("/users/:id/details", auth_1.requireAuth, adminController_1.getPatientDetails);
router.put("/users/:id/details", auth_1.requireAuth, adminController_1.updatePatientDetails);
exports.default = router;
