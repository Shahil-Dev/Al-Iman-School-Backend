import prisma from "../../lib/prisma";
import { calculateGradeAndPoint } from "../../utils/calculateGrade";
import { TBulkSaveMarkPayload, TSaveMarkPayload } from "./mark.interface";

// 1. Single Mark Entry / Update
const saveMarkIntoDB = async (payload: TSaveMarkPayload) => {
  const { examId, studentId, subjectId, mtMarks = 0, terminal } = payload;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new Error("Subject not found!");
  }

  const totalMarks = mtMarks + terminal;

  if (totalMarks > subject.fullMarks) {
    throw new Error(
      `Total marks (${totalMarks}) cannot exceed subject full marks (${subject.fullMarks})!`,
    );
  }

  const { grade, gradePoint } = calculateGradeAndPoint(
    totalMarks,
    subject.fullMarks,
  );

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

// 🟢 2. Bulk Mark Entry (For entire class / subject)
const saveBulkMarksIntoDB = async (payload: TBulkSaveMarkPayload) => {
  const { examId, subjectId, marks } = payload;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new Error("Subject not found!");
  }

  const operations = marks.map((item) => {
    const mtMarks = item.mtMarks || 0;
    const totalMarks = mtMarks + item.terminal;

    if (totalMarks > subject.fullMarks) {
      throw new Error(
        `Total marks (${totalMarks}) for student ID ${item.studentId} exceeds full marks (${subject.fullMarks})!`,
      );
    }

    const { grade, gradePoint } = calculateGradeAndPoint(
      totalMarks,
      subject.fullMarks,
    );

    return prisma.mark.upsert({
      where: {
        examId_studentId_subjectId: {
          examId,
          studentId: item.studentId,
          subjectId,
        },
      },
      update: {
        fullMarks: subject.fullMarks,
        mtMarks,
        terminal: item.terminal,
        totalMarks,
        grade,
        gradePoint,
      },
      create: {
        examId,
        studentId: item.studentId,
        subjectId,
        fullMarks: subject.fullMarks,
        mtMarks,
        terminal: item.terminal,
        totalMarks,
        grade,
        gradePoint,
      },
    });
  });

  const result = await prisma.$transaction(operations);
  return result;
};

// 3. Mark sheet Generation
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

  let totalPoints = 0;
  let isFailed = false;

  marks.forEach((item) => {
    if (item.grade === "F") {
      isFailed = true;
    }
    totalPoints += item.gradePoint;
  });

  const gpa =
    isFailed || marks.length === 0
      ? 0.0
      : Number((totalPoints / marks.length).toFixed(2));

  return {
    marks,
    totalObtainedMarks: marks.reduce((acc, curr) => acc + curr.totalMarks, 0),
    gpa,
    resultStatus: isFailed ? "Failed" : "Passed",
  };
};

export const MarkService = {
  saveMarkIntoDB,
  saveBulkMarksIntoDB,
  getStudentMarksheetFromDB,
};
