"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectController = void 0;
const subject_service_1 = require("./subject.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createSubject = (0, catchAsync_1.default)(async (req, res) => {
    const result = await subject_service_1.SubjectService.createSubjectIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Subject created successfully!",
        data: result,
    });
});
const getAllSubjects = (0, catchAsync_1.default)(async (req, res) => {
    const result = await subject_service_1.SubjectService.getAllSubjectsFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subjects retrieved successfully!",
        data: result,
    });
});
const getSubjectsByClass = (0, catchAsync_1.default)(async (req, res) => {
    const { classId } = req.params;
    const result = await subject_service_1.SubjectService.getSubjectsByClassFromDB(classId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Class subjects retrieved successfully!",
        data: result,
    });
});
const updateSubject = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await subject_service_1.SubjectService.updateSubjectIntoDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Subject updated successfully!",
        data: result,
    });
});
exports.SubjectController = {
    createSubject,
    getAllSubjects,
    getSubjectsByClass,
    updateSubject,
};
