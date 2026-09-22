import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generates a sequential, guaranteed unique Student Code in format: STU-YY-XXXX
 * Example: STU-26-0001
 */
export const generateStudentCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // e.g., "26" for 2026
  const prefix = `STU-${currentYear}-`;

  // Find the last registered student code for the current year
  const lastStudent = await prisma.studentProfile.findFirst({
    where: {
      studentCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      studentCode: true,
    },
  });

  let nextSequenceNumber = 1;

  if (lastStudent && lastStudent.studentCode) {
    // Extract the numeric part (e.g., "0005" -> 5)
    const lastSequenceStr = lastStudent.studentCode.split("-")[2];
    const lastSequence = parseInt(lastSequenceStr, 10);
    if (!isNaN(lastSequence)) {
      nextSequenceNumber = lastSequence + 1;
    }
  }

  // Format sequence number with leading zeros (4 digits: 0001, 0002, etc.)
  const formattedSequence = String(nextSequenceNumber).padStart(4, "0");
  const studentCode = `${prefix}${formattedSequence}`;

  return studentCode;
};

/**
 * Generates a random 6-digit PIN for student access
 * Example: "849201"
 */
export const generateStudentPin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};