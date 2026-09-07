"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAdmissionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentName: zod_1.z.string({ message: 'Student name is required!' }),
        email: zod_1.z.string().email('Invalid email address!'),
        phone: zod_1.z.string({ message: 'Phone number is required!' }),
        dateOfBirth: zod_1.z.string({ message: 'Date of birth is required!' }),
        gender: zod_1.z.string({ message: 'Gender is required!' }),
        address: zod_1.z.string({ message: 'Address is required!' }),
        guardianName: zod_1.z.string({ message: 'Guardian name is required!' }),
        guardianPhone: zod_1.z.string({ message: 'Guardian phone is required!' }),
        classId: zod_1.z.string({ message: 'Class ID is required!' }),
        paymentMethod: zod_1.z.nativeEnum(client_1.PaymentMethod, { message: 'Invalid payment method!' }),
        senderPhone: zod_1.z.string({ message: 'Sender phone number is required!' }),
        amount: zod_1.z.number().positive('Amount must be greater than 0'),
        transactionId: zod_1.z.string({ message: 'Transaction ID is required!' }),
    }),
});
const rejectAdmissionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string({ message: 'Rejection reason is required!' }),
    }),
});
exports.AdmissionValidation = {
    createAdmissionValidationSchema,
    rejectAdmissionValidationSchema,
};
