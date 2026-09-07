"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const payment_controller_1 = require("./payment.controller");
const payment_validation_1 = require("./payment.validation");
const router = express_1.default.Router();
router.post('/create-invoice', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.createInvoiceValidationSchema), payment_controller_1.PaymentController.createInvoice);
router.post('/collect', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.STUDENT, client_1.Role.PARENT), (0, validateRequest_1.default)(payment_validation_1.PaymentValidation.collectPaymentValidationSchema), payment_controller_1.PaymentController.collectPayment);
router.get('/student/:studentId', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT, client_1.Role.PARENT), payment_controller_1.PaymentController.getStudentInvoices);
exports.PaymentRoutes = router;
