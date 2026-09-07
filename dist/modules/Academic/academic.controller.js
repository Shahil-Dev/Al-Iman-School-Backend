"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicController = void 0;
const academic_service_1 = require("./academic.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createAcademicYear = (0, catchAsync_1.default)(async (req, res) => {
    const result = await academic_service_1.AcademicService.createAcademicYear(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Academic Year created successfully!",
        data: result,
    });
});
const getAllAcademicYears = (0, catchAsync_1.default)(async (req, res) => {
    const result = await academic_service_1.AcademicService.getAllAcademicYears();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Academic Years retrieved successfully!",
        data: result,
    });
});
const createAcademicClass = (0, catchAsync_1.default)(async (req, res) => {
    const result = await academic_service_1.AcademicService.createAcademicClass(req.body);
    const createAcademicSection = (0, catchAsync_1.default)(async (req, res) => {
        const result = await academic_service_1.AcademicService.createAcademicSection(req.body);
        (0, sendResponse_1.default)(res, {
            statusCode: 201,
            success: true,
            message: "Academic Section created successfully!",
            data: result,
        });
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Academic Class created successfully!",
        data: result,
    });
});
const getAllAcademicClasses = (0, catchAsync_1.default)(async (req, res) => {
    const result = await academic_service_1.AcademicService.getAllAcademicClasses();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Academic Classes retrieved successfully!",
        data: result,
    });
});
const createAcademicSection = (0, catchAsync_1.default)(async (req, res) => {
    const result = await academic_service_1.AcademicService.createAcademicSection(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Academic Section created successfully!",
        data: result,
    });
});
exports.AcademicController = {
    createAcademicYear,
    getAllAcademicYears,
    createAcademicClass,
    getAllAcademicClasses,
    createAcademicSection,
};
