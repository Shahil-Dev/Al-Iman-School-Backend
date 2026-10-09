import { PaymentMethod, TransactionStatus } from "@prisma/client";
import { z } from "zod";

const createFeeStructureValidationSchema = z.object({
  body: z.object({
    classId: z.string({ message: "Class ID is required!" }),
    feeHeadId: z.string({ message: "Fee Head ID is required!" }),
    amount: z.number({ message: "Amount is required!" }).positive("Amount must be positive"),
  }),
});

const createInvoiceValidationSchema = z.object({
  body: z.object({
    studentId: z.string({ message: "Student ID is required!" }),
    amount: z.number({ message: "Amount is required!" }).positive("Amount must be greater than 0"),
    dueDate: z.string({ message: "Due date is required!" }),
  }),
});

const generateMonthlyInvoicesValidationSchema = z.object({
  body: z.object({
    dueDate: z.string({ message: "Due date is required!" }),
  }),
});

const collectPaymentValidationSchema = z.object({
  body: z.object({
    invoiceId: z.string({ message: "Invoice ID is required!" }),
    amount: z.number({ message: "Payment amount is required!" }).positive(),
    method: z.nativeEnum(PaymentMethod, { message: "Invalid payment method!" }),
    transactionId: z.string().optional(),
    receiptUrl: z.string().optional(),
  }),
});

const approvePaymentValidationSchema = z.object({
  body: z.object({
    transactionId: z.string({ message: "Transaction ID is required!" }),
    status: z.nativeEnum(TransactionStatus, { message: "Invalid transaction status!" }),
    note: z.string().optional(),
  }),
});

export const PaymentValidation = {
  createFeeStructureValidationSchema,
  createInvoiceValidationSchema,
  generateMonthlyInvoicesValidationSchema,
  collectPaymentValidationSchema,
  approvePaymentValidationSchema,
};