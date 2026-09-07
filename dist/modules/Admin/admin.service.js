"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_1 = __importDefault(require("../../config/index"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getDashboardAnalyticsFromDB = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    const [totalStudents, totalTeachers, totalParents, todayStudentAttendance, monthlyCollectedFees, totalInvoicedFees, pendingPayrolls, pendingReviewsCount, totalDocumentsIssued,] = await Promise.all([
        prisma_1.default.studentProfile.count(),
        prisma_1.default.teacherProfile.count(),
        prisma_1.default.parentProfile.count(),
        prisma_1.default.attendance.groupBy({
            by: ["status"],
            where: {
                date: { gte: today },
            },
            _count: { status: true },
        }),
        prisma_1.default.studentInvoice.aggregate({
            _sum: { paidAmount: true },
            where: {
                status: "PAID",
                updatedAt: { gte: startOfMonth, lte: endOfMonth },
            },
        }),
        prisma_1.default.studentInvoice.aggregate({
            _sum: {
                amount: true,
                paidAmount: true,
            },
            where: {
                status: { in: ["PENDING", "PARTIAL"] },
            },
        }),
        prisma_1.default.teacherPayroll.aggregate({
            _sum: { netSalary: true },
            _count: { id: true },
            where: {
                status: "PENDING",
            },
        }),
        prisma_1.default.review.count({
            where: { isApproved: false },
        }),
        prisma_1.default.studentDocument.count(),
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
    const dueInvoices = await prisma_1.default.studentInvoice.findMany({
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
const toggleReviewApprovalInDB = async (reviewId, isApproved) => {
    const reviewExists = await prisma_1.default.review.findUnique({
        where: { id: reviewId },
    });
    if (!reviewExists) {
        throw new Error("Review not found!");
    }
    const updatedReview = await prisma_1.default.review.update({
        where: { id: reviewId },
        data: { isApproved },
    });
    return updatedReview;
};
const resetUserPasswordInDB = async (userId, newPassword) => {
    const userExists = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!userExists) {
        throw new Error("User not found!");
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, Number(index_1.default.bcrypt_salt_rounds));
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    return { message: "Password updated successfully!" };
};
exports.AdminService = {
    getDashboardAnalyticsFromDB,
    getStudentDueReportFromDB,
    toggleReviewApprovalInDB,
    resetUserPasswordInDB,
};
