import { Request, Response } from "express";

import { ReviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createReview = catchAsync(async (req: Request, res: Response) => {
  // req.user contains decoded JWT token payload
  const userId = (req as any).user.id;
  const result = await ReviewService.createReviewIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully! Pending admin approval.",
    data: result,
  });
});

const getPublicReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getPublicReviewsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Public reviews retrieved successfully!",
    data: result,
  });
});

const toggleReviewApproval = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;
  const result = await ReviewService.toggleReviewApprovalInDB(
    id as string,
    isApproved,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Review ${isApproved ? "approved" : "unapproved"} successfully!`,
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getPublicReviews,
  toggleReviewApproval,
};
