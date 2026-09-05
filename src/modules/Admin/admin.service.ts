import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';

const getDashboardAnalyticsFromDB = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const [
    totalStudents,
    totalTeachers,
    totalParents,
    todayStudentAttendance,
    todayTeacherAttendance,
    monthlyCollectedFees,
    totalDueFees,
    pendingPayrolls,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.parentProfile.count(),

    prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: { gte: today },
      },
      _count: { status: true },
    }),
    prisma.teacherAttendance.groupBy({
      by: ['status'],
      where: {
        date: { gte: today },
      },
      _count: { status: true },
    }),

    prisma.studentInvoice.aggregate({
      _sum: { paidAmount: true },
      where: {
        status: 'PAID',
        updatedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    prisma.studentInvoice.aggregate({
      _sum: { dueAmount: true },
      where: {
        status: { in: ['UNPAID', 'PARTIAL'] },
      },
    }),

    prisma.payroll.aggregate({
      _sum: { netSalary: true },
      _count: { id: true },
      where: {
        status: 'PENDING',
      },
    }),
  ]);

  return {
    overview: {
      totalStudents,
      totalTeachers,
      totalParents,
    },
    todayAttendance: {
      students: todayStudentAttendance,
      teachers: todayTeacherAttendance,
    },
    financials: {
      monthlyCollectedAmount: monthlyCollectedFees._sum.paidAmount || 0,
      totalDueAmount: totalDueFees._sum.dueAmount || 0,
      pendingPayrollAmount: pendingPayrolls._sum.netSalary || 0,
      pendingPayrollCount: pendingPayrolls._count.id || 0,
    },
  };
};

const getStudentDueReportFromDB = async () => {
  const dueInvoices = await prisma.studentInvoice.findMany({
    where: {
      status: { in: ['UNPAID', 'PARTIAL'] },
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
    orderBy: { dueAmount: 'desc' },
  });

  return dueInvoices;
};

const resetUserPasswordInDB = async (userId: string, newPassword: string) => {
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new Error('User not found!');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password updated successfully!' };
};

export const AdminService = {
  getDashboardAnalyticsFromDB,
  getStudentDueReportFromDB,
  resetUserPasswordInDB,
};