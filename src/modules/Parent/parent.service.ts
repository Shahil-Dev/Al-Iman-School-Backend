import prisma from "../../lib/prisma";

const getMyChildrenFromDB = async (parentUserId: string) => {
  const parent = await prisma.parentProfile.findUnique({
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

const getChildOverviewFromDB = async (
  parentUserId: string,
  studentId: string,
) => {
  const parent = await prisma.parentProfile.findUnique({
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
    prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.mark.findMany({
      where: { studentId },
      include: {
        exam: true,
        subject: true,
      },
    }),
    prisma.studentInvoice.findMany({
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

const assignStudentToParentInDB = async (payload: {
  parentId: string;
  studentId: string;
}) => {
  const parentExists = await prisma.parentProfile.findUnique({
    where: { id: payload.parentId },
  });

  if (!parentExists) {
    throw new Error("Parent profile not found!");
  }

  const updatedStudent = await prisma.studentProfile.update({
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

const removeStudentFromParentInDB = async (studentId: string) => {
  const updatedStudent = await prisma.studentProfile.update({
    where: { id: studentId },
    data: { parentId: null },
  });

  return updatedStudent;
};

const validateParentChildRelation = async (
  parentUserId: string,
  studentId: string,
) => {
  const parent = await prisma.parentProfile.findUnique({
    where: { userId: parentUserId },
    include: {
      students: {
        where: { id: studentId },
      },
    },
  });

  if (!parent || parent.students.length === 0) {
    throw new Error(
      "Unauthorized! You do not have access to this student's records.",
    );
  }

  return parent.students[0];
};

const getFullStudentAccessForParentInDB = async (
  parentUserId: string,
  studentId: string,
) => {
  const student = await validateParentChildRelation(parentUserId, studentId);

  const [profileDetails, attendances, marks, invoices, classRoutine] =
    await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          class: true,
          section: true,
        },
      }),
      prisma.attendance.findMany({
        where: { studentId },
        orderBy: { date: "desc" },
      }),
      prisma.mark.findMany({
        where: { studentId },
        include: {
          exam: true,
          subject: true,
        },
      }),
      prisma.studentInvoice.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.classRoutine.findMany({
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

export const ParentService = {
  getMyChildrenFromDB,
  getChildOverviewFromDB,
  assignStudentToParentInDB,
  removeStudentFromParentInDB,
  validateParentChildRelation,
  getFullStudentAccessForParentInDB,
};
