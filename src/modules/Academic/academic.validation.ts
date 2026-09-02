import { z } from 'zod';

const createAcademicYearValidationSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Academic year title is required!' }),
    code: z.string({ message: 'Academic year code is required!' }),
    startDate: z.string({ message: 'Start date is required!' }),
    endDate: z.string({ message: 'End date is required!' }),
  }),
});

const createAcademicClassValidationSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Class title is required!' }),
    code: z.string({ message: 'Class code is required!' }),
  }),
});

const createAcademicSectionValidationSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Section title is required!' }),
    capacity: z.number({ message: 'Capacity must be a number!' }),
    classId: z.string({ message: 'Class ID is required!' }),
  }),
});

export const AcademicValidation = {
  createAcademicYearValidationSchema,
  createAcademicClassValidationSchema,
  createAcademicSectionValidationSchema,
};