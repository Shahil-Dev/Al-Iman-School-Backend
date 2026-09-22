import prisma from "../../lib/prisma";
import { generateStudentCode, generateStudentPin } from "./student.utils";


/**
 * Create a new student with auto-generated studentCode, studentIdNo and PIN
 */
const createStudentIntoDB = async (payload: ICreateStudentInput) => {
  // 1. Generate unique studentCode if not provided
  const studentCode = await generateStudentCode();
  
  // 2. Fallback studentIdNo to studentCode if not specified explicitly
  const studentIdNo = payload.studentIdNo || studentCode;
  
  // 3. Generate 6-digit PIN if not provided by admin
  const pin = payload.pin || generateStudentPin();

  // Parse Date of Birth correctly
  const dob = new Date(payload.dob);

  // 4. Create student profile in database
  const result = await prisma.studentProfile.create({
    data: {
      ...payload,
      dob,
      studentCode,
      studentIdNo,
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
        { phone: { contains: searchTerm, mode: "insensitive" } },
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
      attendances: { take: 30, orderBy: { date: "desc" } },
      marks: { include: { exam: true, subject: true } },
      documents: true,
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!result) {
    throw new Error("Student profile not found!");
  }

  return result;
};

const updateStudentInDB = async (id: string, payload: Partial<ICreateStudentInput>) => {
  const isExist = await prisma.studentProfile.findUnique({ where: { id } });

  if (!isExist) {
    throw new Error("Student profile not found!");
  }

  const updateData: any = { ...payload };
  if (payload.dob) {
    updateData.dob = new Date(payload.dob);
  }

  const result = await prisma.studentProfile.update({
    where: { id },
    data: updateData,
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

  if (student.userId) {
    const result = await prisma.user.delete({
      where: { id: student.userId },
    });
    return result;
  }

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