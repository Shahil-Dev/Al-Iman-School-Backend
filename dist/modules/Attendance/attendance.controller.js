"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("./attendance.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const takeAttendance = (0, catchAsync_1.default)(async (req, res) => {
    const result = await attendance_service_1.AttendanceService.takeAttendanceIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Attendance submitted successfully!",
        data: result,
    });
});
const getSectionAttendance = (0, catchAsync_1.default)(async (req, res) => {
    const { classId, sectionId, date } = req.query;
    const result = await attendance_service_1.AttendanceService.getSectionAttendanceFromDB(classId, sectionId, date);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Attendance list retrieved successfully!",
        data: result,
    });
});
const getStudentAttendanceSummary = (0, catchAsync_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const result = await attendance_service_1.AttendanceService.getStudentAttendanceSummaryFromDB(studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student attendance summary retrieved successfully!",
        data: result,
    });
});
exports.AttendanceController = {
    takeAttendance,
    getSectionAttendance,
    getStudentAttendanceSummary,
};
