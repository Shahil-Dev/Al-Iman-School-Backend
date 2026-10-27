import prisma from "../../lib/prisma";
import { calculateGradeAndPoint } from "../../utils/calculateGrade";
import {
  TBulkSaveMarkPayload,
  TSaveMarkPayload,
  TSaveStudentMarksPayload,
} from "./mark.interface";

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

// 2. Bulk Mark Entry (one subject, many students)
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

// 3. Student-wise Mark Entry (one student, many subjects)
const saveStudentMarksIntoDB = async (payload: TSaveStudentMarksPayload) => {
  const { examId, studentId, marks } = payload;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error("Student not found!");
  }

  const subjectIds = marks.map((m) => m.subjectId);

  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
  });

  if (subjects.length !== subjectIds.length) {
    throw new Error("One or more subjects not found!");
  }

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Validate first (outside transaction) to avoid partial failure
  const prepared = marks.map((item) => {
    const subject = subjectMap.get(item.subjectId)!;
    const hasMT = subject.hasMT;
    const mtMarks = hasMT ? item.mtMarks || 0 : 0;
    const terminal = item.terminal;
    const totalMarks = mtMarks + terminal;

    if (totalMarks > subject.fullMarks) {
      throw new Error(
        `Total marks (${totalMarks}) for subject "${subject.name}" exceed full marks (${subject.fullMarks})!`,
      );
    }

    const { grade, gradePoint } = calculateGradeAndPoint(
      totalMarks,
      subject.fullMarks,
    );

    return {
      subjectId: item.subjectId,
      fullMarks: subject.fullMarks,
      mtMarks,
      terminal,
      totalMarks,
      grade,
      gradePoint,
    };
  });

  const operations = prepared.map((p) =>
    prisma.mark.upsert({
      where: {
        examId_studentId_subjectId: {
          examId,
          studentId,
          subjectId: p.subjectId,
        },
      },
      update: {
        fullMarks: p.fullMarks,
        mtMarks: p.mtMarks,
        terminal: p.terminal,
        totalMarks: p.totalMarks,
        grade: p.grade,
        gradePoint: p.gradePoint,
      },
      create: {
        examId,
        studentId,
        subjectId: p.subjectId,
        fullMarks: p.fullMarks,
        mtMarks: p.mtMarks,
        terminal: p.terminal,
        totalMarks: p.totalMarks,
        grade: p.grade,
        gradePoint: p.gradePoint,
      },
    }),
  );

  const result = await prisma.$transaction(operations);
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
      student: {
        include: {
          class: true,
          section: true,
          parent: true,
        },
      },
    },
  });

  return marks || [];
};
export const MarkService = {
  saveMarkIntoDB,
  saveBulkMarksIntoDB,
  saveStudentMarksIntoDB,
  getStudentMarksheetFromDB,
};
