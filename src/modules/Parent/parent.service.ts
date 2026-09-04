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

export const ParentService = {
  getMyChildrenFromDB,
  getChildOverviewFromDB,
};
