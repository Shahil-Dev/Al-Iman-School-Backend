import bcrypt from "bcrypt";
import { AdmissionStatus, Role } from "@prisma/client";

import {
  TApproveAdmissionPayload,
  TCreateAdmissionPayload,
  TRejectAdmissionPayload,
} from "./admission.interface";
import prisma from "../../lib/prisma";
import { sendEmail } from "../../utils/sendEmail";
import { sendWhatsAppAdmissionNotification } from "../whatsapp/whatsapp.service";
import {
  generateStudentCode,
  generateStudentPin,
} from "../Students/student.utils";

// 1. Submit Admission Application
const submitAdmissionIntoDB = async (payload: TCreateAdmissionPayload) => {
  // Cash and bank applications have no TrxID, so only check duplicates when one is given
  if (payload.transactionId) {
    const existingTrx = await prisma.admissionApplication.findUnique({
      where: { transactionId: payload.transactionId },
    });

    if (existingTrx) {
      throw new Error("This Transaction ID (TrxID) has already been used!");
    }
  }

  const applicationNo = `ADM-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const result = await prisma.admissionApplication.create({
    data: {
      ...payload,
      // Empty strings would collide on the unique transactionId column
      transactionId: payload.transactionId || undefined,
      senderPhone: payload.senderPhone || undefined,
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
    include: { class: true },
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

  const defaultPassword = "Student@123456";
  const defaultPin = generateStudentPin();
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Generating Standard Unique Student Code using official utility
  const studentCode = await generateStudentCode();
  const studentIdNo = studentCode;

  // Name Parsing Safely
  const nameParts = (application.studentName || "Student").trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "N/A";

  // 🛑 Determine Parent Info
  const parentEmail = application.guardianEmail || application.email;
  const parentPhone = application.guardianPhone || application.phone;

  // Transaction Execution: User -> Student Profile -> Update Application
  const result = await prisma.$transaction(async (tx) => {
    // 1. Find or Create Parent Profile (NOT Student User!)
    let parentProfile = await tx.parentProfile.findFirst({
      where: {
        OR: [{ phone: parentPhone }, { user: { email: parentEmail } }],
      },
      include: { user: true },
    });

    if (!parentProfile) {
      // Check if a user with the email already exists
      let parentUser = await tx.user.findUnique({
        where: { email: parentEmail },
      });

      if (!parentUser) {
        parentUser = await tx.user.create({
          data: {
            email: parentEmail,
            password: hashedPassword, // default password for parent
            role: Role.PARENT,
            isApproved: true,
          },
        });
      }

      parentProfile = await tx.parentProfile.create({
        data: {
          userId: parentUser.id,
          fatherName: application.fatherName || "N/A",
          motherName: application.motherName || "N/A",
          phone: parentPhone,
          occupation: application.fatherOccupation || "N/A",
        },
        include: { user: true },
      });
    }

    // 2. Create Detailed Student Profile (No userId for student!)
    const studentProfile = await tx.studentProfile.create({
      data: {
        // userId: null, // students log in via studentCode
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

        // 🛑 Link to parent
        parentId: parentProfile.id,
      },
      include: {
        class: true,
        section: true,
      },
    });

    // 3. Update Admission Application Status to APPROVED
    const updatedApplication = await tx.admissionApplication.update({
      where: { id: applicationId },
      data: { status: AdmissionStatus.APPROVED },
    });

    return { parentProfile, studentProfile, updatedApplication };
  });

  // 🔴 WhatsApp Notification Dispatch (Non-blocking)
  const targetPhone =
    application.guardianPhone || application.phone || application.altPhone;
  sendWhatsAppAdmissionNotification({
    phone: targetPhone ?? "",
    studentName: application.studentName,
    className:
      result.studentProfile.class?.name || application.class?.name || "N/A",
    sectionName: result.studentProfile.section?.name || "",
    studentCode,
    studentIdNo,
    pin: defaultPin,
  });

  // Email Notification (Non-blocking)
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
        <li><b>Default PIN:</b> ${defaultPin}</li>
        <li><b>Roll No:</b> ${targetRollNo}</li>
      </ul>
      <p>Please log in to the portal and update your password and PIN immediately.</p>
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