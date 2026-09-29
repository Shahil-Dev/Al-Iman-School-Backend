import prisma from '../../lib/prisma';
import { TCreateReviewPayload } from './review.interface';

// 1. Create Review (Only for Logged-in Parent)
const createReviewIntoDB = async (userId: string, payload: TCreateReviewPayload) => {
  // Find Parent Profile ID from logged-in User ID
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
  });

  if (!parentProfile) {
    throw new Error('Only valid parents can give a review!');
  }

  const result = await prisma.review.create({
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
  const result = await prisma.review.findMany({
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
const toggleReviewApprovalInDB = async (id: string, isApproved: boolean) => {
  const result = await prisma.review.update({
    where: { id },
    data: { isApproved },
  });

  return result;
};

// 4. Get ALL Reviews (Admin Only - both approved and pending)
const getAllReviewsForAdminInDB = async () => {
  const result = await prisma.review.findMany({
    include: {
      parent: {
        select: {
          fatherName: true,
          motherName: true,
          phone: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};



export const ReviewService = {
  createReviewIntoDB,
  getPublicReviewsFromDB,
  toggleReviewApprovalInDB,
  getAllReviewsForAdminInDB
};