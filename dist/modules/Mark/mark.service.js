"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const calculateGrade_1 = require("../../utils/calculateGrade");
const saveMarkIntoDB = async (payload) => {
    const { examId, studentId, subjectId, mtMarks = 0, terminal } = payload;
    // 1. Fetch Subject to check fullMarks
    const subject = await prisma_1.default.subject.findUnique({
        where: { id: subjectId },
    });
    if (!subject) {
        throw new Error('Subject not found!');
    }
    const totalMarks = mtMarks + terminal;
    if (totalMarks > subject.fullMarks) {
        throw new Error(`Total marks (${totalMarks}) cannot exceed subject full marks (${subject.fullMarks})!`);
    }
    // 2. Calculate Grade & Point
    const { grade, gradePoint } = (0, calculateGrade_1.calculateGradeAndPoint)(totalMarks, subject.fullMarks);
    // 3. Upsert Mark (Create if not exists, Update if exists)
    const result = await prisma_1.default.mark.upsert({
        where: {
            examId_studentId_subjectId: {
                examId,
                studentId,
                subjectId,
            },
        },
        update: {
            fullMarks: subject.fullMarks,
            mtMarks,
            terminal,
            totalMarks,
            grade,
            gradePoint,
        },
        create: {
            examId,
            studentId,
            subjectId,
            fullMarks: subject.fullMarks,
            mtMarks,
            terminal,
            totalMarks,
            grade,
            gradePoint,
        },
        include: {
            student: true,
            subject: true,
            exam: true,
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
            student: {
                include: {
                    class: true,
                    section: true,
                },
            },
        },
    });
    // Calculate overall GPA
    let totalPoints = 0;
    let isFailed = false;
    marks.forEach((item) => {
        if (item.grade === 'F') {
            isFailed = true;
        }
        totalPoints += item.gradePoint;
    });
    const gpa = isFailed || marks.length === 0 ? 0.0 : Number((totalPoints / marks.length).toFixed(2));
    return {
        marks,
        totalObtainedMarks: marks.reduce((acc, curr) => acc + curr.totalMarks, 0),
        gpa,
        resultStatus: isFailed ? 'Failed' : 'Passed',
    };
};
exports.MarkService = {
    saveMarkIntoDB,
    getStudentMarksheetFromDB,
};
