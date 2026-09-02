import { z } from 'zod';

const createAcademicYearValidationSchema = z.object({
  body: z.object({
    year: z.number({ message: 'Year is required and must be a number!' }),
    isCurrent: z.boolean().optional(),
  }),
});

const createAcademicClassValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Class name is required!' }),
    code: z.string({ message: 'Class code is required!' }),
  }),
});

export const AcademicValidation = {
  createAcademicYearValidationSchema,
  createAcademicClassValidationSchema,
};