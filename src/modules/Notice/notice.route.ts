import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { NoticeController } from "./notice.controller";

const router = express.Router();

// 1. Create Notice (Only Super Admin & Accounts/Admin)
router.post(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  NoticeController.createNotice
);

// 2. Get All Notices with Role-Based Authentication & Filtering
router.get(
  "/",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT
  ),
  NoticeController.getAllNotices
);

// 3. Delete Notice
router.delete(
  "/:id",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  NoticeController.deleteNotice
);

export const NoticeRoutes = router;