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
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully!",
      data: (req as any).user,
    });
  },
);

export const AuthRoutes = router;
