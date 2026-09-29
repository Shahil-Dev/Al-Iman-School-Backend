import prisma from "../../lib/prisma";

const createExamIntoDB = async (payload: any) => {
  const result = await prisma.exam.create({
    data: payload,
  });
  return result;
};

const getAllExamsFromDB = async (query: Record<string, any>) => {
  const { academicYearId } = query;
  const whereConditions: any = {};

  if (academicYearId && academicYearId !== "undefined") {
    whereConditions.academicYearId = academicYearId;
  }

  const result = await prisma.exam.findMany({
    where: whereConditions,
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const saveStudentMarkIntoDB = async (payload: any) => {
  const {
    studentId,
    examId,
    subjectId,
    fullMarks = 100,
    mtMarks = 0,
    terminal = 0,
    grade = "F",
    gradePoint = 0.0,
  } = payload;

  const totalMarks = Number(mtMarks) + Number(terminal);

  const existingMark = await prisma.mark.findFirst({
    where: {
      examId,
      studentId,
      subjectId,
    },
  });

  if (existingMark) {
    return await prisma.mark.update({
      where: { id: existingMark.id },
      data: {
        fullMarks: Number(fullMarks),
        mtMarks: Number(mtMarks),
        terminal: Number(terminal),
        totalMarks,
        grade,
        gradePoint: Number(gradePoint),
      },
    });
  }

  return await prisma.mark.create({
    data: {
      examId,
      studentId,
      subjectId,
      fullMarks: Number(fullMarks),
      mtMarks: Number(mtMarks),
      terminal: Number(terminal),
      totalMarks,
      grade,
      gradePoint: Number(gradePoint),
    },
  });
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
      student: {
        include: {
          class: true,
          section: true,
        },
      },
    },
  });

  return marks;
};

export const ExamService = {
  createExamIntoDB,
  getAllExamsFromDB,
  saveStudentMarkIntoDB,
  getStudentMarksheetFromDB,
};