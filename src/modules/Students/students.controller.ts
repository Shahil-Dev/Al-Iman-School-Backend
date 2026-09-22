import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StudentService } from "./students.service";

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.createStudentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Student created successfully!",
    data: result,
  });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.getAllStudentsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Students fetched successfully!",
    data: result,
  });
});

const getSingleStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentService.getSingleStudentFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student profile fetched successfully!",
    data: result,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentService.updateStudentInDB(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student updated successfully!",
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentService.deleteStudentFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student deleted successfully!",
    data: result,
  });
});

export const StudentController = {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};