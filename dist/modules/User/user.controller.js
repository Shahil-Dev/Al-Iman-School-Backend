"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// 1. Create Teacher Profile
const createTeacher = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.createTeacherIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Teacher created successfully!",
        data: result,
    });
});
// 2. Create Student
const createStudent = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.createStudentIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Student created successfully!",
        data: result,
    });
});
// 3. Create Parent Profile
const createParent = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.createParentIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Parent profile created successfully!",
        data: result,
    });
});
exports.UserController = {
    createTeacher,
    createStudent,
    createParent,
};
