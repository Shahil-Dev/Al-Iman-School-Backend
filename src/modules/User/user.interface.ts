import { Gender } from "@prisma/client";

export type TCreateTeacherPayload = {
  password?: string;
  teacher: {
    email: string;
    employeeId: string;
    name: string;
    designation: string;
    department?: string;
    qualification?: string;
    phone: string;
    gender: Gender;
    bloodGroup?: string;
    nidOrPassport?: string;
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
    dob: string | Date;
    religion?: string;
    country?: string;
    bloodGroup?: string;
    nationality?: string;
    birthRegNo?: string;
    photoUrl?: string;

    fatherName?: string;
    fatherOccupation?: string;
    fatherNid?: string;
    motherName?: string;
    motherOccupation?: string;
    motherNid?: string;

    phone?: string;
    altPhone?: string;
    address?: string;
    permanentAddress?: string;

    passportNo?: string;
    height?: string;
    weight?: string;
    healthConditions?: string[];
    prevInstituteName?: string;

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