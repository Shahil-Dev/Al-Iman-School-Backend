"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkController = void 0;
const mark_service_1 = require("./mark.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const saveMark = (0, catchAsync_1.default)(async (req, res) => {
    const result = await mark_service_1.MarkService.saveMarkIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Mark saved successfully!",
        data: result,
    });
});
const getStudentMarksheet = (0, catchAsync_1.default)(async (req, res) => {
    const { examId, studentId } = req.params;
    const result = await mark_service_1.MarkService.getStudentMarksheetFromDB(examId, studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student marksheet retrieved successfully!",
        data: result,
    });
});
exports.MarkController = {
    saveMark,
    getStudentMarksheet,
};
