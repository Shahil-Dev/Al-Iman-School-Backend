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

  // Class teacher assignment (optional)
  classTeacherOfId?: string;

  // Media
  photoUrl?: string;
};

// Every field is optional; only the fields that are sent get updated
export type TUpdateTeacherPayload = {
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string | null;
  qualification?: string | null;
  gender?: Gender;
  bloodGroup?: string | null;
  nidOrPassport?: string | null;
  photoUrl?: string | null;
  // null or empty removes the class teacher assignment
  classTeacherOfId?: string | null;
  // true moves the class from its current class teacher to this teacher
  replaceClassTeacher?: boolean;
};

export type TApproveTeacherPayload = {
  teacherId: string;
};