import { z } from 'zod';

const createSubjectValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Subject name is required!' }),
    code: z.string({ message: 'Subject code is required!' }),
    fullMarks: z.number().optional().default(100),
    hasMT: z.boolean().optional().default(true),
    classId: z.string({ message: 'Class ID is required!' }),
    teacherId: z.string().optional(),
  }),
});

export const SubjectValidation = {
  createSubjectValidationSchema,
};