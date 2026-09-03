import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

const createInvoiceValidationSchema = z.object({
  body: z.object({
    studentId: z.string({ message: 'Student ID is required!' }),
    amount: z.number({ message: 'Amount is required!' }).positive('Amount must be greater than 0'),
    dueDate: z.string({ message: 'Due date is required!' }),
  }),
});

const collectPaymentValidationSchema = z.object({
  body: z.object({
    invoiceId: z.string({ message: 'Invoice ID is required!' }),
    amount: z.number({ message: 'Payment amount is required!' }).positive(),
    method: z.nativeEnum(PaymentMethod, { message: 'Invalid payment method!' }),
    transactionId: z.string().optional(),
  }),
});

export const PaymentValidation = {
  createInvoiceValidationSchema,
  collectPaymentValidationSchema,
};