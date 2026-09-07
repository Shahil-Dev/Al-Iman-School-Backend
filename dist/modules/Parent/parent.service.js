"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getMyChildrenFromDB = async (parentUserId) => {
    const parent = await prisma_1.default.parentProfile.findUnique({
        where: { userId: parentUserId },
        include: {
            students: {
                include: {
                    class: true,
                    section: true,
                },
            },
        },
    });
    if (!parent) {
        throw new Error("Parent profile not found!");
    }
    return parent.students;
};
const getChildOverviewFromDB = async (parentUserId, studentId) => {
    const parent = await prisma_1.default.parentProfile.findUnique({
        where: { userId: parentUserId },
        include: {
            students: {
                where: { id: studentId },
            },
        },
    });
    if (!parent || parent.students.length === 0) {
        throw new Error("Unauthorized! Student does not belong to this parent.");
    }
    const [attendances, marks, invoices] = await Promise.all([
        prisma_1.default.attendance.findMany({
            where: { studentId },
            orderBy: { date: "desc" },
            take: 30,
        }),
        prisma_1.default.mark.findMany({
            where: { studentId },
            include: {
                exam: true,
                subject: true,
            },
        }),
        prisma_1.default.studentInvoice.findMany({
            where: { studentId },
            orderBy: { createdAt: "desc" },
        }),
    ]);
    return {
        attendances,
        marks,
        invoices,
    };
};
const assignStudentToParentInDB = async (payload) => {
    const parentExists = await prisma_1.default.parentProfile.findUnique({
        where: { id: payload.parentId },
    });
    if (!parentExists) {
        throw new Error("Parent profile not found!");
    }
    const updatedStudent = await prisma_1.default.studentProfile.update({
        where: { id: payload.studentId },
        data: { parentId: payload.parentId },
        include: {
            parent: true,
            class: true,
            section: true,
        },
    });
    return updatedStudent;
};
const removeStudentFromParentInDB = async (studentId) => {
    const updatedStudent = await prisma_1.default.studentProfile.update({
        where: { id: studentId },
        data: { parentId: null },
    });
    return updatedStudent;
};
const validateParentChildRelation = async (parentUserId, studentId) => {
    const parent = await prisma_1.default.parentProfile.findUnique({
        where: { userId: parentUserId },
        include: {
            students: {
                where: { id: studentId },
            },
        },
    });
    if (!parent || parent.students.length === 0) {
        throw new Error("Unauthorized! You do not have access to this student's records.");
    }
    return parent.students[0];
};
const getFullStudentAccessForParentInDB = async (parentUserId, studentId) => {
    const student = await validateParentChildRelation(parentUserId, studentId);
    const [profileDetails, attendances, marks, invoices, classRoutine] = await Promise.all([
        prisma_1.default.studentProfile.findUnique({
            where: { id: studentId },
            include: {
                class: true,
                section: true,
            },
        }),
        prisma_1.default.attendance.findMany({
            where: { studentId },
            orderBy: { date: "desc" },
        }),
        prisma_1.default.mark.findMany({
            where: { studentId },
            include: {
                exam: true,
                subject: true,
            },
        }),
        prisma_1.default.studentInvoice.findMany({
            where: { studentId },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.classRoutine.findMany({
            where: {
                classId: student.classId,
                sectionId: student.sectionId,
            },
        }),
    ]);
    return {
        studentProfile: profileDetails,
        attendances,
        marks,
        invoices,
        classRoutine,
    };
};
exports.ParentService = {
    getMyChildrenFromDB,
    getChildOverviewFromDB,
    assignStudentToParentInDB,
    removeStudentFromParentInDB,
    validateParentChildRelation,
    getFullStudentAccessForParentInDB,
};
