"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.post("/create-teacher", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(user_validation_1.UserValidation.createTeacherValidationSchema), user_controller_1.UserController.createTeacher);
router.post("/create-parent", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(user_validation_1.UserValidation.createParentValidationSchema), user_controller_1.UserController.createParent);
router.post("/create-student", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), (0, validateRequest_1.default)(user_validation_1.UserValidation.createStudentValidationSchema), user_controller_1.UserController.createStudent);
exports.UserRoutes = router;
