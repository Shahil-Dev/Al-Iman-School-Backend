"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const attendance_controller_1 = require("./attendance.controller");
const attendance_validation_1 = require("./attendance.validation");
const router = express_1.default.Router();
router.post("/", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER), (0, validateRequest_1.default)(attendance_validation_1.AttendanceValidation.createAttendanceValidationSchema), attendance_controller_1.AttendanceController.takeAttendance);
router.get("/", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER), attendance_controller_1.AttendanceController.getSectionAttendance);
router.get("/summary/:studentId", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT), attendance_controller_1.AttendanceController.getStudentAttendanceSummary);
exports.AttendanceRoutes = router;
