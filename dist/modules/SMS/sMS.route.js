"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailNotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const sMS_controller_1 = require("./sMS.controller");
const router = express_1.default.Router();
router.post("/test-email", sMS_controller_1.NotificationController.testNotification);
// Absence Alert API
router.post("/send-absence-alerts", sMS_controller_1.NotificationController.sendAbsenceAlerts);
// Due Fee Reminder API
router.post("/send-fee-reminders", sMS_controller_1.NotificationController.sendDueFeeReminders);
exports.MailNotificationRoutes = router;
