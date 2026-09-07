"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const createPayrollInDB = async (payload) => {
    const allowance = payload.allowance || 0;
    const deduction = payload.deduction || 0;
    const netSalary = payload.basicSalary + allowance - deduction;
    const result = await prisma_1.default.teacherPayroll.create({
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
const getPayrollsFromDB = async (month, year) => {
    const whereCondition = {};
    if (month)
        whereCondition.month = month;
    if (year)
        whereCondition.year = Number(year);
    const result = await prisma_1.default.teacherPayroll.findMany({
        where: whereCondition,
        include: {
            teacher: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    return result;
};
const markPayrollAsPaidInDB = async (id) => {
    const result = await prisma_1.default.teacherPayroll.update({
        where: { id },
        data: {
            status: client_1.PayrollStatus.PAID,
            paymentDate: new Date(),
        },
        include: {
            teacher: true,
        },
    });
    return result;
};
exports.PayrollService = {
    createPayrollInDB,
    getPayrollsFromDB,
    markPayrollAsPaidInDB,
};
