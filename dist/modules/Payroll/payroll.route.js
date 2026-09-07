"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const payroll_controller_1 = require("./payroll.controller");
const router = express_1.default.Router();
router.post('/create', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), payroll_controller_1.PayrollController.createPayroll);
router.get('/', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), payroll_controller_1.PayrollController.getPayrolls);
router.patch('/pay/:id', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), payroll_controller_1.PayrollController.markAsPaid);
exports.PayrollRoutes = router;
