"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const createInvoice = (0, catchAsync_1.default)(async (req, res) => {
    const result = await payment_service_1.PaymentService.createInvoiceIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Invoice generated successfully!',
        data: result,
    });
});
const collectPayment = (0, catchAsync_1.default)(async (req, res) => {
    const result = await payment_service_1.PaymentService.processPaymentInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Payment recorded successfully!',
        data: result,
    });
});
const getStudentInvoices = (0, catchAsync_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const result = await payment_service_1.PaymentService.getStudentInvoicesFromDB(studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Invoices fetched successfully!',
        data: result,
    });
});
exports.PaymentController = {
    createInvoice,
    collectPayment,
    getStudentInvoices,
};
