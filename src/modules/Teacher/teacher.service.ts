import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import prisma from '../../lib/prisma';
import { TRegisterTeacherPayload } from './teacher.interface';
import { sendEmail } from '../../utils/sendEmail';

// 1. Self Teacher Registration (Account created with isApproved = false)
const registerTeacherIntoDB = async (payload: TRegisterTeacherPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists!');
  }

  const existingPhone = await prisma.teacherProfile.findUnique({
    where: { phone: payload.phone },
  });

  if (existingPhone) {
    throw new Error('Teacher with this phone number already exists!');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const employeeId = `TCH-${Date.now().toString().slice(-6)}`;

  // Transaction: Create User with PENDING approval status + TeacherProfile
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: Role.TEACHER,
        isApproved: false, // Pending until admin approval
      },
    });

    const teacherProfile = await tx.teacherProfile.create({
      data: {
        userId: newUser.id,
        employeeId,
        name: payload.name,
        designation: payload.designation,
        department: payload.department,
        qualification: payload.qualification,
        phone: payload.phone,
        gender: payload.gender,
        bloodGroup: payload.bloodGroup,
        nidOrPassport: payload.nidOrPassport,
        photoUrl: payload.photoUrl,
      },
    });

    return { newUser, teacherProfile };
  });

  return result;
};

// 2. Get All Pending Teacher Requests (Admin)
const getPendingTeachersFromDB = async () => {
  return await prisma.teacherProfile.findMany({
    where: {
      user: {
        isApproved: false,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isApproved: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// 3. Approve Teacher Account (Admin)
const approveTeacherInDB = async (teacherProfileId: string) => {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: { user: true },
  });

  if (!teacherProfile) {
    throw new Error('Teacher Profile not found!');
  }

  if (teacherProfile.user.isApproved) {
    throw new Error('Teacher account is already approved!');
  }

  const updatedUser = await prisma.user.update({
    where: { id: teacherProfile.userId },
    data: { isApproved: true },
  });

  // Send Notification Email
  try {
    const emailHtml = `
      <h2>🎉 Congratulations! Teacher Account Approved</h2>
      <p>Dear <b>${teacherProfile.name}</b>,</p>
      <p>Your teacher registration for <b>Al-Iman School</b> has been approved by the Administration.</p>
      <br/>
      <h4>Your Account Details:</h4>
      <ul>
        <li><b>Employee ID:</b> ${teacherProfile.employeeId}</li>
        <li><b>Email:</b> ${teacherProfile.user.email}</li>
      </ul>
      <p>You can now log in to the Teacher Portal using your credentials.</p>
    `;
    await sendEmail(
      teacherProfile.user.email,
      'Teacher Account Approved - Al-Iman School',
      emailHtml
    );
  } catch (emailErr) {
    console.error('Email sending failed (non-fatal):', emailErr);
  }

  return updatedUser;
};

// 4. Get All Approved Teachers
const getAllTeachersFromDB = async () => {
  return await prisma.teacherProfile.findMany({
    where: {
      user: {
        isApproved: true,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          isApproved: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const TeacherService = {
  registerTeacherIntoDB,
  getPendingTeachersFromDB,
  approveTeacherInDB,
  getAllTeachersFromDB,
};