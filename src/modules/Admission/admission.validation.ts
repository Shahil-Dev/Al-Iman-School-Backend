import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

const createAdmissionValidationSchema = z.object({
  body: z.object({
    studentName: z.string({ message: 'Student name is required!' }),
    email: z.string().email('Invalid email address!'),
    phone: z.string({ message: 'Phone number is required!' }),
    dateOfBirth: z.string({ message: 'Date of birth is required!' }),
    gender: z.string({ message: 'Gender is required!' }),
    address: z.string({ message: 'Address is required!' }),
    guardianName: z.string({ message: 'Guardian name is required!' }),
    guardianPhone: z.string({ message: 'Guardian phone is required!' }),
    classId: z.string({ message: 'Class ID is required!' }),
    paymentMethod: z.nativeEnum(PaymentMethod, { message: 'Invalid payment method!' }),
    senderPhone: z.string({ message: 'Sender phone number is required!' }),
    amount: z.number().positive('Amount must be greater than 0'),
    transactionId: z.string({ message: 'Transaction ID is required!' }),
  }),
});

const rejectAdmissionValidationSchema = z.object({
  body: z.object({
    reason: z.string({ message: 'Rejection reason is required!' }),
  }),
});

export const AdmissionValidation = {
  createAdmissionValidationSchema,
  rejectAdmissionValidationSchema,
};