import { Request, Response } from 'express';
import { PayrollService } from './payroll.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createPayroll = catchAsync(async (req: Request, res: Response) => {
  const result = await PayrollService.createPayrollInDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher payroll generated successfully!',
    data: result,
  });
});

const getPayrolls = catchAsync(async (req: Request, res: Response) => {
  const { month, year } = req.query;
  const result = await PayrollService.getPayrollsFromDB(
    month as string,
    year ? Number(year) : undefined
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payroll list retrieved successfully!',
    data: result,
  });
});

const markAsPaid = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PayrollService.markPayrollAsPaidInDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payroll marked as PAID successfully!',
    data: result,
  });
});

export const PayrollController = {
  createPayroll,
  getPayrolls,
  markAsPaid,
};