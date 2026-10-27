import { Gender } from '@prisma/client';
import { z } from 'zod';

const registerTeacherValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Full Name is required!' }),
    email: z.string().email({ message: 'Valid email is required!' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long!' }),
    phone: z.string({ message: 'Mobile number is required!' }),

    designation: z.string({ message: 'Designation is required!' }),
    department: z.string().optional(),
    qualification: z.string().optional(),

    gender: z.nativeEnum(Gender, { message: 'Gender is required!' }),
    bloodGroup: z.string().optional(),
    nidOrPassport: z.string().optional(),

    classTeacherOfId: z.string().optional(),

    photoUrl: z.string().optional(),
  }),
});

const optionalText = z.string().trim().nullable().optional();

const updateTeacherValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty!' }).optional(),
    email: z.string().trim().email({ message: 'Valid email is required!' }).optional(),
    phone: z.string().trim().min(1, { message: 'Phone cannot be empty!' }).optional(),
    designation: z
      .string()
      .trim()
      .min(1, { message: 'Designation cannot be empty!' })
      .optional(),

    department: optionalText,
    qualification: optionalText,
    bloodGroup: optionalText,
    nidOrPassport: optionalText,

    gender: z.nativeEnum(Gender, { message: 'Invalid gender!' }).optional(),
    photoUrl: z.string().nullable().optional(),

    classTeacherOfId: z.string().nullable().optional(),
    replaceClassTeacher: z.boolean().optional(),
  }),
});

export const TeacherValidation = {
  registerTeacherValidationSchema,
  updateTeacherValidationSchema,
};