import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.post(
  '/create-teacher',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(UserValidation.createTeacherValidationSchema),
  UserController.createTeacher
);

router.post(
  '/create-student',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(UserValidation.createStudentValidationSchema),
  UserController.createStudent
);

export const UserRoutes = router;