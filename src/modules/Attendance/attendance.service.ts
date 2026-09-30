import bcrypt from "bcrypt";
import axios from "axios";
import { AdmissionStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma";
import { sendEmail } from "../../utils/sendEmail";
import {
  generateStudentCode,
  generateStudentPin,
} from "../Students/student.utils";
import {
  TApproveAdmissionPayload,
  TCreateAdmissionPayload,
  TRejectAdmissionPayload,
} from "../Admission/admission.interface";

// 🌐 Helper function to send WhatsApp messages via Railway Microservice
const triggerWhatsAppNotification = async (phone: string, message: string) => {
  try {
    const baseUrl =
      process.env.WHATSAPP_MICROSERVICE_URL ||
      "https://al-imanwhatsappservice-production.up.railway.app";

    const microserviceUrl = baseUrl.replace(/\/$/, "");
    const secretKey =
      process.env.MICROSERVICE_SECRET_KEY ||
      "AlIman_WhatsApp_Secret_2026_#Secured";

    console.log(
      `🚀 [WhatsApp Microservice Request] Dispatching credentials to: ${phone}`,
    );

    const response = await axios.post(
      `${microserviceUrl}/send-message`,
      { phone, message },
      {
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": secretKey,
        },
        timeout: 12000,
      },
    );

    console.log(
      `✅ [WhatsApp Success]:`,
      response.data?.message || "Dispatched",
    );
  } catch (error: any) {
    console.error(
      "❌ [WhatsApp Microservice Error] Failed to send WhatsApp alert:",
      error?.response?.data || error?.message || error,
    );
  }
};

// 1. Submit Admission Application
const submitAdmissionIntoDB = async (payload: TCreateAdmissionPayload) => {
  const existingTrx = await prisma.admissionApplication.findUnique({
    where: { transactionId: payload.transactionId },
  });

  if (existingTrx) {
    throw new Error("This Transaction ID (TrxID) has already been used!");
  }

  const applicationNo = `ADM-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const result = await prisma.admissionApplication.create({
    data: {
      ...payload,
      dateOfBirth: new Date(payload.dateOfBirth),
      passportExpiryDate: payload.passportExpiryDate
        ? new Date(payload.passportExpiryDate)
        : undefined,
      applicationNo,
      status: AdmissionStatus.PENDING,
    },
  });

  return result;
};

// 2. Track Application Status
const trackAdmissionStatusFromDB = async (identifier: string) => {
  const result = await prisma.admissionApplication.findFirst({
    where: {
      OR: [{ applicationNo: identifier }, { email: identifier }],
    },
    include: {
      class: true,
    },
  });

  if (!result) {
    throw new Error(
      "No admission application found with provided credentials!",
    );
  }

  return result;
};

// 3. Approve Admission & Auto Create Student Profile
const approveAdmissionInDB = async (
  applicationId: string,
  payload?: TApproveAdmissionPayload,
) => {
  const application = await prisma.admissionApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found!");
  }

  if (application.status === AdmissionStatus.APPROVED) {
    throw new Error("Application is already approved!");
  }

  // Determine Target Section
  let targetSectionId = payload?.sectionId;
  if (!targetSectionId) {
    const defaultSection = await prisma.section.findFirst({
      where: { classId: application.classId },
    });
    if (!defaultSection) {
      throw new Error(
        "No section found for this class! Please create a section first in Academic Management.",
      );
    }
    targetSectionId = defaultSection.id;
  }

  // Determine Target Roll Number
  let targetRollNo: number = payload?.rollNo ? Number(payload.rollNo) : 0;
  if (!targetRollNo || isNaN(targetRollNo)) {
    const lastStudent = await prisma.studentProfile.findFirst({
      where: {
        classId: application.classId,
        sectionId: targetSectionId,
      },
      orderBy: { rollNo: "desc" },
    });
    targetRollNo = lastStudent ? Number(lastStudent.rollNo) + 1 : 1;
  }

  // 🔴 FIX 1: Generate Dynamic 6-Digit PIN
  const dynamicPin = Math.floor(100000 + Math.random() * 900000).toString();
  // 🔴 FIX 2: Hash the dynamic PIN directly so Student can log in using this PIN
  const hashedPassword = await bcrypt.hash(dynamicPin, 10);

  // Generating Standard Unique IDs
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const studentCode = `STU-${currentYear}-${randomNum}`;
  const studentIdNo = `ID-${Date.now().toString().slice(-6)}`;

  // Name Parsing Safely
  const nameParts = (application.studentName || "Student").trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "N/A";

  // Transaction Execution: User -> Student Profile -> Update Application
  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({
      where: { email: application.email },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          email: application.email,
          password: hashedPassword, // Store hashed PIN
          role: Role.STUDENT,
          isApproved: true,
        },
      });
    } else {
      // If user exists, update password to new hashed PIN
      user = await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, isApproved: true },
      });
    }

    // Create Detailed Student Profile
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        studentCode,
        pin: dynamicPin, // Store dynamic 6-digit PIN in profile
        studentIdNo,
        firstName,
        lastName,
        gender: application.gender,
        dob: application.dateOfBirth,
        religion: application.religion,
        country: application.country || "Bangladesh",
        bloodGroup: application.bloodGroup,
        nationality: application.nationality || "Bangladeshi",
        birthRegNo: application.birthRegNo,
        photoUrl: application.photoUrl,
        fatherName: application.fatherName,
        fatherOccupation: application.fatherOccupation,
        fatherNid: application.fatherNid,
        motherName: application.motherName,
        motherOccupation: application.motherOccupation,
        motherNid: application.motherNid,
        phone: application.phone,
        altPhone: application.altPhone,
        address: application.presentAddress,
        permanentAddress: application.permanentAddress,
        passportNo: application.passportNo,
        height: application.height,
        weight: application.weight,
        healthConditions: application.healthConditions || [],
        prevInstituteName: application.prevInstituteName,
        classId: application.classId,
        sectionId: targetSectionId,
        rollNo: targetRollNo,
      },
    });

    const updatedApplication = await tx.admissionApplication.update({
      where: { id: applicationId },
      data: { status: AdmissionStatus.APPROVED },
    });

    return { user, studentProfile, updatedApplication };
  });

  // 🔴 FIX 3: Send WhatsApp Message via Railway Microservice (Non-blocking)
  try {
    const rawPhone = application.phone || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = `88${cleanPhone}`;
    }

    const waMessage = `আসসালামু আলাইকুম ${application.studentName},\nআল-ঈমান ইসলামিক স্কুলে আপনার ভর্তি আবেদন সফলভাবে মঞ্জুর করা হয়েছে।\n\n📌 আপনার পোর্টালে লগইন তথ্য:\n- স্টুডেন্ট কোড: ${studentCode}\n- অ্যাক্সেস পিন (PIN): ${dynamicPin}\n- রোল নম্বর: ${targetRollNo}\n\nলগইন করুন: https://al-iman-school.vercel.app/login`;

    await axios.post(
      process.env.WHATSAPP_SERVICE_URL ||
        "https://your-railway-whatsapp.railway.app/send-message",
      {
        phone: cleanPhone,
        message: waMessage,
      },
      {
        headers: {
          "x-secret-key":
            process.env.MICROSERVICE_SECRET_KEY ||
            "AlIman_WhatsApp_Secret_2026_#Secured",
        },
        timeout: 10000,
      },
    );
    console.log(`✅ [WhatsApp Sent] Message dispatched to ${cleanPhone}`);
  } catch (waErr: any) {
    console.error(
      "WhatsApp sending failed (non-fatal):",
      waErr?.message || waErr,
    );
  }

  // Send Email Notification
  try {
    const emailHtml = `
      <h2>🎉 Congratulations! Admission Approved</h2>
      <p>Dear <b>${application.studentName}</b>,</p>
      <p>Your admission for <b>Al-Iman School</b> has been approved successfully!</p>
      <br/>
      <h4>Your Student Portal Credentials:</h4>
      <ul>
        <li><b>Student Code:</b> ${studentCode}</li>
        <li><b>Student ID No:</b> ${studentIdNo}</li>
        <li><b>Access PIN:</b> ${dynamicPin}</li>
        <li><b>Roll No:</b> ${targetRollNo}</li>
        <li><b>Email:</b> ${application.email}</li>
      </ul>
      <p>Log in using your Email or Student Code and PIN: ${dynamicPin}</p>
    `;
    await sendEmail(
      application.email,
      "Admission Approved - Al-Iman School",
      emailHtml,
    );
  } catch (emailErr) {
    console.error("Email sending failed (non-fatal):", emailErr);
  }

  return result;
};

// 4. Reject Admission
const rejectAdmissionInDB = async (payload: TRejectAdmissionPayload) => {
  const { applicationId, reason } = payload;

  const application = await prisma.admissionApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found!");
  }

  const result = await prisma.admissionApplication.update({
    where: { id: applicationId },
    data: {
      status: AdmissionStatus.REJECTED,
      rejectReason: reason,
    },
  });

  // Dual Notification for Rejection
  const targetPhone = application.phone || application.altPhone;
  if (targetPhone) {
    const waMessage = `Dear Parent/Student,\nWe regret to inform you that the admission application for *${application.studentName}* (App No: ${application.applicationNo}) was not approved at this time.\n\n*Reason:* ${reason}\n\nPlease contact administration for queries.`;
    await triggerWhatsAppNotification(targetPhone, waMessage);
  }

  try {
    const emailHtml = `
      <h2>Admission Status Update</h2>
      <p>Dear <b>${application.studentName}</b>,</p>
      <p>We regret to inform you that your admission application (App No: ${application.applicationNo}) could not be approved at this time.</p>
      <p><b>Reason:</b> ${reason}</p>
      <p>Please contact the administration or submit a new application with correct information.</p>
    `;
    await sendEmail(
      application.email,
      "Admission Application Update - Al-Iman School",
      emailHtml,
    );
  } catch (emailErr) {
    console.error("Email sending failed (non-fatal):", emailErr);
  }

  return result;
};

// 5. Get Applications with Dynamic Filters
const getAllApplicationsFromDB = async (query: any) => {
  const { status, classId, searchTerm } = query;
  const andConditions: any[] = [];

  if (status && status !== "ALL") {
    andConditions.push({ status });
  }
  if (classId && classId !== "ALL") {
    andConditions.push({ classId });
  }
  if (
    searchTerm &&
    typeof searchTerm === "string" &&
    searchTerm.trim() !== ""
  ) {
    andConditions.push({
      OR: [
        { studentName: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { transactionId: { contains: searchTerm, mode: "insensitive" } },
        { applicationNo: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }
  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  return await prisma.admissionApplication.findMany({
    where: whereConditions,
    include: {
      class: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const AdmissionService = {
  submitAdmissionIntoDB,
  trackAdmissionStatusFromDB,
  approveAdmissionInDB,
  rejectAdmissionInDB,
  getAllApplicationsFromDB,
};
