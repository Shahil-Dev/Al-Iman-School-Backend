import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { StudentController } from "./students.controller";

const router = express.Router();

router.post("/", authGuard(Role.SUPER_ADMIN), StudentController.createStudent);

router.get(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.TEACHER),
  StudentController.getAllStudents,
);

router.get(
  "/:id",
  authGuard(Role.SUPER_ADMIN, Role.TEACHER),
  StudentController.getSingleStudent,
);

router.patch(
  "/:id",
  authGuard(Role.SUPER_ADMIN),
  StudentController.updateStudent,
);

router.delete(
  "/:id",
  authGuard(Role.SUPER_ADMIN),
  StudentController.deleteStudent,
);

export const StudentRoutes = router;
