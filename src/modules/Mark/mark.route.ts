import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { MarkController } from './mark.controller';
import { MarkValidation } from './mark.validation';

const router = express.Router();

router.post(
  '/save-mark',
  authGuard(Role.SUPER_ADMIN, Role.TEACHER),
  validateRequest(MarkValidation.saveMarkValidationSchema),
  MarkController.saveMark
);

router.get(
  '/marksheet/:examId/:studentId',
  authGuard(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT),
  MarkController.getStudentMarksheet
);

export const MarkRoutes = router;