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

  const [
    totalStudents,
    totalTeachers,
    totalParents,
    todayStudentAttendance,
    monthlyCollectedFees,
    totalInvoicedFees,
    pendingPayrolls,
    pendingReviewsCount,
    totalDocumentsIssued,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.parentProfile.count(),

    prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: { gte: today },
      },
      _count: { status: true },
    }),

    prisma.studentInvoice.aggregate({
      _sum: { paidAmount: true },
      where: {
        status: "PAID",
        updatedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    prisma.studentInvoice.aggregate({
      _sum: {
        amount: true,
        paidAmount: true,
      },
      where: {
        status: { in: ["PENDING", "PARTIAL"] },
      },
    }),

    prisma.teacherPayroll.aggregate({
      _sum: { netSalary: true },
      _count: { id: true },
      where: {
        status: "PENDING",
      },
    }),

    prisma.review.count({
      where: { isApproved: false },
    }),

    prisma.studentDocument.count(),
  ]);

  const totalAmount = totalInvoicedFees._sum.amount || 0;
  const totalPaid = totalInvoicedFees._sum.paidAmount || 0;
  const totalDueAmount = totalAmount - totalPaid;

  return {
    overview: {
      totalStudents,
      totalTeachers,
      totalParents,
      pendingReviewsCount,
      totalDocumentsIssued,
    },
    todayAttendance: {
      students: todayStudentAttendance,
    },
    financials: {
      monthlyCollectedAmount: monthlyCollectedFees._sum.paidAmount || 0,
      totalDueAmount: totalDueAmount > 0 ? totalDueAmount : 0,
      pendingPayrollAmount: pendingPayrolls._sum.netSalary || 0,
      pendingPayrollCount: pendingPayrolls._count.id || 0,
    },
  };
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
