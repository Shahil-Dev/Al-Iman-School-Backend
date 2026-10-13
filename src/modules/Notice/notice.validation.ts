import { z } from 'zod';

const createNoticeValidationSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Title is required!' }).min(1, { message: 'Title cannot be empty!' }),
    content: z.string({ message: 'Content is required!' }).min(1, { message: 'Content cannot be empty!' }),
    targetGroup: z.string().optional().default('ALL'),
    attachment: z.string().optional(),
  }),
});

export const NoticeValidation = {
  createNoticeValidationSchema,
};