import prisma from "../../lib/prisma";

/**
 * Generates Unique Student Code e.g. STU-26-0001
 */
export const generateStudentCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear().toString().substring(2); // e.g. "26"

  // Find latest student created in the current year batch
  const lastStudent = await prisma.studentProfile.findFirst({
    where: {
      studentCode: {
        startsWith: `STU-${currentYear}-`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      studentCode: true,
    },
  });

  let currentNumber = 0;
  if (lastStudent && lastStudent.studentCode) {
    const parts = lastStudent.studentCode.split("-");
    if (parts.length === 3) {
      currentNumber = parseInt(parts[2], 10);
    }
  }

  const nextNumber = (currentNumber + 1).toString().padStart(4, "0");
  return `STU-${currentYear}-${nextNumber}`;
};

/**
 * Generates default 6-digit PIN for student login/access
 */
export const generateStudentPin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};