"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const payroll_service_1 = require("./payroll.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createPayroll = (0, catchAsync_1.default)(async (req, res) => {
    const result = await payroll_service_1.PayrollService.createPayrollInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Teacher payroll generated successfully!',
        data: result,
    });
});
const getPayrolls = (0, catchAsync_1.default)(async (req, res) => {
    const { month, year } = req.query;
    const result = await payroll_service_1.PayrollService.getPayrollsFromDB(month, year ? Number(year) : undefined);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Payroll list retrieved successfully!',
        data: result,
    });
});
const markAsPaid = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await payroll_service_1.PayrollService.markPayrollAsPaidInDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Payroll marked as PAID successfully!',
        data: result,
    });
});
exports.PayrollController = {
    createPayroll,
    getPayrolls,
    markAsPaid,
};
