"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentController = void 0;
const parent_service_1 = require("./parent.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const getMyChildren = (0, catchAsync_1.default)(async (req, res) => {
    const parentUserId = req.user.id;
    const result = await parent_service_1.ParentService.getMyChildrenFromDB(parentUserId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Children list retrieved successfully!",
        data: result,
    });
});
const getChildOverview = (0, catchAsync_1.default)(async (req, res) => {
    const parentUserId = req.user.id;
    const { studentId } = req.params;
    const result = await parent_service_1.ParentService.getChildOverviewFromDB(parentUserId, studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Child academic overview retrieved successfully!",
        data: result,
    });
});
const assignStudent = (0, catchAsync_1.default)(async (req, res) => {
    const result = await parent_service_1.ParentService.assignStudentToParentInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student assigned to parent successfully!",
        data: result,
    });
});
const removeStudent = (0, catchAsync_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const result = await parent_service_1.ParentService.removeStudentFromParentInDB(studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student removed from parent successfully!",
        data: result,
    });
});
const getFullStudentAccess = (0, catchAsync_1.default)(async (req, res) => {
    const parentUserId = req.user.id;
    const { studentId } = req.params;
    const result = await parent_service_1.ParentService.getFullStudentAccessForParentInDB(parentUserId, studentId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Full student control panel data retrieved successfully!",
        data: result,
    });
});
exports.ParentController = {
    getMyChildren,
    getChildOverview,
    assignStudent,
    removeStudent,
    getFullStudentAccess,
};
