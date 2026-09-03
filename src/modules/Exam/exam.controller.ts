import { Request, Response } from "express";
import { ExamService } from "./exam.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createExam = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamService.createExamInDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Exam created successfully!",
    data: result,
  });
});

const getAllExams = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamService.getAllExamsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Exams retrieved successfully!",
    data: result,
  });
});

const saveStudentMark = catchAsync(async (req: Request, res: Response) => {
  const result = await ExamService.saveStudentMarkInDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student mark saved successfully!",
    data: result,
  });
});

const getStudentMarksheet = catchAsync(async (req: Request, res: Response) => {
  const { examId, studentId } = req.params;
  const result = await ExamService.getStudentMarksheetFromDB(
    examId as string,
    studentId as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Marksheet retrieved successfully!",
    data: result,
  });
});

export const ExamController = {
  createExam,
  getAllExams,
  saveStudentMark,
  getStudentMarksheet,
};
