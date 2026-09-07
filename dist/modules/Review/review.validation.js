"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidation = void 0;
const zod_1 = require("zod");
const createReviewValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        comment: zod_1.z.string({ message: 'Comment is required!' }).min(5, 'Comment must be at least 5 characters long'),
        rating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    }),
});
const updateReviewStatusValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        isApproved: zod_1.z.boolean({ message: 'isApproved status is required!' }),
    }),
});
exports.ReviewValidation = {
    createReviewValidationSchema,
    updateReviewStatusValidationSchema,
};
