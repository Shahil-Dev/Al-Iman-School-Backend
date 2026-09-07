"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
// import prisma from '../../../lib/prisma';
const prisma_1 = __importDefault(require("../../lib/prisma"));
const takeAttendanceIntoDB = async (payload) => {
    const { date, classId, sectionId, attendances } = payload;
    const attendanceDate = new Date(date);
    // Bulk upsert using transaction
    const operations = attendances.map((item) => prisma_1.default.attendance.upsert({
        where: {
            date_studentId: {
                date: attendanceDate,
                studentId: item.studentId,
            },
        },
        update: {
            status: item.status,
        },
        create: {
            date: attendanceDate,
            studentId: item.studentId,
            classId,
            sectionId,
            status: item.status,
        },
    }));
    const result = await prisma_1.default.$transaction(operations);
    return result;
};
const getSectionAttendanceFromDB = async (classId, sectionId, date) => {
    const attendanceDate = new Date(date);
    const result = await prisma_1.default.attendance.findMany({
        where: {
            classId,
            sectionId,
            date: attendanceDate,
        },
        include: {
            student: {
                select: {
                    id: true,
                    studentIdNo: true,
                    rollNo: true,
                    gender: true,
                },
            },
        },
        orderBy: {
            student: {
                rollNo: 'asc',
            },
        },
    });
    return result;
};
const getStudentAttendanceSummaryFromDB = async (studentId) => {
    const totalDays = await prisma_1.default.attendance.count({
        where: { studentId },
    });
    const presentDays = await prisma_1.default.attendance.count({
        where: { studentId, status: 'PRESENT' },
    });
    const absentDays = await prisma_1.default.attendance.count({
        where: { studentId, status: 'ABSENT' },
    });
    const lateDays = await prisma_1.default.attendance.count({
        where: { studentId, status: 'LATE' },
    });
    return {
        totalWorkingDays: totalDays,
        totalPresence: presentDays,
        totalAbsent: absentDays,
        totalLate: lateDays,
    };
};
exports.AttendanceService = {
    takeAttendanceIntoDB,
    getSectionAttendanceFromDB,
    getStudentAttendanceSummaryFromDB,
};
