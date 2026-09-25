import { Request, Response } from "express";
import { AttendanceService } from "./attendance.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const takeAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("\n==================================================");
  console.log("📥 [Controller Hit] POST /api/v1/attendances");
  console.log("📦 Payload Body:", JSON.stringify(req.body, null, 2));
  console.log("==================================================\n");

  const result = await AttendanceService.takeAttendanceIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance submitted successfully!",
    data: result,
  });
});

const getSectionAttendance = catchAsync(async (req: Request, res: Response) => {
  const { classId, sectionId, date } = req.query;

  const result = await AttendanceService.getSectionAttendanceFromDB(
    classId as string,
    sectionId as string,
    date as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance list retrieved successfully!",
    data: result,
  });
});

const getStudentAttendanceSummary = catchAsync(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const result = await AttendanceService.getStudentAttendanceSummaryFromDB(
      studentId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Student attendance summary retrieved successfully!",
      data: result,
    });
  }
);

export const AttendanceController = {
  takeAttendance,
  getSectionAttendance,
  getStudentAttendanceSummary,
};