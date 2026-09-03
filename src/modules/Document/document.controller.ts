import { Request, Response } from "express";

import { DocumentService } from "./document.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getStudentIdCard = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await DocumentService.getStudentIdCardDataFromDB(
    studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student ID card data generated successfully!",
    data: result,
  });
});

const getTestimonial = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await DocumentService.getTestimonialDataFromDB(
    studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Testimonial data generated successfully!",
    data: result,
  });
});

export const DocumentController = {
  getStudentIdCard,
  getTestimonial,
};
