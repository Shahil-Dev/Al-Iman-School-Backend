import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = express.Router();

router.post(
  '/create-invoice',
  authGuard(Role.SUPER_ADMIN),
  validateRequest(PaymentValidation.createInvoiceValidationSchema),
  PaymentController.createInvoice
);

router.post(
  '/collect',
  authGuard(Role.SUPER_ADMIN, Role.STUDENT, Role.PARENT),
  validateRequest(PaymentValidation.collectPaymentValidationSchema),
  PaymentController.collectPayment
);

router.get(
  '/student/:studentId',
  authGuard(Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT),
  PaymentController.getStudentInvoices
);

export const PaymentRoutes = router;