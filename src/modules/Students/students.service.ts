import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { generateStudentCode, generateStudentPin } from "./student.utils";
import { ICreateStudentInput } from "./students.interface";
import axios from "axios";

// Helper: Format Bangladesh phone numbers into WhatsApp standard (880...)
const formatBDPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = `88${clean}`;
  } else if (!clean.startsWith("88") && clean.length === 10) {
    clean = `88${clean}`;
  }
  return clean;
};

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
    },
  });

  // 🔴 Non-blocking WhatsApp Notification Dispatch on Admission Approval/Creation
  (async () => {
    try {
      const rawPhone =
        (result as any).parent?.phone ||
        (result as any).phone ||
        (result as any).altPhone;

      if (rawPhone) {
        const formattedPhone = formatBDPhone(rawPhone);
        const studentName = `${result.firstName || ""} ${result.lastName || ""}`.trim();
        const className = result.class?.name || "N/A";
        const sectionName = result.section?.name || "";
        const rawBaseUrl = process.env.WHATSAPP_MICROSERVICE_URL || "";
        const microserviceUrl = rawBaseUrl.replace(/\/+$/, "");
        const secretKey = process.env.MICROSERVICE_SECRET_KEY;

        if (microserviceUrl) {
          // 💬 Admission Approval Message Format with Student Code & ID
          const message = `🎉 অভিনন্দন!\nআল-ঈমান স্কুলে ${studentName}-এর ভর্তি প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে।\n\n📌 শিক্ষার্থীর তথ্যাবলী:\n- শ্রেণি: ${className} ${sectionName}\n- Code: ${studentCode}\n- ID: ${studentIdNo}\n- পিন (PIN): ${pin}\n\nধন্যবাদ,\nআল-ঈমান স্কুল অ্যান্ড কলেজ কর্তৃপক্ষ।`;

          await axios.post(
            `${microserviceUrl}/send-message`,
            {
              phone: formattedPhone,
              message,
            },
            {
              headers: {
                "x-secret-key": secretKey,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(
            `✅ [WhatsApp Admission Success] Student: ${studentName} | Phone: ${formattedPhone}`
          );
        }
      }
    } catch (err: any) {
      console.error(
        "❌ [WhatsApp Admission Dispatch Failed]:",
        err?.response?.data || err?.message || err
      );
    }
  })();

  return result;
};

/**
 * Fetch all students with optional filters
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
    },
    orderBy: { createdAt: "desc" },
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