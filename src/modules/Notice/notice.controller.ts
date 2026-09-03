import { Request, Response } from "express";
import { NoticeService } from "./notice.service";
import { NoticeTarget } from "@prisma/client";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.createNoticeInDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Notice published successfully!",
    data: result,
  });
});

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
  const targetGroup = req.query.targetGroup as NoticeTarget;
  const result = await NoticeService.getAllNoticesFromDB(targetGroup);
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
