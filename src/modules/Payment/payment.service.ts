import { PaymentStatus } from "@prisma/client";

import {
  TCollectPaymentPayload,
  TCreateInvoicePayload,
} from "./payment.interface";
import prisma from "../../lib/prisma";

// 1. Generate Invoice (Auto-generated Unique Invoice No)
const createInvoiceIntoDB = async (payload: TCreateInvoicePayload) => {
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

  const result = await prisma.studentInvoice.create({
    data: {
      invoiceNo,
      studentId: payload.studentId,
      amount: payload.amount,
      dueDate: new Date(payload.dueDate),
      status: PaymentStatus.PENDING,
    },
  });

  return result;
};

// 2. Process Payment (Handles Cash, Sandbox & Manual TrxID)
const processPaymentInDB = async (payload: TCollectPaymentPayload) => {
  const { invoiceId, amount, method, transactionId } = payload;

  const invoice = await prisma.studentInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error("Invoice not found!");
  }

  if (invoice.status === PaymentStatus.PAID) {
    throw new Error("This invoice is already fully paid!");
  }

  // Atomically record Transaction and update Invoice using Prisma Transaction
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.paymentTransaction.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId: transactionId || `CASH-${Date.now()}`,
        status: PaymentStatus.PAID,
      },
    });

    const updatedPaidAmount = invoice.paidAmount + amount;
    const isFullyPaid = updatedPaidAmount >= invoice.amount;

    const updatedInvoice = await tx.studentInvoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: updatedPaidAmount,
        status: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
      },
    });

    return { transaction, invoice: updatedInvoice };
  });

  return result;
};

// 3. Get Invoice Details by Student ID
const getStudentInvoicesFromDB = async (studentId: string) => {
  const result = await prisma.studentInvoice.findMany({
    where: { studentId },
    include: {
      transactions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

export const PaymentService = {
  createInvoiceIntoDB,
  processPaymentInDB,
  getStudentInvoicesFromDB,
};
