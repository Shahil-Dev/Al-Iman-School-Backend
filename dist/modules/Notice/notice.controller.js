"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeController = void 0;
const notice_service_1 = require("./notice.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createNotice = (0, catchAsync_1.default)(async (req, res) => {
    const result = await notice_service_1.NoticeService.createNoticeInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Notice published successfully!",
        data: result,
    });
});
const getAllNotices = (0, catchAsync_1.default)(async (req, res) => {
    const targetGroup = req.query.targetGroup;
    const result = await notice_service_1.NoticeService.getAllNoticesFromDB(targetGroup);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notices retrieved successfully!",
        data: result,
    });
});
const deleteNotice = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await notice_service_1.NoticeService.deleteNoticeFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notice deleted successfully!",
        data: result,
    });
});
exports.NoticeController = {
    createNotice,
    getAllNotices,
    deleteNotice,
};
