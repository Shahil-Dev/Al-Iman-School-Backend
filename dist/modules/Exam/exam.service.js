"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const exam_utils_1 = require("./exam.utils");
const createExamInDB = async (payload) => {
    const result = await prisma_1.default.exam.create({
        data: payload,
        include: {
            academicYear: true,
        },
    });
    return result;
};
const getAllExamsFromDB = async () => {
    const result = await prisma_1.default.exam.findMany({
        include: {
            academicYear: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    return result;
};
const saveStudentMarkInDB = async (payload) => {
    const fullMarks = payload.fullMarks || 100;
    const mtMarks = payload.mtMarks || 0;
    const terminal = payload.terminal || 0;
    // Total calculation: mtMarks + terminal
    const totalMarks = mtMarks + terminal;
    // Automatic Grade and GradePoint Calculation
    const { grade, gradePoint } = (0, exam_utils_1.calculateGrade)(totalMarks, fullMarks);
    const result = await prisma_1.default.mark.upsert({
        where: {
            examId_studentId_subjectId: {
                examId: payload.examId,
                studentId: payload.studentId,
                subjectId: payload.subjectId,
            },
        },
        update: {
            fullMarks,
            mtMarks,
            terminal,
            totalMarks,
            grade,
            gradePoint,
        },
        create: {
            examId: payload.examId,
            studentId: payload.studentId,
            subjectId: payload.subjectId,
            fullMarks,
            mtMarks,
            terminal,
            totalMarks,
            grade,
            gradePoint,
        },
        include: {
            exam: true,
            student: true,
            subject: true,
        },
    });
    return result;
};
const getStudentMarksheetFromDB = async (examId, studentId) => {
    const marks = await prisma_1.default.mark.findMany({
        where: {
            examId,
            studentId,
        },
        include: {
            subject: true,
            exam: true,
            student: true,
        },
    });
    if (marks.length === 0) {
        return { message: 'No marks found for this student in this exam.' };
    }
    // GPA & Final Result Calculation Logic
    let totalGradePoints = 0;
    let isFailed = false;
    marks.forEach((mark) => {
        if (mark.grade === 'F') {
            isFailed = true;
        }
        totalGradePoints += mark.gradePoint;
    });
    const totalSubjects = marks.length;
    const gpa = isFailed ? 0.0 : Number((totalGradePoints / totalSubjects).toFixed(2));
    return {
        student: marks[0].student,
        exam: marks[0].exam,
        subjectMarks: marks,
        totalSubjects,
        gpa,
        isPassed: !isFailed,
    };
};
exports.ExamService = {
    createExamInDB,
    getAllExamsFromDB,
    saveStudentMarkInDB,
    getStudentMarksheetFromDB,
};
