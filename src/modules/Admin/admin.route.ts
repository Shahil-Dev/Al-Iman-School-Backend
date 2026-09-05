import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get(
  "/analytics",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  AdminController.getDashboardAnalytics,
);

router.get(
  "/due-report",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  AdminController.getStudentDueReport,
);

router.patch(
  "/reset-password",
  authGuard(Role.SUPER_ADMIN),
  AdminController.resetUserPassword,
);

export const AdminRoutes = router;
