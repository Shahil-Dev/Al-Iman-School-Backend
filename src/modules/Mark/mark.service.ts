
import prisma from '../../lib/prisma';
import { calculateGradeAndPoint } from '../../utils/calculateGrade';
import { TSaveMarkPayload } from './mark.interface';

const saveMarkIntoDB = async (payload: TSaveMarkPayload) => {
  const { examId, studentId, subjectId, mtMarks = 0, terminal } = payload;

  // 1. Fetch Subject to check fullMarks
  const subject = await prisma.subject.findUnique({
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
  const { grade, gradePoint } = calculateGradeAndPoint(totalMarks, subject.fullMarks);

  // 3. Upsert Mark (Create if not exists, Update if exists)
  const result = await prisma.mark.upsert({
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

const getStudentMarksheetFromDB = async (examId: string, studentId: string) => {
  const marks = await prisma.mark.findMany({
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

export const MarkService = {
  saveMarkIntoDB,
  getStudentMarksheetFromDB,
};