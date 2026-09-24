import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({
      message: "Email or User ID is required!",
    }),
    password: z.string({
      message: "Password is required!",
    }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: "Old password is required!",
    }),
    newPassword: z
      .string({
        message: "New password is required!",
      })
      .min(6, "Password must be at least 6 characters long!"),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
};
