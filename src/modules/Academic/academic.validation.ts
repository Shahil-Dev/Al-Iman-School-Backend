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
    academicYearId: z.string({ message: 'Academic Year ID is required!' }),
  }),
});

const createAcademicSectionValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Section name is required!' }),
    classId: z.string({ message: 'Class ID is required!' }),
  }),
});

export const AcademicValidation = {
  createAcademicYearValidationSchema,
  createAcademicClassValidationSchema,
  createAcademicSectionValidationSchema,
};