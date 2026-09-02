import { Request, Response } from 'express';

import { UserService } from './user.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createTeacherIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher created successfully!',
    data: result,
  });
});

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createStudentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student created successfully!',
    data: result,
  });
});

export const UserController = {
  createTeacher,
  createStudent,
};