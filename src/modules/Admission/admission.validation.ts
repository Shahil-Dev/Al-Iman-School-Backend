import { Gender, PaymentMethod } from "@prisma/client";
import { z } from "zod";

const createAdmissionValidationSchema = z.object({
  body: z
    .object({
      // Personal Information
      studentName: z.string({ message: "Student name is required!" }),
      gender: z.nativeEnum(Gender, { message: "Gender is required!" }),
      dateOfBirth: z.string({ message: "Date of birth is required!" }),
      religion: z.string({ message: "Religion is required!" }),
      country: z.string({ message: "Country is required!" }),
      bloodGroup: z.string().optional(),
      nationality: z.string({ message: "Nationality is required!" }),
      birthRegNo: z.string().optional(),

      // Parents Information
      fatherName: z.string({ message: "Father's name is required!" }),
      fatherOccupation: z.string().optional(),
      fatherNid: z.string().optional(),
      motherName: z.string({ message: "Mother's name is required!" }),
      motherOccupation: z.string().optional(),
      motherNid: z.string().optional(),
      guardianName: z.string().optional(),
      guardianOccupation: z.string().optional(),

      // Contact Information
      phone: z.string({ message: "Contact / SMS mobile number is required!" }),
      altPhone: z.string().optional(),
      email: z.string().email("Invalid email address!"),
      guardianPhone: z.string({
        message: "Father / Guardian mobile number is required!",
      }),
      guardianEmail: z.string().email().optional().or(z.literal("")),
      guardianAddress: z.string().optional(),

      // Additional & Health Information
      passportNo: z.string().optional(),
      passportExpiryDate: z.string().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      healthConditions: z.array(z.string()).optional(),
      siblingStudentId: z.string().optional(),
      admitOtherKids: z.boolean().optional(),

      // Address
      presentAddress: z.string({ message: "Present address is required!" }),
      permanentAddress: z.string({ message: "Permanent address is required!" }),
      sameAsPresent: z.boolean().optional(),

      // Previous Education & Media
      prevInstituteName: z.string().optional(),
      prevInstituteAddress: z.string().optional(),
      references: z.string().optional(),
      photoUrl: z.string().optional(),

      // Academic & Payment Information
      classId: z.string({ message: "Class ID is required!" }),
      paymentMethod: z.nativeEnum(PaymentMethod, {
        message: "Payment method is required!",
      }),
      senderPhone: z.string().trim().optional(),
      senderAccountNo: z.string().trim().optional(),
      amount: z.number().positive("Amount must be greater than 0"),
      transactionId: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      const isMobileBanking =
        data.paymentMethod === PaymentMethod.BKASH ||
        data.paymentMethod === PaymentMethod.NAGAD;

      // bKash / Nagad: sender phone and transaction ID are required
      if (isMobileBanking) {
        if (!data.senderPhone) {
          ctx.addIssue({
            code: "custom",
            path: ["senderPhone"],
            message: "Sender phone number is required!",
          });
        }
        if (!data.transactionId) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionId"],
            message: "Transaction ID is required!",
          });
        }
      }

      // Bank deposit: the sender's account number is required
      if (data.paymentMethod === PaymentMethod.SSLCOMMERZ && !data.senderAccountNo) {
        ctx.addIssue({
          code: "custom",
          path: ["senderAccountNo"],
          message: "Bank account number is required!",
        });
      }

      // CASH: no payment details are needed
    }),
});

const rejectAdmissionValidationSchema = z.object({
  body: z.object({
    reason: z.string({ message: "Rejection reason is required!" }),
  }),
});

export const AdmissionValidation = {
  createAdmissionValidationSchema,
  rejectAdmissionValidationSchema,
};