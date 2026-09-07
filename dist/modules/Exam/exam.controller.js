"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamController = void 0;
const exam_service_1 = require("./exam.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createExam = (0, catchAsync_1.default)(async (req, res) => {
    const result = await exam_service_1.ExamService.createExamInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Exam created successfully!",
        data: result,
    });
});
const getAllExams = (0, catchAsync_1.default)(async (req, res) => {
    const result = await exam_service_1.ExamService.getAllExamsFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Exams retrieved successfully!",
        data: result,
    });
});
const saveStudentMark = (0, catchAsync_1.default)(async (req, res) => {
    const result = await exam_service_1.ExamService.saveStudentMarkInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student mark saved successfully!",
        data: result,
    });
});
const getStudentMarksheet = (0, catchAsync_1.default)(async (req, res) => {
    const { examId, studentId } = req.params;
    const result = await exam_service_1.ExamService.getStudentMarksheetFromDB(examId, studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Marksheet retrieved successfully!",
        data: result,
    });
});
exports.ExamController = {
    createExam,
    getAllExams,
    saveStudentMark,
    getStudentMarksheet,
};
