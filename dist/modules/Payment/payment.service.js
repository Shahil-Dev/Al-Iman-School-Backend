"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
// 1. Generate Invoice (Auto-generated Unique Invoice No)
const createInvoiceIntoDB = async (payload) => {
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const result = await prisma_1.default.studentInvoice.create({
        data: {
            invoiceNo,
            studentId: payload.studentId,
            amount: payload.amount,
            dueDate: new Date(payload.dueDate),
            status: client_1.PaymentStatus.PENDING,
        },
    });
    return result;
};
// 2. Process Payment (Handles Cash, Sandbox & Manual TrxID)
const processPaymentInDB = async (payload) => {
    const { invoiceId, amount, method, transactionId } = payload;
    const invoice = await prisma_1.default.studentInvoice.findUnique({
        where: { id: invoiceId },
    });
    if (!invoice) {
        throw new Error("Invoice not found!");
    }
    if (invoice.status === client_1.PaymentStatus.PAID) {
        throw new Error("This invoice is already fully paid!");
    }
    // Atomically record Transaction and update Invoice using Prisma Transaction
    const result = await prisma_1.default.$transaction(async (tx) => {
        const transaction = await tx.paymentTransaction.create({
            data: {
                invoiceId,
                amount,
                method,
                transactionId: transactionId || `CASH-${Date.now()}`,
                status: client_1.PaymentStatus.PAID,
            },
        });
        const updatedPaidAmount = invoice.paidAmount + amount;
        const isFullyPaid = updatedPaidAmount >= invoice.amount;
        const updatedInvoice = await tx.studentInvoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: updatedPaidAmount,
                status: isFullyPaid ? client_1.PaymentStatus.PAID : client_1.PaymentStatus.PARTIAL,
            },
        });
        return { transaction, invoice: updatedInvoice };
    });
    return result;
};
// 3. Get Invoice Details by Student ID
const getStudentInvoicesFromDB = async (studentId) => {
    const result = await prisma_1.default.studentInvoice.findMany({
        where: { studentId },
        include: {
            transactions: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return result;
};
exports.PaymentService = {
    createInvoiceIntoDB,
    processPaymentInDB,
    getStudentInvoicesFromDB,
};
