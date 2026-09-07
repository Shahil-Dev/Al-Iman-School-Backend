"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
// 1. Create Review (Only for Logged-in Parent)
const createReviewIntoDB = async (userId, payload) => {
    // Find Parent Profile ID from logged-in User ID
    const parentProfile = await prisma_1.default.parentProfile.findUnique({
        where: { userId },
    });
    if (!parentProfile) {
        throw new Error('Only valid parents can give a review!');
    }
    const result = await prisma_1.default.review.create({
        data: {
            parentId: parentProfile.id,
            comment: payload.comment,
            rating: payload.rating,
        },
        include: {
            parent: true,
        },
    });
    return result;
};
// 2. Get Public Approved Reviews (Anyone can access without login)
const getPublicReviewsFromDB = async () => {
    const result = await prisma_1.default.review.findMany({
        where: {
            isApproved: true,
        },
        include: {
            parent: {
                select: {
                    fatherName: true,
                    motherName: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return result;
};
// 3. Approve or Reject Review (Admin Only)
const toggleReviewApprovalInDB = async (id, isApproved) => {
    const result = await prisma_1.default.review.update({
        where: { id },
        data: { isApproved },
    });
    return result;
};
exports.ReviewService = {
    createReviewIntoDB,
    getPublicReviewsFromDB,
    toggleReviewApprovalInDB,
};
