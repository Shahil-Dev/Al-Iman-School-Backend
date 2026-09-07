"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const document_service_1 = require("./document.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const getStudentIdCard = (0, catchAsync_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const result = await document_service_1.DocumentService.getStudentIdCardDataFromDB(studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student ID card data generated successfully!",
        data: result,
    });
});
const getTestimonial = (0, catchAsync_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const result = await document_service_1.DocumentService.getTestimonialDataFromDB(studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Testimonial data generated successfully!",
        data: result,
    });
});
exports.DocumentController = {
    getStudentIdCard,
    getTestimonial,
};
