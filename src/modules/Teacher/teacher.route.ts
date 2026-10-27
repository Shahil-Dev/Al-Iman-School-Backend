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

// Public: approved teachers with name, designation and class teacher only
router.get('/', TeacherController.getAllTeachers);

// Admin Only: full teacher list used by the edit form
// router.get(
//   '/admin/all',
//   authGuard(Role.SUPER_ADMIN),
//   TeacherController.getAllTeachersForAdmin
// );

// Admin Only: Update Teacher Profile Info
router.patch(
  '/:id',
  authGuard(Role.SUPER_ADMIN),
  validateRequest(TeacherValidation.updateTeacherValidationSchema),
  TeacherController.updateTeacher
);

// Admin Only: Permanently Delete Teacher Profile & User Account
router.delete(
  '/:id',
  authGuard(Role.SUPER_ADMIN),
  TeacherController.deleteTeacher
);

export const TeacherRoutes = router;