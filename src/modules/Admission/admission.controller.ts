import { Request, Response } from 'express';
import { AdmissionService } from './admission.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import prisma from '../../lib/prisma';

const submitAdmission = catchAsync(async (req: Request, res: Response) => {
  const result = await AdmissionService.submitAdmissionIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Admission form submitted successfully! Please wait for admin approval.',
    data: result,
  });
});

const trackAdmissionStatus = catchAsync(async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const result = await AdmissionService.trackAdmissionStatusFromDB(identifier as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission status fetched successfully!',
    data: result,
  });
});

const approveAdmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdmissionService.approveAdmissionInDB(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission approved and student profile created successfully!',
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
    message: 'Admission application rejected and student notified via email.',
    data: result,
  });
});

// 5. Get Applications with Dynamic Filters
const getAllApplicationsFromDB = async (query: any) => {
  const { status, classId, searchTerm } = query;
  const andConditions: any[] = [];

  if (status && status !== "ALL") {
    andConditions.push({ status });
  }

  // Class Filter Check
  if (classId && classId !== "ALL") {
    andConditions.push({ classId });
  }

  // Search Term Check 
  if (searchTerm && searchTerm.trim() !== "") {
    andConditions.push({
      OR: [
        { studentName: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { transactionId: { contains: searchTerm, mode: "insensitive" } },
        { applicationNo: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  return await prisma.admissionApplication.findMany({
    where: whereConditions,
    include: {
      class: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const AdmissionController = {
  submitAdmission,
  trackAdmissionStatus,
  approveAdmission,
  rejectAdmission,
  getAllApplicationsFromDB,
};