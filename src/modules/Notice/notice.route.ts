import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { NoticeController } from "./notice.controller";

const router = express.Router();

router.post(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  NoticeController.createNotice,
);

router.get("/", NoticeController.getAllNotices);

router.delete(
  "/:id",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  NoticeController.deleteNotice,
);

router.get(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT),
  NoticeController.getAllNotices,
);

export const NoticeRoutes = router;
