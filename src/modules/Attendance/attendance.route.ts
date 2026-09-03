import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { AttendanceController } from "./attendance.controller";
import { AttendanceValidation } from "./attendance.validation";

const router = express.Router();

router.post(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.TEACHER),
  validateRequest(AttendanceValidation.createAttendanceValidationSchema),
  AttendanceController.takeAttendance,
);

router.get(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.TEACHER),
  AttendanceController.getSectionAttendance,
);

router.get(
  "/summary/:studentId",
  authGuard(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT),
  AttendanceController.getStudentAttendanceSummary,
);

export const AttendanceRoutes = router;
