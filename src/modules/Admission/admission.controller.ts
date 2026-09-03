import { Request, Response } from "express";

import { AdmissionService } from "./admission.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const submitAdmission = catchAsync(async (req: Request, res: Response) => {
  const result = await AdmissionService.submitAdmissionIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message:
      "Admission form submitted successfully! Please wait for admin approval.",
    data: result,
  });
});

const trackAdmissionStatus = catchAsync(async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const result = await AdmissionService.trackAdmissionStatusFromDB(identifier as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admission status fetched successfully!",
    data: result,
  });
});

const approveAdmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdmissionService.approveAdmissionInDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admission approved and student profile created successfully!",
    data: result,
  });
});

const rejectAdmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdmissionService.rejectAdmissionInDB({
    applicationId: id as string,
    reason: req.body.reason,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admission application rejected and student notified via email.",
    data: result,
  });
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const result = await AdmissionService.getAllApplicationsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Applications retrieved successfully!",
    data: result,
  });
});

export const AdmissionController = {
  submitAdmission,
  trackAdmissionStatus,
  approveAdmission,
  rejectAdmission,
  getAllApplications,
};
