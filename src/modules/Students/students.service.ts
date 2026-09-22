import prisma from "../../lib/prisma";
import { generateStudentCode, generateStudentPin } from "./student.utils";

/**
 * Create a new student with auto-generated studentCode and PIN
 */
const createStudentIntoDB = async (payload: any) => {
  // 1. Generate unique studentCode and PIN
  const studentCode = await generateStudentCode();
  const pin = generateStudentPin();

  // 2. Create student profile in database
  const result = await prisma.studentProfile.create({
    data: {
      ...payload,
      studentCode,
      pin,
    },
    include: {
      user: { select: { id: true, email: true, role: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      parent: true,
    },
  });

  return result;
};

const getAllStudentsFromDB = async (query: Record<string, any>) => {
  const { searchTerm, classId, sectionId } = query;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { studentIdNo: { contains: searchTerm, mode: "insensitive" } },
        { studentCode: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (classId) {
    andConditions.push({ classId });
  }

  if (sectionId) {
    andConditions.push({ sectionId });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.studentProfile.findMany({
    where: whereConditions,
    include: {
      user: { select: { id: true, email: true, role: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      parent: true,
    },
    orderBy: { rollNo: "asc" },
  });

  return result;
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, role: true } },
      class: true,
      section: true,
      parent: true,
    },
  });
  return result;
};

const updateStudentInDB = async (id: string, payload: Partial<any>) => {
  const result = await prisma.studentProfile.update({
    where: { id },
    data: payload,
    include: {
      class: true,
      section: true,
      parent: true,
    },
  });
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!student) {
    throw new Error("Student profile not found!");
  }

  // If user account exists, delete user (which cascades/deletes profile based on schema)
  if (student.userId) {
    const result = await prisma.user.delete({
      where: { id: student.userId },
    });
    return result;
  }

  // If student doesn't have a user account, delete student profile directly
  const result = await prisma.studentProfile.delete({
    where: { id },
  });

  return result;
};

export const StudentService = {
  createStudentIntoDB,
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  updateStudentInDB,
  deleteStudentFromDB,
};