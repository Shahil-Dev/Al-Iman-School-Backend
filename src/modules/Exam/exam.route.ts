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

// Fixed: Added Role.PARENT & Role.ADMIN access for exam dropdown/list
router.get(
  "/",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.PARENT,
    Role.STUDENT,
  ),
  ExamController.getAllExams,
);

router.post(
  "/save-mark",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  ExamController.saveStudentMark,
);

router.get(
  "/marksheet/:examId/:studentId",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.PARENT,
    Role.STUDENT,
  ),
  ExamController.getStudentMarksheet,
);

export const ExamRoutes = router;
