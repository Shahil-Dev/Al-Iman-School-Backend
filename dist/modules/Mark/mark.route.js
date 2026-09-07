"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const mark_controller_1 = require("./mark.controller");
const mark_validation_1 = require("./mark.validation");
const router = express_1.default.Router();
router.post('/save-mark', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER), (0, validateRequest_1.default)(mark_validation_1.MarkValidation.saveMarkValidationSchema), mark_controller_1.MarkController.saveMark);
router.get('/marksheet/:examId/:studentId', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT), mark_controller_1.MarkController.getStudentMarksheet);
exports.MarkRoutes = router;
