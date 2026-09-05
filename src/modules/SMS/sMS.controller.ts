import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { EmailNotificationService } from "./sMS.service";
import sendResponse from "../../utils/sendResponse";

const sendAbsenceAlerts = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.body;
  const result = await EmailNotificationService.sendAbsenceAlertEmails(
    date ? new Date(date) : new Date(),
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const sendDueFeeAlerts = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailNotificationService.sendDueFeeReminderEmails();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const testNotification = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await EmailNotificationService.sendTestEmail(email);

  sendResponse(res, {
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

const sendDueFeeReminders = catchAsync(async (req: Request, res: Response) => {
  const result = await EmailNotificationService.sendDueFeeReminderEmails();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

export const NotificationController = {
  sendAbsenceAlerts,
  sendDueFeeAlerts,
  testNotification,
  sendDueFeeReminders,
};
