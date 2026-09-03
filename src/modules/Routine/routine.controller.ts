import { Request, Response } from "express";
import { RoutineService } from "./routine.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createRoutineSlot = catchAsync(async (req: Request, res: Response) => {
  const result = await RoutineService.createRoutineSlotInDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Routine slot created successfully!",
    data: result,
  });
});

const getClassRoutine = catchAsync(async (req: Request, res: Response) => {
  const { classId, sectionId } = req.params;
  const result = await RoutineService.getClassRoutineFromDB(
    classId as string,
    sectionId as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Class routine retrieved successfully!",
    data: result,
  });
});

export const RoutineController = {
  createRoutineSlot,
  getClassRoutine,
};
