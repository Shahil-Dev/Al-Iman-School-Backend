import { z } from 'zod';

const saveMarkValidationSchema = z.object({
  body: z.object({
    examId: z.string({ message: 'Exam ID is required!' }),
    studentId: z.string({ message: 'Student ID is required!' }),
    subjectId: z.string({ message: 'Subject ID is required!' }),
    mtMarks: z.number().min(0).optional().default(0),
    terminal: z.number().min(0, { message: 'Terminal marks must be at least 0' }),
  }),
});

const saveBulkMarksValidationSchema = z.object({
  body: z.object({
    examId: z.string({ message: 'Exam ID is required!' }),
    subjectId: z.string({ message: 'Subject ID is required!' }),
    marks: z.array(
      z.object({
        studentId: z.string({ message: 'Student ID is required!' }),
        mtMarks: z.number().min(0).optional().default(0),
        terminal: z.number().min(0, { message: 'Terminal marks must be at least 0' }),
      })
    ).min(1, { message: 'At least one student mark must be provided' }),
  }),
});

export const MarkValidation = {
  saveMarkValidationSchema,
  saveBulkMarksValidationSchema,
};