import { Gender } from "@prisma/client";

export interface ICreateStudentInput {
  firstName: string;
  lastName: string;
  dob: string | Date;
  gender: Gender;
  classId: string;
  sectionId: string;
  rollNo: number;
  
  studentIdNo?: string;
  studentCode?: string;
  pin?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  permanentAddress?: string;
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
  passportNo?: string;
  height?: string;
  weight?: string;
  healthConditions?: string[];
  prevInstituteName?: string;
  userId?: string;
  parentId?: string;
}