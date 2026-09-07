"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const exam_controller_1 = require("./exam.controller");
const router = express_1.default.Router();
router.post("/create-exam", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), exam_controller_1.ExamController.createExam);
router.get("/", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER), exam_controller_1.ExamController.getAllExams);
router.post("/save-mark", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER), exam_controller_1.ExamController.saveStudentMark);
router.get("/marksheet/:examId/:studentId", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER, client_1.Role.STUDENT), exam_controller_1.ExamController.getStudentMarksheet);
exports.ExamRoutes = router;
