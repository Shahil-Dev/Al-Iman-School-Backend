import { PaymentMethod } from '@prisma/client';

export type TCreateInvoicePayload = {
  studentId: string;
  amount: number;
  dueDate: string;
};

export type TCollectPaymentPayload = {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string; // Trx ID provided by bKash/Nagad or Manual input
};