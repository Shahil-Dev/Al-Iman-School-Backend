import bcrypt from 'bcrypt';
import config from '../../config';

import { Role } from '@prisma/client';
import { TCreateStudentPayload, TCreateTeacherPayload } from './user.interface';
import prisma from '../../lib/prisma';

const createTeacherIntoDB = async (payload: TCreateTeacherPayload) => {
  const password = await bcrypt.hash(
    payload.password || '123456',
    Number(config.bcrypt_salt_rounds)
  );

  const result = await prisma.$transaction(async (transactionClient) => {
    // 1. Create Base User
    const newUser = await transactionClient.user.create({
      data: {
        email: payload.teacher.email,
        password,
        role: Role.TEACHER,
      },
    });

    // 2. Create Teacher Profile
    const newTeacherProfile = await transactionClient.teacherProfile.create({
      data: {
        userId: newUser.id,
        employeeId: payload.teacher.employeeId,
        name: payload.teacher.name,
        designation: payload.teacher.designation,
        phone: payload.teacher.phone,
        photoUrl: payload.teacher.photoUrl,
      },
    });

    return newTeacherProfile;
  });

  return result;
};

const createStudentIntoDB = async (payload: TCreateStudentPayload) => {
  const password = await bcrypt.hash(
    payload.password || '123456',
    Number(config.bcrypt_salt_rounds)
  );

  const result = await prisma.$transaction(async (transactionClient) => {
    // 1. Create Base User
    const userEmail = payload.student.email || `${payload.student.studentIdNo}@school.com`;

    const newUser = await transactionClient.user.create({
      data: {
        email: userEmail,
        password,
        role: Role.STUDENT,
      },
    });

    // 2. Create Student Profile
    const newStudentProfile = await transactionClient.studentProfile.create({
      data: {
        userId: newUser.id,
        studentIdNo: payload.student.studentIdNo,
        firstName: payload.student.firstName,
        lastName: payload.student.lastName,
        gender: payload.student.gender,
        dob: new Date(payload.student.dob),
        phone: payload.student.phone,
        address: payload.student.address,
        photoUrl: payload.student.photoUrl,
        classId: payload.student.classId,
        sectionId: payload.student.sectionId,
        rollNo: payload.student.rollNo,
        parentId: payload.student.parentId,
      },
    });

    return newStudentProfile;
  });

  return result;
};

export const UserService = {
  createTeacherIntoDB,
  createStudentIntoDB,
};