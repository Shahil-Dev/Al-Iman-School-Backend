import bcrypt from "bcrypt";
import { AdmissionStatus, Gender, Role } from "@prisma/client";

import {
  TApproveAdmissionPayload,
  TCreateAdmissionPayload,
  TRejectAdmissionPayload,
} from "./admission.interface";
import prisma from "../../lib/prisma";
import { sendEmail } from "../../utils/sendEmail";

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
        "No section found for this class! Please create a section first.",
      );
    }
    targetSectionId = defaultSection.id;
  }

  // Determine Target Roll Number
  let targetRollNo = payload?.rollNo;
  if (!targetRollNo) {
    const lastStudent = await prisma.studentProfile.findFirst({
      where: {
        classId: application.classId,
        sectionId: targetSectionId,
      },
      orderBy: { rollNo: "desc" },
    });
    targetRollNo = lastStudent ? lastStudent.rollNo + 1 : 1;
  }

  const defaultPassword = "Student@123456";
  const defaultPin = "123456"; // Default PIN required by StudentProfile schema
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Generating Standard Unique IDs according to StudentProfile Schema
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const studentCode = `STU-${currentYear}-${randomNum}`; // Unique studentCode
  const studentIdNo = `ID-${Date.now().toString().slice(-6)}`; // Unique studentIdNo

  // Name Parsing
  const nameParts = application.studentName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "N/A";

  // Transaction Execution: User -> Student Profile -> Update Application
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Base User with isApproved set to true
    const newUser = await tx.user.create({
      data: {
        email: application.email,
        password: hashedPassword,
        role: Role.STUDENT,
        isApproved: true, // User is auto-approved upon admission approval
      },
    });

    // 2. Create Detailed Student Profile
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: newUser.id,
        studentCode, // Required in StudentProfile Schema
        pin: defaultPin, // Required in StudentProfile Schema
        studentIdNo, // Required in StudentProfile Schema
        firstName,
        lastName,
        gender: application.gender,
        dob: application.dateOfBirth,
        religion: application.religion,
        country: application.country,
        bloodGroup: application.bloodGroup,
        nationality: application.nationality,
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
        healthConditions: application.healthConditions,
        prevInstituteName: application.prevInstituteName,

        // Academic Assignment
        classId: application.classId,
        sectionId: targetSectionId,
        rollNo: targetRollNo,
      },
    });

    // 3. Update Admission Application Status to APPROVED
    const updatedApplication = await tx.admissionApplication.update({
      where: { id: applicationId },
      data: { status: AdmissionStatus.APPROVED },
    });

    return { newUser, studentProfile, updatedApplication };
  });

  // Email Notification
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
        <li><b>Email:</b> ${application.email}</li>
        <li><b>Default Password:</b> ${defaultPassword}</li>
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
