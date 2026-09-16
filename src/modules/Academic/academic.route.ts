import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { AcademicController } from "./academic.controller";
import { AcademicValidation } from "./academic.validation";

const router = express.Router();

const allowedRoles = [
  Role.SUPER_ADMIN,
  Role.ACCOUNTS,
  Role.TEACHER,
  Role.STUDENT,
  Role.PARENT,
];

// Academic Year Routes
router.post(
  "/create-year",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicYearValidationSchema),
  AcademicController.createAcademicYear
);

router.get(
  "/years",
  authGuard(...allowedRoles),
  AcademicController.getAllAcademicYears
);

// Academic Class Routes
router.post(
  "/create-class",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicClassValidationSchema),
  AcademicController.createAcademicClass
);

router.get(
  "/classes",
  authGuard(...allowedRoles),
  AcademicController.getAllAcademicClasses
);

// Academic Section Routes
router.post(
  "/create-section",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicSectionValidationSchema),
  AcademicController.createAcademicSection
);

router.get(
  "/sections",
  authGuard(...allowedRoles),
  AcademicController.getAllAcademicSections
);

// Academic Subject Routes
router.post(
  "/create-subject",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicSubjectValidationSchema),
  AcademicController.createAcademicSubject
);

router.get(
  "/subjects",
  authGuard(...allowedRoles),
  AcademicController.getAllAcademicSubjects
);

export const AcademicRoutes = router;