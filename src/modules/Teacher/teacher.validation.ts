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

    photoUrl: z.string().optional(),
  }),
});

export const TeacherValidation = {
  registerTeacherValidationSchema,
};