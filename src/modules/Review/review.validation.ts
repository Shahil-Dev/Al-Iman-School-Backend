import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    comment: z.string({ message: 'Comment is required!' }).min(5, 'Comment must be at least 5 characters long'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  }),
});

const updateReviewStatusValidationSchema = z.object({
  body: z.object({
    isApproved: z.boolean({ message: 'isApproved status is required!' }),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewStatusValidationSchema,
};