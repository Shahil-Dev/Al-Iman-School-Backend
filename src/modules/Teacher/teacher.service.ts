import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import prisma from '../../lib/prisma';
import { TRegisterTeacherPayload, TUpdateTeacherPayload } from './teacher.interface';
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

// 7. Get All Teachers for Admin (Includes Class Teacher Info)
const getAllTeachersForAdminFromDB = async () => {
  return await prisma.teacherProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isApproved: true,
        },
      },
      classTeacherOf: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// 5. Update Teacher Profile (Admin Only) - FIXED LOGIC
const updateTeacherInDB = async (
  teacherProfileId: string,
  payload: TUpdateTeacherPayload
) => {
  // 1. Check if teacher exists
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: { user: true },
  });

  if (!teacherProfile) {
    throw new Error('Teacher profile not found!');
  }

  // 2. Separate User fields (email) from TeacherProfile fields
  const { email, classTeacherOfId, replaceClassTeacher, ...profileData } = payload;

  // 3. Handle Email Uniqueness
  if (email && email !== teacherProfile.user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new Error('This email is already in use by another account!');
    }
  }

  // 4. Handle Phone Uniqueness
  if (profileData.phone && profileData.phone !== teacherProfile.phone) {
    const existingPhone = await prisma.teacherProfile.findUnique({ 
      where: { phone: profileData.phone } 
    });
    if (existingPhone) {
      throw new Error('This phone number is already in use by another teacher!');
    }
  }

  // 5. Handle Class Teacher Assignment Logic
  let classRelationUpdate: any = undefined;

  if (classTeacherOfId !== undefined) {
    if (classTeacherOfId) {
      // Check if the class is already assigned to someone else
      const existingClassTeacher = await prisma.teacherProfile.findUnique({
        where: { classTeacherOfId },
      });

      if (existingClassTeacher && existingClassTeacher.id !== teacherProfileId) {
        if (!replaceClassTeacher) {
          throw new Error(
            `This class is already assigned to ${existingClassTeacher.name}.`
          );
        } else {
          // If replacing, remove the class teacher assignment from the previous teacher
          await prisma.teacherProfile.update({
            where: { id: existingClassTeacher.id },
            data: { classTeacherOfId: null },
          });
        }
      }
      // Connect the new class
      classRelationUpdate = { connect: { id: classTeacherOfId } };
    } else {
      // Disconnect the class teacher assignment
      classRelationUpdate = { disconnect: true };
    }
  }

  // 6. Transaction to update both User (email) and TeacherProfile
  const result = await prisma.$transaction(async (tx) => {
    // Update User Email if provided
    if (email && email !== teacherProfile.user.email) {
      await tx.user.update({
        where: { id: teacherProfile.userId },
        data: { email },
      });
    }

    // Update Teacher Profile
    const updatedProfile = await tx.teacherProfile.update({
      where: { id: teacherProfileId },
      data: {
        ...profileData,
        classTeacherOf: classRelationUpdate,
      },
      include: {
        user: true,
        classTeacherOf: true,
      },
    });

    return updatedProfile;
  });

  return result;
};

// 6. Delete Teacher Profile and User Account (Admin Only)
const deleteTeacherFromDB = async (teacherProfileId: string) => {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
  });

  if (!teacherProfile) {
    throw new Error('Teacher profile not found!');
  }

  // Transaction: Delete Teacher Profile and User Account
  const result = await prisma.$transaction(async (tx) => {
    const deletedProfile = await tx.teacherProfile.delete({
      where: { id: teacherProfileId },
    });

    await tx.user.delete({
      where: { id: teacherProfile.userId },
    });

    return deletedProfile;
  });

  return result;
};

export const TeacherService = {
  registerTeacherIntoDB,
  getPendingTeachersFromDB,
  approveTeacherInDB,
  getAllTeachersFromDB,
  updateTeacherInDB,
  deleteTeacherFromDB,
  getAllTeachersForAdminFromDB
};