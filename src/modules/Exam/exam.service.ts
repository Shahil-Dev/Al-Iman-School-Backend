import prisma from '../../lib/prisma';
import { calculateGrade } from './exam.utils';

const createExamInDB = async (payload: { name: string; academicYearId: string }) => {
  const result = await prisma.exam.create({
    data: payload,
    include: {
      academicYear: true,
    },
  });
  return result;
};

const getAllExamsFromDB = async () => {
  const result = await prisma.exam.findMany({
    include: {
      academicYear: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const saveStudentMarkInDB = async (payload: {
  examId: string;
  studentId: string;
  subjectId: string;
  fullMarks?: number;
  mtMarks?: number;
  terminal: number;
}) => {
  const fullMarks = payload.fullMarks || 100;
  const mtMarks = payload.mtMarks || 0;
  const terminal = payload.terminal || 0;

  // Total calculation: mtMarks + terminal
  const totalMarks = mtMarks + terminal;

  // Automatic Grade and GradePoint Calculation
  const { grade, gradePoint } = calculateGrade(totalMarks, fullMarks);

  const result = await prisma.mark.upsert({
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

const getStudentMarksheetFromDB = async (examId: string, studentId: string) => {
  const marks = await prisma.mark.findMany({
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

export const ExamService = {
  createExamInDB,
  getAllExamsFromDB,
  saveStudentMarkInDB,
  getStudentMarksheetFromDB,
};