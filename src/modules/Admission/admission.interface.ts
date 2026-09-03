import { PaymentMethod } from '@prisma/client';

export type TCreateAdmissionPayload = {
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  classId: string;
  paymentMethod: PaymentMethod;
  senderPhone: string;
  amount: number;
  transactionId: string;
};

export type TApproveAdmissionPayload = {
  applicationId: string;
};

export type TRejectAdmissionPayload = {
  applicationId: string;
  reason: string;
};