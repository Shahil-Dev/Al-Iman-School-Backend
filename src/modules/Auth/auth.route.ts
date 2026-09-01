import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthController.loginUser);

// Protected route to get the profile of the logged-in user
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
