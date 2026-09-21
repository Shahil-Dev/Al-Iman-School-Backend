import bcrypt from "bcrypt";
import config from "../../config";
import { Role } from "@prisma/client";
import {
  TCreateParentPayload,
  TCreateStudentPayload,
  TCreateTeacherPayload,
} from "./user.interface";
import prisma from "../../lib/prisma";

// 1. Create Teacher Profile (Admin Created)
const createTeacherIntoDB = async (payload: TCreateTeacherPayload) => {
  const password = await bcrypt.hash(
    payload.password || "123456",
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.$transaction(async (transactionClient) => {
    // 1. Create Base User
    const newUser = await transactionClient.user.create({
      data: {
        email: payload.teacher.email,
        password,
        role: Role.TEACHER,
        isApproved: true, // Direct creation by admin is auto-approved
      },
    });

    // 2. Create Teacher Profile
    const newTeacherProfile = await transactionClient.teacherProfile.create({
      data: {
        userId: newUser.id,
        employeeId: payload.teacher.employeeId,
        name: payload.teacher.name,
        designation: payload.teacher.designation,
        department: payload.teacher.department,
        qualification: payload.teacher.qualification,
        phone: payload.teacher.phone,
        gender: payload.teacher.gender,
        bloodGroup: payload.teacher.bloodGroup,
        nidOrPassport: payload.teacher.nidOrPassport,
        photoUrl: payload.teacher.photoUrl,
      },
    });

    return newTeacherProfile;
  });

  return result;
};

// 2. Create Student Profile (Full Admission Data)
const createStudentIntoDB = async (payload: TCreateStudentPayload) => {
  const password = await bcrypt.hash(
    payload.password || "123456",
    Number(config.bcrypt_salt_rounds)
  );

  const result = await prisma.$transaction(async (transactionClient) => {
    // 1. Create Base User
    const userEmail =
      payload.student.email || `${payload.student.studentIdNo.toLowerCase()}@school.com`;

    const newUser = await transactionClient.user.create({
      data: {
        email: userEmail,
        password,
        role: Role.STUDENT,
        isApproved: true,
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
        religion: payload.student.religion,
        country: payload.student.country,
        bloodGroup: payload.student.bloodGroup,
        nationality: payload.student.nationality,
        birthRegNo: payload.student.birthRegNo,
        photoUrl: payload.student.photoUrl,

        fatherName: payload.student.fatherName,
        fatherOccupation: payload.student.fatherOccupation,
        fatherNid: payload.student.fatherNid,
        motherName: payload.student.motherName,
        motherOccupation: payload.student.motherOccupation,
        motherNid: payload.student.motherNid,

        phone: payload.student.phone,
        altPhone: payload.student.altPhone,
        address: payload.student.address,
        permanentAddress: payload.student.permanentAddress,

        passportNo: payload.student.passportNo,
        height: payload.student.height,
        weight: payload.student.weight,
        healthConditions: payload.student.healthConditions,
        prevInstituteName: payload.student.prevInstituteName,

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

// 3. Create Parent Profile
const createParentIntoDB = async (payload: TCreateParentPayload) => {
  const password = await bcrypt.hash(
    payload.password || "123456",
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.$transaction(async (transactionClient) => {
    // 1. Create Base User
    const userEmail =
      payload.parent.email || `parent_${payload.parent.phone}@school.com`;

    const newUser = await transactionClient.user.create({
      data: {
        email: userEmail,
        password,
        role: Role.PARENT,
        isApproved: true,
      },
    });

    // 2. Create Parent Profile
    const newParentProfile = await transactionClient.parentProfile.create({
      data: {
        userId: newUser.id,
        fatherName: payload.parent.fatherName,
        motherName: payload.parent.motherName,
        phone: payload.parent.phone,
        occupation: payload.parent.occupation,
      },
    });

    return newParentProfile;
  });

  return result;
};

export const UserService = {
  createTeacherIntoDB,
  createStudentIntoDB,
  createParentIntoDB,
};