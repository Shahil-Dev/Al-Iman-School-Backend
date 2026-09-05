import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getDashboardAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getDashboardAnalyticsFromDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard analytics retrieved successfully!",
      data: result,
    });
  },
);

const getStudentDueReport = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getStudentDueReportFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student due fee report retrieved successfully!",
    data: result,
  });
});

const resetUserPassword = catchAsync(async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;
  const result = await AdminService.resetUserPasswordInDB(userId, newPassword);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const toggleReviewApproval = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { isApproved } = req.body;

  const result = await AdminService.toggleReviewApprovalInDB(
    reviewId as string,
    isApproved,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Review ${isApproved ? "approved" : "unapproved"} successfully!`,
    data: result,
  });
});

export const AdminController = {
  getDashboardAnalytics,
  getStudentDueReport,
  toggleReviewApproval,
  resetUserPassword,
};
