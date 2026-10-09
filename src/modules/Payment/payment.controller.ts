import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const setFeeStructure = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.setFeeStructureInDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Class fee structure updated successfully!",
    data: result,
  });
});

const generateMonthlyInvoices = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.generateMonthlyInvoicesInDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: `Monthly invoices generated successfully for ${result.createdCount} students!`,
    data: result,
  });
});

const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createInvoiceIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Invoice generated successfully!",
    data: result,
  });
});

const collectPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.processPaymentInDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment transaction recorded successfully!",
    data: result,
  });
});

const approvePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.approveOrRejectPaymentInDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment approval status updated successfully!",
    data: result,
  });
});

const getPendingApprovals = catchAsync(async (_req: Request, res: Response) => {
  const result = await PaymentService.getPendingApprovalsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pending payment approvals retrieved successfully!",
    data: result,
  });
});

const getOverdueInvoices = catchAsync(async (_req: Request, res: Response) => {
  const result = await PaymentService.getOverdueInvoicesFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Overdue defaulter list retrieved successfully!",
    data: result,
  });
});

const getStudentInvoices = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await PaymentService.getStudentInvoicesFromDB(studentId as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student invoices fetched successfully!",
    data: result,
  });
});

const getAllInvoices = catchAsync(async (_req: Request, res: Response) => {
  const result = await PaymentService.getAllInvoicesFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All invoices retrieved successfully!",
    data: result,
  });
});

export const PaymentController = {
  setFeeStructure,
  generateMonthlyInvoices,
  createInvoice,
  collectPayment,
  approvePayment,
  getPendingApprovals,
  getOverdueInvoices,
  getStudentInvoices,
  getAllInvoices,
};