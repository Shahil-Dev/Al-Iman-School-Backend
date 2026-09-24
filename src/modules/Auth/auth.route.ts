import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.get(
  "/me",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  ),
  AuthController.getMyProfile,
);

router.patch(
  "/change-password",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  ),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

export const AuthRoutes = router;
