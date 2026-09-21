import { Gender, PaymentMethod } from '@prisma/client';

export type TCreateAdmissionPayload = {
  // Personal Information
  studentName: string;
  gender: Gender;
  dateOfBirth: string;
  religion: string;
  country: string;
  bloodGroup?: string;
  nationality: string;
  birthRegNo?: string;

  // Parents Information
  fatherName: string;
  fatherOccupation?: string;
  fatherNid?: string;
  motherName: string;
  motherOccupation?: string;
  motherNid?: string;
  guardianName?: string;
  guardianOccupation?: string;

  // Contact Information
  phone: string;
  altPhone?: string;
  email: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianAddress?: string;

  // Additional & Health Information
  passportNo?: string;
  passportExpiryDate?: string;
  height?: string;
  weight?: string;
  healthConditions?: string[];
  siblingStudentId?: string;
  admitOtherKids?: boolean;

  // Address
  presentAddress: string;
  permanentAddress: string;
  sameAsPresent?: boolean;

  // Previous Education & Media
  prevInstituteName?: string;
  prevInstituteAddress?: string;
  references?: string;
  photoUrl?: string;

  // Academic & Payment Information
  classId: string;
  paymentMethod: PaymentMethod;
  senderPhone: string;
  amount: number;
  transactionId: string;
};

export type TRejectAdmissionPayload = {
  applicationId: string;
  reason: string;
};