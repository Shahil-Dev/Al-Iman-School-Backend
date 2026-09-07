"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createInvoiceValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentId: zod_1.z.string({ message: 'Student ID is required!' }),
        amount: zod_1.z.number({ message: 'Amount is required!' }).positive('Amount must be greater than 0'),
        dueDate: zod_1.z.string({ message: 'Due date is required!' }),
    }),
});
const collectPaymentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        invoiceId: zod_1.z.string({ message: 'Invoice ID is required!' }),
        amount: zod_1.z.number({ message: 'Payment amount is required!' }).positive(),
        method: zod_1.z.nativeEnum(client_1.PaymentMethod, { message: 'Invalid payment method!' }),
        transactionId: zod_1.z.string().optional(),
    }),
});
exports.PaymentValidation = {
    createInvoiceValidationSchema,
    collectPaymentValidationSchema,
};
