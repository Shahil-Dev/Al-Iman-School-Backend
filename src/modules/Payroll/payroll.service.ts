import { PayrollStatus } from '@prisma/client';
import prisma from '../../lib/prisma';

const createPayrollInDB = async (payload: {
  teacherId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowance?: number;
  deduction?: number;
}) => {
  const allowance = payload.allowance || 0;
  const deduction = payload.deduction || 0;
  const netSalary = payload.basicSalary + allowance - deduction;

  const result = await prisma.teacherPayroll.create({
    data: {
      teacherId: payload.teacherId,
      month: payload.month,
      year: payload.year,
      basicSalary: payload.basicSalary,
      allowance,
      deduction,
      netSalary,
    },
    include: {
      teacher: true,
    },
  });

  return result;
};

const getPayrollsFromDB = async (month?: string, year?: number) => {
  const whereCondition: any = {};
  if (month) whereCondition.month = month;
  if (year) whereCondition.year = Number(year);

  const result = await prisma.teacherPayroll.findMany({
    where: whereCondition,
    include: {
      teacher: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

const markPayrollAsPaidInDB = async (id: string) => {
  const result = await prisma.teacherPayroll.update({
    where: { id },
    data: {
      status: PayrollStatus.PAID,
      paymentDate: new Date(),
    },
    include: {
      teacher: true,
    },
  });

  return result;
};

export const PayrollService = {
  createPayrollInDB,
  getPayrollsFromDB,
  markPayrollAsPaidInDB,
};