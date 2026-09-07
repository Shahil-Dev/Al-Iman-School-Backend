"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const subject_controller_1 = require("./subject.controller");
const subject_validation_1 = require("./subject.validation");
const router = express_1.default.Router();
router.post("/", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(subject_validation_1.SubjectValidation.createSubjectValidationSchema), subject_controller_1.SubjectController.createSubject);
router.get("/", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT, client_1.Role.ACCOUNTS), subject_controller_1.SubjectController.getAllSubjects);
router.get("/class/:classId", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT, client_1.Role.ACCOUNTS), subject_controller_1.SubjectController.getSubjectsByClass);
router.patch("/:id", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(subject_validation_1.SubjectValidation.updateSubjectValidationSchema), subject_controller_1.SubjectController.updateSubject);
exports.SubjectRoutes = router;
