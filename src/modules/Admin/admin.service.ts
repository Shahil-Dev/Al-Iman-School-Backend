import bcrypt from "bcrypt";
import config from "../../config/index";
import prisma from "../../lib/prisma";

const getDashboardAnalyticsFromDB = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  // 🟢 Try-Catch সেফলি প্যারালাল কুয়েরি রান করা
  try {
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      pendingAdmissions,
      monthlyCollectedFees,
      totalInvoicedFees,
      pendingPayrolls,
      pendingReviewsCount,
      recentAdmissions,
    ] = await Promise.all([
      prisma.studentProfile.count().catch(() => 0),
      prisma.teacherProfile.count().catch(() => 0),
      prisma.parentProfile.count().catch(() => 0),
      prisma.admissionApplication.count({ where: { status: "PENDING" } }).catch(() => 0),

      prisma.studentInvoice
        .aggregate({
          _sum: { paidAmount: true },
          where: {
            status: "PAID",
            updatedAt: { gte: startOfMonth, lte: endOfMonth },
          },
        })
        .catch(() => ({ _sum: { paidAmount: 0 } })),

      prisma.studentInvoice
        .aggregate({
          _sum: {
            amount: true,
            paidAmount: true,
          },
          where: {
            status: { in: ["PENDING", "PARTIAL"] },
          },
        })
        .catch(() => ({ _sum: { amount: 0, paidAmount: 0 } })),

      prisma.teacherPayroll
        .aggregate({
          _sum: { netSalary: true },
          _count: { id: true },
          where: {
            status: "PENDING",
          },
        })
        .catch(() => ({ _sum: { netSalary: 0 }, _count: { id: 0 } })),

      prisma.review.count({ where: { isApproved: false } }).catch(() => 0),

      prisma.admissionApplication
        .findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            studentName: true,
            applicationNo: true,
            createdAt: true,
            status: true,
          },
        })
        .catch(() => []),
    ]);

    const totalAmount = totalInvoicedFees._sum?.amount || 0;
    const totalPaid = totalInvoicedFees._sum?.paidAmount || 0;
    const totalDueAmount = totalAmount - totalPaid;

    return {
      overview: {
        totalStudents,
        totalTeachers,
        totalParents,
        pendingAdmissions,
        pendingReviewsCount,
      },
      financials: {
        monthlyCollectedAmount: monthlyCollectedFees._sum?.paidAmount || 0,
        totalDueAmount: totalDueAmount > 0 ? totalDueAmount : 0,
        pendingPayrollAmount: pendingPayrolls._sum?.netSalary || 0,
        pendingPayrollCount: pendingPayrolls._count?.id || 0,
      },
      recentAdmissions,
    };
  } catch (error) {
    console.error("Error in getDashboardAnalyticsFromDB:", error);
    throw new Error("Failed to retrieve dashboard analytics from database.");
  }
};

const getStudentDueReportFromDB = async () => {
  const dueInvoices = await prisma.studentInvoice.findMany({
    where: {
      status: { in: ["PENDING", "PARTIAL"] },
    },
    include: {
      student: {
        select: {
          id: true,
          studentIdNo: true,
          firstName: true,
          lastName: true,
          phone: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
          parent: { select: { fatherName: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return dueInvoices.map((invoice) => ({
    ...invoice,
    dueAmount: invoice.amount - invoice.paidAmount,
  }));
};

const toggleReviewApprovalInDB = async (
  reviewId: string,
  isApproved: boolean,
) => {
  const reviewExists = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!reviewExists) {
    throw new Error("Review not found!");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved },
  });

  return updatedReview;
};

const resetUserPasswordInDB = async (userId: string, newPassword: string) => {
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new Error("User not found!");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password updated successfully!" };
};

export const AdminService = {
  getDashboardAnalyticsFromDB,
  getStudentDueReportFromDB,
  toggleReviewApprovalInDB,
  resetUserPasswordInDB,
};