import { Request, Response } from "express";
import { MarkService } from "./mark.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const saveMark = catchAsync(async (req: Request, res: Response) => {
  const result = await MarkService.saveMarkIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mark saved successfully!",
    data: result,
  });
});

const getStudentMarksheet = catchAsync(async (req: Request, res: Response) => {
  const { examId, studentId } = req.params;
  const result = await MarkService.getStudentMarksheetFromDB(
    examId as string,
    studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student marksheet retrieved successfully!",
    data: result,
  });
});

export const MarkController = {
  saveMark,
  getStudentMarksheet,
};
