import { Request, Response } from "express";
import { NoticeService } from "./notice.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NoticeTarget } from "@prisma/client";

const createNotice = catchAsync(async (req: Request, res: Response) => {
  let { targetGroup, ...restData } = req.body;

  // Map singular/frontend values to match Prisma enum plural values safely
  if (targetGroup) {
    const upperTarget = String(targetGroup).toUpperCase();
    if (upperTarget === "STUDENT") targetGroup = NoticeTarget.STUDENTS;
    else if (upperTarget === "TEACHER") targetGroup = NoticeTarget.TEACHERS;
    else if (upperTarget === "PARENT") targetGroup = NoticeTarget.PARENTS;
    else if (upperTarget === "ALL") targetGroup = NoticeTarget.ALL;
  }

  const payload = {
    ...restData,
    targetGroup: targetGroup || NoticeTarget.ALL,
  };

  const result = await NoticeService.createNoticeInDB(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Notice created successfully!",
    data: result,
  });
});

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
  const { targetGroup } = req.query;
  let formattedTarget = targetGroup as string;

  if (formattedTarget) {
    const upperTarget = formattedTarget.toUpperCase();
    if (upperTarget === "STUDENT") formattedTarget = "STUDENTS";
    else if (upperTarget === "TEACHER") formattedTarget = "TEACHERS";
    else if (upperTarget === "PARENT") formattedTarget = "PARENTS";
  }

  const result = await NoticeService.getAllNoticesFromDB(formattedTarget);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notices retrieved successfully!",
    data: result,
  });
});

const deleteNotice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NoticeService.deleteNoticeFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notice deleted successfully!",
    data: result,
  });
});

export const NoticeController = {
  createNotice,
  getAllNotices,
  deleteNotice,
};