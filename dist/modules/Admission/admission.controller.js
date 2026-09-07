"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionController = void 0;
const admission_service_1 = require("./admission.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const submitAdmission = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admission_service_1.AdmissionService.submitAdmissionIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Admission form submitted successfully! Please wait for admin approval.",
        data: result,
    });
});
const trackAdmissionStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { identifier } = req.params;
    const result = await admission_service_1.AdmissionService.trackAdmissionStatusFromDB(identifier);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admission status fetched successfully!",
        data: result,
    });
});
const approveAdmission = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await admission_service_1.AdmissionService.approveAdmissionInDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admission approved and student profile created successfully!",
        data: result,
    });
});
const rejectAdmission = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await admission_service_1.AdmissionService.rejectAdmissionInDB({
        applicationId: id,
        reason: req.body.reason,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admission application rejected and student notified via email.",
        data: result,
    });
});
const getAllApplications = (0, catchAsync_1.default)(async (req, res) => {
    const result = await admission_service_1.AdmissionService.getAllApplicationsFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Applications retrieved successfully!",
        data: result,
    });
});
exports.AdmissionController = {
    submitAdmission,
    trackAdmissionStatus,
    approveAdmission,
    rejectAdmission,
    getAllApplications,
};
