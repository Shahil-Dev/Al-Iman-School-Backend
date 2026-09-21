import express from 'express';
import { Role } from '@prisma/client';
import { TeacherController } from './teacher.controller';
import { TeacherValidation } from './teacher.validation';
import validateRequest from '../../middlewares/validateRequest';
import authGuard from '../../middlewares/authGuard';

const router = express.Router();

// Public: Teacher Self Registration
router.post(
  '/register',
  validateRequest(TeacherValidation.registerTeacherValidationSchema),
  TeacherController.registerTeacher
);

// Admin Only: Get Pending Teachers
router.get(
  '/pending-teachers',
  authGuard(Role.SUPER_ADMIN),
  TeacherController.getPendingTeachers
);

// Admin Only: Approve Teacher Account
router.patch(
  '/approve/:id',
  authGuard(Role.SUPER_ADMIN),
  TeacherController.approveTeacher
);

// Public / Authenticated: Get All Active Teachers List
router.get('/', TeacherController.getAllTeachers);

export const TeacherRoutes = router;