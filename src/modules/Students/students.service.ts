import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { generateStudentCode, generateStudentPin } from "./student.utils";
import { ICreateStudentInput } from "./students.interface";
import { sendWhatsAppAdmissionNotification } from "../whatsapp/whatsapp.service";

/**
 * Create a new student with auto-generated studentCode, studentIdNo and PIN
 * & Send Automatic WhatsApp Notification to Guardian
 */
const createStudentIntoDB = async (payload: ICreateStudentInput) => {
  const studentCode = payload.studentCode || (await generateStudentCode());
  const studentIdNo = payload.studentIdNo || studentCode;
  const pin = payload.pin || generateStudentPin();
  const dob = new Date(payload.dob);

  const { userId, classId, sectionId, parentId, ...restPayload } = payload;
  const studentData: Prisma.StudentProfileUncheckedCreateInput = {
    ...restPayload,
    dob,
    studentCode,
    studentIdNo,
    pin,
    classId,
    sectionId,
    rollNo: Number(payload.rollNo),
    ...(userId && { userId }),
    ...(parentId && { parentId }),
  };

  const result = await prisma.studentProfile.create({
    data: studentData,
    include: {
      user: { select: { id: true, email: true, role: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      parent: true,
      attendances: {
        take: 30,
        orderBy: { date: "desc" },
      },
    },
  });

  // 🔴 Non-blocking WhatsApp Notification Dispatch
  const rawPhone =
    (result as any).parent?.phone ||
    (result as any).phone ||
    (result as any).altPhone;

  sendWhatsAppAdmissionNotification({
    phone: rawPhone,
    studentName: `${result.firstName || ""} ${result.lastName || ""}`.trim(),
    className: result.class?.name || "N/A",
    sectionName: result.section?.name || "",
    studentCode,
    studentIdNo,
    pin,
  });

  return result;
};

/**
 * Fetch all students with optional filters & recent attendance logs
 */
const getAllStudentsFromDB = async (query: Record<string, any>) => {
  const { searchTerm, classId, sectionId, parentId, userId } = query;
  const andConditions: any[] = [];

  if (searchTerm && typeof searchTerm === "string" && searchTerm.trim() !== "") {
    const term = searchTerm.trim();
    andConditions.push({
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { studentIdNo: { contains: term, mode: "insensitive" } },
        { studentCode: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
        { fatherName: { contains: term, mode: "insensitive" } },
        { motherName: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  if (classId && classId !== "ALL" && classId !== "undefined") {
    andConditions.push({ classId });
  }

  if (sectionId && sectionId !== "ALL" && sectionId !== "undefined") {
    andConditions.push({ sectionId });
  }

  if (parentId && parentId !== "undefined") {
    andConditions.push({ parentId });
  }

  if (userId && userId !== "undefined") {
    andConditions.push({ userId });
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
      attendances: {
        take: 30,
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

/**
 * Fetch a single student profile by ID, userId, or studentCode safely with full details
 */
const getSingleStudentFromDB = async (identifier: string) => {
  const result = await prisma.studentProfile.findFirst({
    where: {
      OR: [
        { id: identifier },
        { userId: identifier },
        { studentCode: identifier },
      ],
    },
    include: {
      user: { select: { id: true, email: true, role: true } },
      class: true,
      section: true,
      parent: true,
      attendances: {
        take: 60,
        orderBy: { date: "desc" },
      },
      marks: true,
      documents: true,
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!result) {
    throw new Error("Student profile not found!");
  }
  return result;
};

/**
 * Update existing student profile in DB
 */
const updateStudentInDB = async (
  id: string,
  payload: Partial<ICreateStudentInput>
) => {
  const isExist = await prisma.studentProfile.findFirst({
    where: { OR: [{ id }, { userId: id }] },
  });

  if (!isExist) {
    throw new Error("Student profile not found!");
  }

  const updateData: any = { ...payload };
  if (payload.dob) {
    updateData.dob = new Date(payload.dob);
  }

  const result = await prisma.studentProfile.update({
    where: { id: isExist.id },
    data: updateData,
    include: {
      class: true,
      section: true,
      parent: true,
      attendances: {
        take: 30,
        orderBy: { date: "desc" },
      },
    },
  });
  return result;
};

/**
 * Delete student profile, all associated relational data (invoices, marks, attendance, documents), and user account
 */
const deleteStudentFromDB = async (id: string) => {
  const student = await prisma.studentProfile.findFirst({
    where: { OR: [{ id }, { userId: id }] },
    select: { id: true, userId: true },
  });

  if (!student) {
    throw new Error("Student profile not found!");
  }

  const studentId = student.id;
  const userId = student.userId;

  // Execute deletion in a transaction to maintain data integrity
  const result = await prisma.$transaction(async (tx) => {
    // 1. Delete Student Documents
    await tx.studentDocument.deleteMany({
      where: { studentId },
    });

    // 2. Delete Student Invoices
    await tx.studentInvoice.deleteMany({
      where: { studentId },
    });

    // 3. Delete Student Marks
    await tx.mark.deleteMany({
      where: { studentId },
    });

    // 4. Delete Student Attendances
    await tx.attendance.deleteMany({
      where: { studentId },
    });

    // 5. Delete Student Profile
    const deletedProfile = await tx.studentProfile.delete({
      where: { id: studentId },
    });

    // 6. Delete User Account if it exists
    if (userId) {
      await tx.user.delete({
        where: { id: userId },
      });
    }

    return deletedProfile;
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