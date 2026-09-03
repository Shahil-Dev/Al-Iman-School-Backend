import { Request, Response } from 'express';

import { PaymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createInvoiceIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Invoice generated successfully!',
    data: result,
  });
});

const collectPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.processPaymentInDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment recorded successfully!',
    data: result,
  });
});

const getStudentInvoices = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await PaymentService.getStudentInvoicesFromDB(studentId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invoices fetched successfully!',
    data: result,
  });
});

export const PaymentController = {
  createInvoice,
  collectPayment,
  getStudentInvoices,
};