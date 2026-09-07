"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sMS_service_1 = require("./sMS.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sendAbsenceAlerts = (0, catchAsync_1.default)(async (req, res) => {
    const { date } = req.body;
    const result = await sMS_service_1.EmailNotificationService.sendAbsenceAlertEmails(date ? new Date(date) : new Date());
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
    });
});
const sendDueFeeAlerts = (0, catchAsync_1.default)(async (req, res) => {
    const result = await sMS_service_1.EmailNotificationService.sendDueFeeReminderEmails();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
    });
});
const testNotification = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    const result = await sMS_service_1.EmailNotificationService.sendTestEmail(email);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Test email sent successfully!",
        data: result,
    });
});
// const sendAbsenceAlerts = catchAsync(async (req: Request, res: Response) => {
//   const date = req.body.date ? new Date(req.body.date) : new Date();
//   const result = await EmailNotificationService.sendAbsenceAlertEmails(date);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: result.message,
//     data: result,
//   });
// });
const sendDueFeeReminders = (0, catchAsync_1.default)(async (req, res) => {
    const result = await sMS_service_1.EmailNotificationService.sendDueFeeReminderEmails();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
    });
});
exports.NotificationController = {
    sendAbsenceAlerts,
    sendDueFeeAlerts,
    testNotification,
    sendDueFeeReminders,
};
