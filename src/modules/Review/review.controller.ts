import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

// 1. Create Review (Logged-in Parent)
const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await ReviewService.createReviewIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully!",
    data: result,
  });
});

// 2. Get Public Approved Reviews
const getPublicReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getPublicReviewsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Approved reviews retrieved successfully!",
    data: result,
  });
});

// 3. Approve / Reject Review (Admin Only)
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
    message: `Review ${isApproved ? "approved" : "rejected"} successfully!`,
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getPublicReviews,
  toggleReviewApproval,
};
