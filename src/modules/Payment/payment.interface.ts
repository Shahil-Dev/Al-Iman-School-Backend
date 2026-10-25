import { PaymentMethod, TransactionStatus } from "@prisma/client";

export type TCreateFeeStructurePayload = {
  classId: string;
  feeHeadId: string;
  amount: number;
};

export type TCreateInvoicePayload = {
  studentId: string;
  amount: number;
  dueDate: string;
  reason?: string;
};

export type TGenerateMonthlyInvoicesPayload = {
  monthTitle: string; // e.g. "Monthly Tuition Fee - October 2026"
  dueDate: string; // e.g. "2026-10-10"
  reason?: string;
};

export type TCollectPaymentPayload = {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  senderAccountNo?: string; // Bank account number the payer sent from
  receiptUrl?: string; // Receipt screenshot URL
};

export type TApprovePaymentPayload = {
  transactionId: string;
  status: TransactionStatus; // APPROVED or REJECTED
  note?: string;
};
