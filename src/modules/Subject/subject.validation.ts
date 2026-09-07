import { z } from "zod";

const createSubjectValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: "Subject name is required!" }),
    code: z.string({ message: "Subject code is required!" }),
    fullMarks: z.number().optional().default(100),
    hasMT: z.boolean().optional().default(true),
    classId: z.string({ message: "Class ID is required!" }),
    teacherId: z.string().optional(),
  }),
});

const updateSubjectValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    fullMarks: z.number().optional(),
    hasMT: z.boolean().optional(),
    classId: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

export const SubjectValidation = {
  createSubjectValidationSchema,
  updateSubjectValidationSchema,
};
