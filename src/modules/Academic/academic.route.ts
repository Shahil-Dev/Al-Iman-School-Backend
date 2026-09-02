import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { AcademicController } from "./academic.controller";
import { AcademicValidation } from "./academic.validation";

const router = express.Router();

// Academic Year Routes
router.post(
  "/create-year",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicYearValidationSchema),
  AcademicController.createAcademicYear,
);

router.get(
  "/years",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  ),
  AcademicController.getAllAcademicYears,
);

// Academic Class Routes
router.post(
  "/create-class",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicClassValidationSchema),
  AcademicController.createAcademicClass,
);

router.get(
  "/classes",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  ),
  AcademicController.getAllAcademicClasses,
);

router.post(
  "/create-section",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AcademicValidation.createAcademicSectionValidationSchema),
  AcademicController.createAcademicSection,
);

// Academic Section Route
router.post(
  "/create-section",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  AcademicController.createAcademicSection,
);

export const AcademicRoutes = router;
