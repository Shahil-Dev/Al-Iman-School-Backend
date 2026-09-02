import { Gender } from '@prisma/client';

export type TCreateTeacherPayload = {
  password?: string;
  teacher: {
    email: string;
    employeeId: string;
    name: string;
    designation: string;
    phone: string;
    photoUrl?: string;
  };
};

export type TCreateStudentPayload = {
  password?: string;
  student: {
    email?: string;
    studentIdNo: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    dob: string; // "YYYY-MM-DD"
    phone?: string;
    address?: string;
    photoUrl?: string;
    classId: string;
    sectionId: string;
    rollNo: number;
    parentId?: string;
  };
};

export type TCreateParentPayload = {
  password?: string;
  parent: {
    email?: string;
    fatherName: string;
    motherName: string;
    phone: string;
    occupation?: string;
  };
};