import express from "express";
import { NotificationController } from "./sMS.controller";

const router = express.Router();

router.post("/test-email", NotificationController.testNotification);
// Absence Alert API
router.post("/send-absence-alerts", NotificationController.sendAbsenceAlerts);

// Due Fee Reminder API
router.post("/send-fee-reminders", NotificationController.sendDueFeeReminders);
export const MailNotificationRoutes = router;
