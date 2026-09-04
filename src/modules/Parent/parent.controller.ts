import { Request, Response } from "express";
import { ParentService } from "./parent.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

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

export const ParentController = {
  getMyChildren,
  getChildOverview,
};
