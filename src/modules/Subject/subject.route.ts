import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { SubjectController } from './subject.controller';
import { SubjectValidation } from './subject.validation';

const router = express.Router();

router.post(
  '/',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(SubjectValidation.createSubjectValidationSchema),
  SubjectController.createSubject
);

router.get(
  '/',
  authGuard(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT, Role.ACCOUNTS),
  SubjectController.getAllSubjects
);

router.get(
  '/class/:classId',
  authGuard(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT, Role.ACCOUNTS),
  SubjectController.getSubjectsByClass
);

router.patch(
  '/:id',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(SubjectValidation.updateSubjectValidationSchema),
  SubjectController.updateSubject
);

export const SubjectRoutes = router;