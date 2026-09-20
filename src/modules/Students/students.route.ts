import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { StudentController } from "./students.controller";

const router = express.Router();

router.get(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  StudentController.getAllStudents,
);

router.get(
  "/:id",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  StudentController.getSingleStudent,
);

router.patch(
  "/:id",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  StudentController.updateStudent,
);

router.delete(
  "/:id",
  authGuard(Role.SUPER_ADMIN),
  StudentController.deleteStudent,
);

export const StudentRoutes = router;
