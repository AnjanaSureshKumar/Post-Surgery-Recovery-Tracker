"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const notesController_1 = require("../controllers/notesController");
const router = express_1.default.Router();
router.post("/", auth_1.requireAuth, notesController_1.addNote);
router.get("/:patientId", auth_1.requireAuth, notesController_1.getNotesByPatient);
router.patch("/:id/pin", auth_1.requireAuth, notesController_1.toggleNotePin);
exports.default = router;
