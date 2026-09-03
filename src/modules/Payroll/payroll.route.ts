import express from 'express';
import { Role } from '@prisma/client';
import authGuard from '../../middlewares/authGuard';
import { PayrollController } from './payroll.controller';

const router = express.Router();


router.post(
  '/create',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  PayrollController.createPayroll
);


router.get(
  '/',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  PayrollController.getPayrolls
);


router.patch(
  '/pay/:id',
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  PayrollController.markAsPaid
);

export const PayrollRoutes = router;