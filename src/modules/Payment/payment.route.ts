import { Role } from "@prisma/client";
import express from "express";
import authGuard from "../../middlewares/authGuard";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/fee-structure",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(PaymentValidation.createFeeStructureValidationSchema),
  PaymentController.setFeeStructure
);

router.post(
  "/generate-monthly-invoices",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(PaymentValidation.generateMonthlyInvoicesValidationSchema),
  PaymentController.generateMonthlyInvoices
);

router.post(
  "/create-invoice",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(PaymentValidation.createInvoiceValidationSchema),
  PaymentController.createInvoice
);

router.post(
  "/collect",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.STUDENT, Role.PARENT),
  validateRequest(PaymentValidation.collectPaymentValidationSchema),
  PaymentController.collectPayment
);

router.patch(
  "/approve-payment",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  validateRequest(PaymentValidation.approvePaymentValidationSchema),
  PaymentController.approvePayment
);

router.get(
  "/pending-approvals",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  PaymentController.getPendingApprovals
);

router.get(
  "/overdue-defaulters",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  PaymentController.getOverdueInvoices
);

router.get(
  "/student/:studentId",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER, Role.STUDENT, Role.PARENT),
  PaymentController.getStudentInvoices
);

router.get(
  "/",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  PaymentController.getAllInvoices
);

export const PaymentRoutes = router;