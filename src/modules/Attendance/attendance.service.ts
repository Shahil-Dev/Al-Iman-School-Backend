import bcrypt from "bcrypt";
import axios from "axios";
import { AdmissionStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma";
import { sendEmail } from "../../utils/sendEmail";
import { generateStudentCode, generateStudentPin } from "../Students/student.utils";
import { TApproveAdmissionPayload, TCreateAdmissionPayload, TRejectAdmissionPayload } from "../Admission/admission.interface";

// 🌐 Helper function to send WhatsApp messages via Railway Microservice
const triggerWhatsAppNotification = async (phone: string, message: string) => {
  try {
    const baseUrl =
      process.env.WHATSAPP_MICROSERVICE_URL ||
      "https://al-imanwhatsappservice-production.up.railway.app";

    const microserviceUrl = baseUrl.replace(/\/$/, "");
    const secretKey =
      process.env.MICROSERVICE_SECRET_KEY || "AlIman_WhatsApp_Secret_2026_#Secured";

    console.log(`🚀 [WhatsApp Microservice Request] Dispatching credentials to: ${phone}`);

    const response = await axios.post(
      `${microserviceUrl}/send-message`,
      { phone, message },
      {
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": secretKey,
        },
        timeout: 12000,
      }
    );

    console.log(`✅ [WhatsApp Success]:`, response.data?.message || "Dispatched");
  } catch (error: any) {
    console.error(
      "❌ [WhatsApp Microservice Error] Failed to send WhatsApp alert:",
      error?.response?.data || error?.message || error
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

  // 🔑 Auto-generate Dynamic Unique Student Code and Dynamic 6-Digit PIN
  const studentCode = await generateStudentCode(); // e.g. STU-26-0001
  const defaultPin = generateStudentPin();          // e.g. Dynamic 6-digit PIN like 849201
  const defaultPassword = `Student@${defaultPin}`;
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
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
          password: hashedPassword,
          role: Role.STUDENT,
          isApproved: true,
        },
      });
    }

    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        studentCode,
        pin: defaultPin,
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

        // Parent Info
        fatherName: application.fatherName,
        fatherOccupation: application.fatherOccupation,
        fatherNid: application.fatherNid,
        motherName: application.motherName,
        motherOccupation: application.motherOccupation,
        motherNid: application.motherNid,

        // Contact Info
        phone: application.phone,
        altPhone: application.altPhone,
        address: application.presentAddress,
        permanentAddress: application.permanentAddress,

        // Additional Details
        passportNo: application.passportNo,
        height: application.height,
        weight: application.weight,
        healthConditions: application.healthConditions || [],
        prevInstituteName: application.prevInstituteName,

        // Academic Assignment
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

  // -------------------------------------------------------------
  // 📲 DUAL NOTIFICATION DISPATCH (WhatsApp + Email Fallback)
  // -------------------------------------------------------------
  
  // 1. WhatsApp Dispatch (Target phone -> Applicant's Phone)
  const targetPhone = application.phone || application.altPhone;
  if (targetPhone) {
    const waMessage = `🎉 *Congratulations! Admission Approved*\n\nDear Parent/Student,\nYour admission application for *${application.studentName}* at *Al-Iman School* has been approved!\n\n🔑 *Student Login Access Credentials:*\n• *Student Code:* ${studentCode}\n• *Security PIN:* ${defaultPin}\n• *Roll No:* ${targetRollNo}\n\nPlease visit our portal and log in using your *Student Code* and *PIN*.`;
    
    // Trigger in background synchronously before Serverless termination
    await triggerWhatsAppNotification(targetPhone, waMessage);
  }

  // 2. Email Fallback Notification (Non-blocking catch)
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
        <li><b>Security PIN:</b> ${defaultPin}</li>
        <li><b>Roll No:</b> ${targetRollNo}</li>
        <li><b>Email:</b> ${application.email}</li>
      </ul>
      <p>Please log in to the student portal using your <b>Student Code</b> and <b>Security PIN</b>.</p>
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
  if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== "") {
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