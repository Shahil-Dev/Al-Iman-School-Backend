import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({
      message: 'Email or User ID is required!',
    }),
    password: z.string({
      message: 'Password is required!',
    }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
};