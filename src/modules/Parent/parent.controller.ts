import { Request, Response } from "express";
import { ParentService } from "./parent.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const registerParent = catchAsync(async (req: Request, res: Response) => {
  const result = await ParentService.registerParentInDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Parent registered successfully!",
    data: result,
  });
});

const getAllParents = catchAsync(async (req: Request, res: Response) => {
  const result = await ParentService.getAllParentsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All parent profiles retrieved successfully!",
    data: result,
  });
});

const getSingleParent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ParentService.getSingleParentFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Parent profile retrieved successfully!",
    data: result,
  });
});

const getMyChildren = catchAsync(async (req: Request, res: Response) => {
  const parentUserId = (req as any).user.id;
  const result = await ParentService.getMyChildrenFromDB(parentUserId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Children list retrieved successfully!",
    data: result,
  });
});

const getChildOverview = catchAsync(async (req: Request, res: Response) => {
  const parentUserId = (req as any).user.id;
  const { studentId } = req.params;
  const result = await ParentService.getChildOverviewFromDB(
    parentUserId,
    studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Child academic overview retrieved successfully!",
    data: result,
  });
});

const assignStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await ParentService.assignStudentToParentInDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student assigned to parent successfully!",
    data: result,
  });
});

const removeStudent = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const result = await ParentService.removeStudentFromParentInDB(
    studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student removed from parent successfully!",
    data: result,
  });
});

const getFullStudentAccess = catchAsync(async (req: Request, res: Response) => {
  const parentUserId = (req as any).user.id;
  const { studentId } = req.params;

  const result = await ParentService.getFullStudentAccessForParentInDB(
    parentUserId,
    studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Full student control panel data retrieved successfully!",
    data: result,
  });
});

const updateParentProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ParentService.updateParentProfileInDB(
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Parent profile updated successfully!",
    data: result,
  });
});

export const ParentController = {
  registerParent,
  getAllParents,
  getSingleParent,
  getMyChildren,
  getChildOverview,
  assignStudent,
  removeStudent,
  getFullStudentAccess,
  updateParentProfile,
};