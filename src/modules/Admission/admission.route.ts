import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { AdmissionController } from './admission.controller';
import { AdmissionValidation } from './admission.validation';

const router = express.Router();

// Public Routes
router.post(
  '/apply',
  validateRequest(AdmissionValidation.createAdmissionValidationSchema),
  AdmissionController.submitAdmission
);

router.get('/track/:identifier', AdmissionController.trackAdmissionStatus);

// Admin & Accounts Routes
router.get(
  '/',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  AdmissionController.getAllApplications
);

router.patch(
  '/approve/:id',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  AdmissionController.approveAdmission
);

router.patch(
  '/reject/:id',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(AdmissionValidation.rejectAdmissionValidationSchema),
  AdmissionController.rejectAdmission
);

export const AdmissionRoutes = router;