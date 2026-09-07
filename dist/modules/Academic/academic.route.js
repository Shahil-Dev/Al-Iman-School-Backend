"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const academic_controller_1 = require("./academic.controller");
const academic_validation_1 = require("./academic.validation");
const router = express_1.default.Router();
// Academic Year Routes
router.post("/create-year", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(academic_validation_1.AcademicValidation.createAcademicYearValidationSchema), academic_controller_1.AcademicController.createAcademicYear);
router.get("/years", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT), academic_controller_1.AcademicController.getAllAcademicYears);
// Academic Class Routes
router.post("/create-class", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(academic_validation_1.AcademicValidation.createAcademicClassValidationSchema), academic_controller_1.AcademicController.createAcademicClass);
router.get("/classes", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT), academic_controller_1.AcademicController.getAllAcademicClasses);
router.post("/create-section", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(academic_validation_1.AcademicValidation.createAcademicSectionValidationSchema), academic_controller_1.AcademicController.createAcademicSection);
// Academic Section Route
router.post("/create-section", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), academic_controller_1.AcademicController.createAcademicSection);
exports.AcademicRoutes = router;
