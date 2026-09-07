"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const admission_controller_1 = require("./admission.controller");
const admission_validation_1 = require("./admission.validation");
const router = express_1.default.Router();
// Public Routes (Open for prospective students)
router.post('/apply', (0, validateRequest_1.default)(admission_validation_1.AdmissionValidation.createAdmissionValidationSchema), admission_controller_1.AdmissionController.submitAdmission);
router.get('/track/:identifier', admission_controller_1.AdmissionController.trackAdmissionStatus);
// Admin Routes (Super Admin Access)
router.get('/', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), admission_controller_1.AdmissionController.getAllApplications);
router.patch('/approve/:id', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), admission_controller_1.AdmissionController.approveAdmission);
router.patch('/reject/:id', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), (0, validateRequest_1.default)(admission_validation_1.AdmissionValidation.rejectAdmissionValidationSchema), admission_controller_1.AdmissionController.rejectAdmission);
exports.AdmissionRoutes = router;
