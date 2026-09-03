import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';

const router = express.Router();

// 1. Anyone (public) can see approved reviews
router.get(
  '/public',
  ReviewController.getPublicReviews
);

// 2. Only PARENT can post a review
router.post(
  '/',
  authGuard(Role.PARENT),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);

// 3. Only SUPER_ADMIN can approve/reject review
router.patch(
  '/:id/approve',
  authGuard(Role.SUPER_ADMIN),
  validateRequest(ReviewValidation.updateReviewStatusValidationSchema),
  ReviewController.toggleReviewApproval
);

export const ReviewRoutes = router;