import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import { DocumentController } from './document.controller';

const router = express.Router();

router.get(
  '/id_card/:studentId',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.STUDENT),
  DocumentController.getStudentIdCard
);


router.get(
  '/testimonial/:studentId',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  DocumentController.getTestimonial
);

export const DocumentRoutes = router;