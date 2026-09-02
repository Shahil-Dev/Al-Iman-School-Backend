import { Request, Response } from "express";

import { SubjectService } from "./subject.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createSubject = catchAsync(async (req: Request, res: Response) => {
  const result = await SubjectService.createSubjectIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subject created successfully!",
    data: result,
  });
});

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const result = await SubjectService.getAllSubjectsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subjects retrieved successfully!",
    data: result,
  });
});

const getSubjectsByClass = catchAsync(async (req: Request, res: Response) => {
  const { classId } = req.params;
  const result = await SubjectService.getSubjectsByClassFromDB(
    classId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Class subjects retrieved successfully!",
    data: result,
  });
});

const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubjectService.updateSubjectIntoDB(
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subject updated successfully!",
    data: result,
  });
});

export const SubjectController = {
  createSubject,
  getAllSubjects,
  getSubjectsByClass,
  updateSubject,
};
