import bcrypt from 'bcrypt';
import { AdmissionStatus, Gender, PaymentStatus, Role } from '@prisma/client';

import {
  TCreateAdmissionPayload,
  TRejectAdmissionPayload,
} from './admission.interface';
import prisma from '../../lib/prisma';
import { sendEmail } from '../../utils/sendEmail';

// 1. Submit Admission Application (Student)
const submitAdmissionIntoDB = async (payload: TCreateAdmissionPayload) => {
  const existingTrx = await prisma.admissionApplication.findUnique({
    where: { transactionId: payload.transactionId },
  });

  if (existingTrx) {
    throw new Error('This Transaction ID (TrxID) has already been used!');
  }

  const applicationNo = `ADM-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const result = await prisma.admissionApplication.create({
    data: {
      ...payload,
      dateOfBirth: new Date(payload.dateOfBirth),
      passportExpiryDate: payload.passportExpiryDate ? new Date(payload.passportExpiryDate) : undefined,
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
    throw new Error('No admission application found with provided credentials!');
  }

  return result;
};

// 3. Approve Admission & Auto Create Full Student Profile
const approveAdmissionInDB = async (
  applicationId: string,
  payload?: { sectionId?: string; rollNo?: number }
) => {
  const application = await prisma.admissionApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error('Application not found!');
  }

  if (application.status === AdmissionStatus.APPROVED) {
    throw new Error('Application is already approved!');
  }

  // Determine Target Section
  let targetSectionId = payload?.sectionId;
  if (!targetSectionId) {
    const defaultSection = await prisma.section.findFirst({
      where: { classId: application.classId },
    });
    if (!defaultSection) {
      throw new Error('No section found for this class! Please create a section first.');
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
      orderBy: { rollNo: 'desc' },
    });
    targetRollNo = lastStudent ? lastStudent.rollNo + 1 : 1;
  }

  const defaultPassword = 'Student@123456';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const studentIdNo = `STU-${Date.now().toString().slice(-6)}`;

  // Name Parsing
  const nameParts = application.studentName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || 'N/A';

  // Transaction: Create Base User -> Complete Student Profile -> Student Invoice -> Payment Ledger -> Update Application
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Base User
    const newUser = await tx.user.create({
      data: {
        email: application.email,
        password: hashedPassword,
        role: Role.STUDENT,
      },
    });

    // 2. Create Student Profile with FULL detailed fields
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: newUser.id,
        studentIdNo,
        firstName,
        lastName,
        gender: application.gender as Gender,
        dob: application.dateOfBirth,
        religion: application.religion,
        country: application.country,
        bloodGroup: application.bloodGroup,
        nationality: application.nationality,
        birthRegNo: application.birthRegNo,
        photoUrl: application.photoUrl,

        // Parents Information
        fatherName: application.fatherName,
        fatherOccupation: application.fatherOccupation,
        fatherNid: application.fatherNid,
        motherName: application.motherName,
        motherOccupation: application.motherOccupation,
        motherNid: application.motherNid,

        // Contact Information
        phone: application.phone,
        altPhone: application.altPhone,
        address: application.presentAddress,
        permanentAddress: application.permanentAddress,

        // Additional & Medical Information
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

    // 3. Create Invoice Ledger
    const invoice = await tx.studentInvoice.create({
      data: {
        invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
        studentId: studentProfile.id,
        amount: application.amount,
        paidAmount: application.amount,
        status: PaymentStatus.PAID,
        dueDate: new Date(),
      },
    });

    // 4. Create Payment Transaction Record
    await tx.paymentTransaction.create({
      data: {
        invoiceId: invoice.id,
        amount: application.amount,
        method: application.paymentMethod,
        transactionId: application.transactionId,
        status: PaymentStatus.PAID,
      },
    });

    // 5. Update Application Status to APPROVED
    const updatedApplication = await tx.admissionApplication.update({
      where: { id: applicationId },
      data: { status: AdmissionStatus.APPROVED },
    });

    return { newUser, studentProfile, updatedApplication };
  });

  // Safe Email Notification (Will not crash API if SMTP fails)
  try {
    const emailHtml = `
      <h2>🎉 Congratulations! Admission Approved</h2>
      <p>Dear <b>${application.studentName}</b>,</p>
      <p>Your admission for <b>Al-Iman School</b> and payment verification (TrxID: ${application.transactionId}) are completed successfully!</p>
      <br/>
      <h4>Your Portal Credentials & Roll Info:</h4>
      <ul>
        <li><b>Student ID:</b> ${studentIdNo}</li>
        <li><b>Roll No:</b> ${targetRollNo}</li>
        <li><b>Email:</b> ${application.email}</li>
        <li><b>Default Password:</b> ${defaultPassword}</li>
      </ul>
      <p>Please log in and update your password immediately.</p>
    `;
    await sendEmail(application.email, 'Admission Approved - Al-Iman School', emailHtml);
  } catch (emailErr) {
    console.error('Email sending failed (non-fatal):', emailErr);
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
    throw new Error('Application not found!');
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
      <p>Please contact the administration or submit a new application with correct payment information.</p>
    `;
    await sendEmail(application.email, 'Admission Application Update - Al-Iman School', emailHtml);
  } catch (emailErr) {
    console.error('Email sending failed (non-fatal):', emailErr);
  }

  return result;
};

// 5. Get Applications with Strict Dynamic Filters
const getAllApplicationsFromDB = async (query: Record<string, any>) => {
  const { status, classId, searchTerm } = query;
  const andConditions: any[] = [];

  if (status && status !== 'ALL') {
    andConditions.push({ status: status as AdmissionStatus });
  }

  if (classId && classId !== 'ALL') {
    andConditions.push({ classId });
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        { studentName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
        { transactionId: { contains: searchTerm, mode: 'insensitive' } },
        { fatherName: { contains: searchTerm, mode: 'insensitive' } },
        { guardianName: { contains: searchTerm, mode: 'insensitive' } },
        { birthRegNo: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  return await prisma.admissionApplication.findMany({
    where: whereConditions,
    include: { class: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const AdmissionService = {
  submitAdmissionIntoDB,
  trackAdmissionStatusFromDB,
  approveAdmissionInDB,
  rejectAdmissionInDB,
  getAllApplicationsFromDB,
};