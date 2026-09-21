import { Gender } from '@prisma/client';

export type TRegisterTeacherPayload = {
  // Account Credentials
  name: string;
  email: string;
  password: string;
  phone: string;

  // Professional Info
  designation: string;
  department?: string;
  qualification?: string;

  // Personal & Verification Details
  gender: Gender;
  bloodGroup?: string;
  nidOrPassport?: string;

  // Media
  photoUrl?: string;
};

export type TApproveTeacherPayload = {
  teacherId: string;
};