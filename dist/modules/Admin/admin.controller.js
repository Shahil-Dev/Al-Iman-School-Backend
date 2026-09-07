"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const getDashboardAnalytics = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getDashboardAnalyticsFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard analytics retrieved successfully!",
        data: result,
    });
});
const getStudentDueReport = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admin_service_1.AdminService.getStudentDueReportFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Student due fee report retrieved successfully!",
        data: result,
    });
});
const resetUserPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { userId, newPassword } = req.body;
    const result = await admin_service_1.AdminService.resetUserPasswordInDB(userId, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: null,
    });
});
const toggleReviewApproval = (0, catchAsync_1.default)(async (req, res) => {
    const { reviewId } = req.params;
    const { isApproved } = req.body;
    const result = await admin_service_1.AdminService.toggleReviewApprovalInDB(reviewId, isApproved);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Review ${isApproved ? "approved" : "unapproved"} successfully!`,
        data: result,
    });
});
exports.AdminController = {
    getDashboardAnalytics,
    getStudentDueReport,
    toggleReviewApproval,
    resetUserPassword,
};
