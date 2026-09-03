import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { ExamController } from "./exam.controller";

const router = express.Router();

router.post(
  "/create-exam",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  ExamController.createExam,
);

router.get(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  ExamController.getAllExams,
);

router.post(
  "/save-mark",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  ExamController.saveStudentMark,
);

router.get(
  "/marksheet/:examId/:studentId",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER, Role.STUDENT),
  ExamController.getStudentMarksheet,
);

export const ExamRoutes = router;
