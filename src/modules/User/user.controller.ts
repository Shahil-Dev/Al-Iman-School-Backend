import { Request, Response } from "express";

import { UserService } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
// 1. Create Teacher Profile
const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createTeacherIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Teacher created successfully!",
    data: result,
  });
});
// 2. Create Student
const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createStudentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Student created successfully!",
    data: result,
  });
});
// 3. Create Parent Profile
const createParent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createParentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Parent profile created successfully!",
    data: result,
  });
});

export const UserController = {
  createTeacher,
  createStudent,
  createParent,
};
