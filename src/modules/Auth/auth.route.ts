import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// 1. General User Login
router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

// 2. Student Direct Login (Fixed Controller & Validation)
router.post(
  "/student-login",
  validateRequest(AuthValidation.studentLoginValidationSchema),
  AuthController.studentLogin,
);

// 3. Get Logged-in User Profile
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

// 4. Change Password
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