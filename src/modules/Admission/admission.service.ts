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
  // Check Duplicate Transaction ID
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
      applicationNo,
      status: AdmissionStatus.PENDING,
    },
  });

  return result;
};

// 2. Track Application Status by Application No or Email
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

// 3. Approve Admission & Auto Create Student Profile (Super Admin)
const approveAdmissionInDB = async (applicationId: string) => {
  const application = await prisma.admissionApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error('Application not found!');
  }

  if (application.status !== AdmissionStatus.PENDING) {
    throw new Error(`Application is already ${application.status}!`);
  }

  // A. Find Default Section for the assigned Class
  const defaultSection = await prisma.section.findFirst({
    where: { classId: application.classId },
  });

  if (!defaultSection) {
    throw new Error('No section found for this class! Please create a section first.');
  }

  // B. Calculate Next Roll Number for Class & Section
  const lastStudent = await prisma.studentProfile.findFirst({
    where: {
      classId: application.classId,
      sectionId: defaultSection.id,
    },
    orderBy: { rollNo: 'desc' },
  });

  const nextRollNo = lastStudent ? lastStudent.rollNo + 1 : 1;

  const defaultPassword = 'Student@123456';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const studentIdNo = `STU-${Date.now().toString().slice(-6)}`;

  // Name Parsing
  const nameParts = application.studentName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || 'N/A';

  // Transaction: Create User -> StudentProfile -> Invoice -> Transaction -> Update Application
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create User Account
    const newUser = await tx.user.create({
      data: {
        email: application.email,
        password: hashedPassword,
        role: Role.STUDENT,
      },
    });

    // 2. Create Student Profile (Aligned with exact StudentProfile schema)
    const studentProfile = await tx.studentProfile.create({
      data: {
        userId: newUser.id,
        studentIdNo,
        firstName,
        lastName,
        gender: application.gender as Gender,
        dob: new Date(application.dateOfBirth),
        phone: application.phone,
        address: application.address,
        classId: application.classId,
        sectionId: defaultSection.id,
        rollNo: nextRollNo,
      },
    });

    // 3. Create Invoice & Transaction Ledger
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

    await tx.paymentTransaction.create({
      data: {
        invoiceId: invoice.id,
        amount: application.amount,
        method: application.paymentMethod,
        transactionId: application.transactionId,
        status: PaymentStatus.PAID,
      },
    });

    // 4. Update Application Status
    const updatedApplication = await tx.admissionApplication.update({
      where: { id: applicationId },
      data: { status: AdmissionStatus.APPROVED },
    });

    return { newUser, studentProfile, updatedApplication };
  });

  // Send Confirmation Email
  const emailHtml = `
    <h2>🎉 Congratulations! Admission Approved</h2>
    <p>Dear <b>${application.studentName}</b>,</p>
    <p>Your admission for <b>Al-Iman School</b> and payment verification (TrxID: ${application.transactionId}) are completed successfully!</p>
    <br/>
    <h4>Your Portal Credentials & Roll Info:</h4>
    <ul>
      <li><b>Student ID:</b> ${studentIdNo}</li>
      <li><b>Roll No:</b> ${nextRollNo}</li>
      <li><b>Email:</b> ${application.email}</li>
      <li><b>Default Password:</b> ${defaultPassword}</li>
    </ul>
    <p>Please log in and update your password immediately.</p>
  `;

  await sendEmail(application.email, 'Admission Approved - Al-Iman School', emailHtml);

  return result;
};

// 4. Reject Admission (Super Admin)
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

  // Send Rejection Email
  const emailHtml = `
    <h2>Admission Status Update</h2>
    <p>Dear <b>${application.studentName}</b>,</p>
    <p>We regret to inform you that your admission application (App No: ${application.applicationNo}) could not be approved at this time.</p>
    <p><b>Reason:</b> ${reason}</p>
    <p>Please contact the administration or submit a new application with correct payment information.</p>
  `;

  await sendEmail(application.email, 'Admission Application Update - Al-Iman School', emailHtml);

  return result;
};

// 5. Get All Applications
const getAllApplicationsFromDB = async () => {
  return await prisma.admissionApplication.findMany({
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